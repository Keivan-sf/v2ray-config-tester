export class PortPool {
  private ports: { [key: number]: "free" | "busy" } = {};
  private request_queue: ((port: number) => void)[] = [];
  constructor(
    private start: number,
    private end: number,
  ) {
    if (start > end || start < 0 || end > 65535) {
      throw new Error("invalid port range");
    }
    for (let i = start; i <= end; i++) {
      this.ports[i] = "free";
    }
    console.log("ports:", this.ports);
  }

  free(port: number) {
    if (port > this.end || port < this.start)
      throw new Error("port out of range");
    if (this.request_queue.length > 0) {
      const resolve = this.request_queue.shift()!;
      resolve(port);
    } else {
      this.ports[port] = "free";
    }
  }

  getPort(): Promise<number> {
    return new Promise((resolve) => {
      for (let port = this.start; port <= this.end; port++) {
        if (this.ports[port] == "free") {
          this.ports[port] = "busy";
          resolve(port);
          return;
        }
      }
      this.request_queue.push(resolve);
    });
  }
}
