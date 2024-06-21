export const install = (id: string, cb: () => void) => {
  const key = `___INSTALLED_SCRIPT_${id}`;

  if (!(window as any)[key]) {
    cb();
  }

  (window as any)[key] = true;
};
