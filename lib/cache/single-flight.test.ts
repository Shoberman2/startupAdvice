import { describe, expect, it } from "vitest";
import { SingleFlight } from "./single-flight";

describe("SingleFlight", () => {
  it("dedupes concurrent calls for the same key", async () => {
    const sf = new SingleFlight<number>();
    let invocations = 0;
    const work = async () => {
      invocations++;
      await new Promise((r) => setTimeout(r, 10));
      return 42;
    };

    const [a, b, c] = await Promise.all([
      sf.run("k", work),
      sf.run("k", work),
      sf.run("k", work),
    ]);

    expect(a).toBe(42);
    expect(b).toBe(42);
    expect(c).toBe(42);
    expect(invocations).toBe(1);
  });

  it("runs different keys independently", async () => {
    const sf = new SingleFlight<string>();
    const work = (v: string) => async () => v;
    const [a, b] = await Promise.all([sf.run("a", work("A")), sf.run("b", work("B"))]);
    expect(a).toBe("A");
    expect(b).toBe("B");
  });

  it("cleans up the entry on success", async () => {
    const sf = new SingleFlight<number>();
    await sf.run("k", async () => 1);
    expect(sf.size()).toBe(0);
  });

  it("cleans up the entry on rejection (the critical-gap test)", async () => {
    const sf = new SingleFlight<number>();
    await expect(
      sf.run("k", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(sf.size()).toBe(0);
  });

  it("allows a retry after a previous rejection", async () => {
    const sf = new SingleFlight<number>();
    await expect(
      sf.run("k", async () => {
        throw new Error("first");
      }),
    ).rejects.toThrow("first");

    const result = await sf.run("k", async () => 7);
    expect(result).toBe(7);
    expect(sf.size()).toBe(0);
  });
});
