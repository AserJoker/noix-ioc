import { useContainer } from "../src";
class A {
  private name = "";
  public setName = (name: string) => {
    this.name = name;
  };
  public getName() {
    return this.name;
  }
}
class B {
  private a!: A;
  private b!: B;
  public getA() {
    return this.a;
  }
  public getB() {
    return this.b;
  }
  public initialize() {
    this.getA().setName("abc");
  }
}
describe("inject", () => {
  it("single", () => {
    const container = useContainer();
    container.provide("A", A, "single");
    const a = container.inject<A>("A") as A;
    const b = container.inject<A>("A") as A;
    a.setName("abc");
    expect(b.getName()).toEqual("abc");
  });
  it("link", () => {
    const container = useContainer();
    container.provide("A", A, "proto");
    container.provide("B", B, "proto", { a: "A" }, {}, "initialize");
    const b = container.inject("B") as B;
    expect(b.getA().getName()).toBe("abc");
  });
  it("cycle", () => {
    const container = useContainer();
    container.provide("A", A, "proto", { b: "B" });
    container.provide("B", B, "proto", { a: "A" }, {}, "initialize");
    expect(() => container.inject("B")).toThrowError("cycle depenence B=>A=>B");
  });
});
