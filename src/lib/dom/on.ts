export const on = (event: string, listener: (event: Event) => void | Promise<void>): void => {
  document.addEventListener(event, listener);
};
