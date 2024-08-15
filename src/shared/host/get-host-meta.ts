import { getURL } from '@shared/extension/get-url';

type HostMeta = {
  host: string | string[];
  disabled?: boolean;
  parse?: string;
};

let hostsMeta: HostMeta[];

export const getHostMeta = async (host: string): Promise<HostMeta | undefined> => {
  if (!hostsMeta) {
    const fetchData = await fetch(getURL('hosts.json'));
    const jsonData = await fetchData.json();

    hostsMeta = jsonData;
  }

  return hostsMeta.find((meta) => {
    const matchUrl = (matchPattern: string): boolean => {
      const [patternSchema, patternUrl] = matchPattern.split('://', 2);
      const [patternHost, patternPath] = patternUrl.split(/\/(.*)/, 2);
      const [hostSchema, hostUrl] = host.split('://', 2);
      const [hostHost, hostPath] = hostUrl.split(/\/(.*)/, 2);

      if (patternSchema === '*' && !['http', 'https'].includes(hostSchema)) return false;
      if (patternSchema !== '*' && patternSchema !== hostSchema) return false;

      const hostRegex = new RegExp(`^${patternHost.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);
      const pathRegex = new RegExp(`^${patternPath.replace(/\./g, '\\.').replace(/\*/g, '.*')}$`);

      if (!hostHost.match(hostRegex)) return false;
      if (!hostPath.match(pathRegex)) return false;

      return true;
    };

    return Array.isArray(meta.host) ? meta.host.some(matchUrl) : matchUrl(meta.host);
  });
};
