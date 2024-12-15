import { getURL } from '@shared/extension';
import { HostMeta } from './types';

let hostsMeta: HostMeta[];

export function getHostMeta(
  host: string,
  filter?: (meta: HostMeta) => boolean,
  multiple?: false,
): Promise<HostMeta | undefined>;
export function getHostMeta(
  host: string,
  filter: (meta: HostMeta) => boolean,
  multiple: true,
): Promise<HostMeta[]>;

export async function getHostMeta(
  host: string,
  filter: (meta: HostMeta) => boolean = (): boolean => true,
  multiple?: boolean,
): Promise<HostMeta[] | HostMeta | undefined> {
  if (!hostsMeta) {
    const fetchData = await fetch(getURL('hosts.json'));
    const jsonData = (await fetchData.json()) as HostMeta[];

    hostsMeta = jsonData;
  }

  const filterFn = (meta: HostMeta): boolean => {
    const matchUrl = (matchPattern: string): boolean => {
      if (matchPattern === '<all_urls>') {
        return true;
      }

      const [patternSchema, patternUrl] = matchPattern.split('://', 2);
      const [patternHost, patternPath] = patternUrl.split(/\/(.*)/, 2);
      const [hostSchema, hostUrl] = host.split('://', 2);
      const [hostHost, hostPath] = hostUrl.split(/\/(.*)/, 2);

      if (patternSchema === '*' && !['http', 'https'].includes(hostSchema)) {
        return false;
      }

      if (patternSchema !== '*' && patternSchema !== hostSchema) {
        return false;
      }

      const hostRegex = new RegExp(`^${patternHost.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
      const pathRegex = new RegExp(`^${patternPath.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);

      if (!hostHost.match(hostRegex)) {
        return false;
      }

      if (!hostPath.match(pathRegex)) {
        return false;
      }

      return true;
    };

    return Array.isArray(meta.host) ? meta.host.some(matchUrl) : matchUrl(meta.host);
  };

  const checkHosts = hostsMeta.filter(filterFn);

  return multiple ? checkHosts.filter(filter) : checkHosts.find(filter);
}
