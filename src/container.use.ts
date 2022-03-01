import { IContainer, IProvide, IProvideClass, Scope } from "./type";

export const useContainer = () => {
  const providers: Record<string | symbol, IProvide<unknown>> = {};
  const proxy = (): IContainer => {
    const stores: Record<string | symbol, unknown> = {};
    const provide = <T, K extends IProvideClass<T>>(
      token: string | symbol,
      provider: K,
      scope: Scope = "proto",
      injections: Record<string | number, string | symbol> = {},
      values: Record<string | number, unknown> = {},
      initialize?: keyof InstanceType<K>
    ) => {
      providers[token] = {
        provider,
        scope,
        injections,
        initialize: initialize as string,
        values,
      };
    };
    const inject = <T>(
      token: string | symbol,
      path: (string | symbol)[] = []
    ) => {
      if (stores[token]) {
        return stores[token] as T;
      }
      if (path.includes(token)) {
        throw new Error(
          `cycle depenence ${[...path, token]
            .map((item) => item.toString())
            .join("=>")}`
        );
      }
      const provider = providers[token];
      if (!provider) {
        return null;
      }
      const ins = new provider.provider() as Record<string, unknown>;
      if (provider.scope === "single") {
        stores[token] = ins;
      }
      Object.keys(provider.values).forEach((field) => {
        ins[field] = provider.values[field];
      });
      Object.keys(provider.injections).forEach((field) => {
        const current = provider.injections[field] as string | symbol;
        if (current === token) {
          ins[field] = ins;
        } else {
          ins[field] = inject(current, [...path, token]);
        }
      });
      if (provider.initialize) {
        const handle = ins[provider.initialize] as () => void;
        if (handle) {
          handle.apply(ins);
        } else {
          throw new Error(`unknown initialize handle:${provider.initialize}`);
        }
      }
      return ins as T;
    };
    const store = (token: string | symbol, value: unknown) => {
      stores[token] = value;
    };
    const remove = (token: string | symbol) => {
      delete stores[token];
    };
    return { provide, inject, proxy, store, remove };
  };
  return proxy();
};
