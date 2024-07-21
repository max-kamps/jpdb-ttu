import { registerListener } from '@lib/messaging/register-listener';

const installedScripts = new Map<string, boolean>();

export const install = (id: string, cb: () => void) => {
  const key = `___INSTALLED_SCRIPT_${id}`;

  if (!installedScripts.size) {
    registerListener('has-installed-script', (id: string) => {
      return installedScripts.has(id);
    });
  }

  if (!(window as any)[key]) {
    installedScripts.set(id, true);

    cb();
  }

  (window as any)[key] = true;
};
