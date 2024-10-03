export type Handle = {
  text: string;
  length: number;
  resolve: (tokens: Token[]) => void;
  reject: (e?: Error) => void;
};
