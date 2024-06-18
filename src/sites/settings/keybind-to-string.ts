export const keybindToString = (bind: Keybind): string => {
  return bind === null ? 'None' : `${bind.key} (${[...bind.modifiers, bind.code].join('+')})`;
};
