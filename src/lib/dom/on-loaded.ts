import { on } from './on';

export const onLoaded = (listener: () => void | Promise<void>): void => {
  on('DOMContentLoaded', listener);
};
