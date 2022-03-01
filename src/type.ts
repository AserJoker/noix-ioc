export interface IProvideClass<T = unknown> {
  new (): T;
}
export interface IProvide<T> {
  provider: IProvideClass<T>;
  scope: Scope;
  injections: Record<string | number, string | symbol>;
  values: Record<string | number, unknown>,
  initialize?: string;
}
export type Scope = "single" | "proto";
export interface IContainer {
  inject: <T>(token: string | symbol) => T | null;
  provide: <T, K extends IProvideClass<T>>(
    token: string | symbol,
    provider: K,
    scope?: Scope,
    injections?: Record<string | number, string | symbol>,
    values?: Record<string | number, unknown>,
    initialize?: keyof InstanceType<K>
  ) => void;
  store: (token: string | symbol, instance: unknown) => void;
  remove: (token: string | symbol) => void;
  proxy: () => IContainer;
}
