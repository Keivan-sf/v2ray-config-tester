import { PortPool } from "./port-pool";

describe("Port pool", () => {
  it("should normally return free ports", async () => {
    const pool = new PortPool(4010, 4012);
    const ports = [];
    for (let i = 0; i < 3; i++) {
      ports.push(await pool.getPort());
    }
    expect(ports).toStrictEqual([4010, 4011, 4012]);
  });

  it("should return free ports after another one is freed", async () => {
    const pool = new PortPool(4010, 4012);
    const ports = [];
    for (let i = 0; i < 3; i++) {
      ports.push(await pool.getPort());
    }
    setTimeout(() => {
      pool.free(4010);
    }, 100);
    const another_port = await pool.getPort();
    expect(another_port).toBe(4010);
  });

  it("should throw on invalid port ranges", () => {
    expect(() => new PortPool(-1, 100)).toThrow();
    expect(() => new PortPool(1, 65536)).toThrow();
    expect(() => new PortPool(100, 10)).toThrow();
  });
});
