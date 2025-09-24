declare module 'canvas-confetti' {
  type Options = Record<string, any>;
  const confetti: (opts?: Options) => void;
  export default confetti;
}

