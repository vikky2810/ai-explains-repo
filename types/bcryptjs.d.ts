declare module 'bcryptjs' {
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;

  const _default: {
    hash: typeof hash;
    compare: typeof compare;
  };

  export default _default;
}


