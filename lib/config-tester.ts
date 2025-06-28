import path from "path";
import { getRootDir } from "./dirname";
import { execSync } from "child_process";
import fs from "fs/promises";
import * as $ from "node:child_process";
const SOCKS5_PORT = 4010;

export async function is_config_ok_wo_q(config_uri: string): Promise<boolean> {
  try {
    const v2_parser_binary = path.resolve(getRootDir(), "v2parser");
    const config_raw = execSync(
      `${v2_parser_binary} "${config_uri}" --socksport ${SOCKS5_PORT}`,
    ).toString();
    const config_path = await create_json_file("4010", config_raw);
    const xray_process = await spawn_xray_process(config_path);
    console.log("we spawned xray core");
    await wait_for_xray_core(xray_process);
    const result = await is_socks5_connected(SOCKS5_PORT);
    xray_process.kill();
    return result;
  } catch (err) {
    console.log("FAILED parser/xray with this config:", config_uri);
    return false;
  }
}

async function create_json_file(name: string, config: any) {
  const file_path = `${getRootDir()}/.configs/${name}.json`;
  await fs.writeFile(file_path, config);
  return file_path;
}

async function spawn_xray_process(config_path: string) {
  const raw_cmd = `xray run --config=${config_path}`;
  const cmd_split = raw_cmd.split(" ");
  const cmd = cmd_split.shift() as string;
  return $.spawn(cmd, cmd_split);
}

async function wait_for_xray_core(
  xray_process: $.ChildProcessWithoutNullStreams,
) {
  return new Promise<void>((resolve, reject) => {
    let is_fulfilled = false;

    setTimeout(() => {
      if (is_fulfilled) return;
      is_fulfilled = true;
      xray_process.kill();
      reject("v2ray process timed out");
    }, 5000);

    xray_process.stderr?.on("data", async (data: Buffer) => {
      if (is_fulfilled) return;
      const out = data.toString();
      if (out.includes("Failed to start")) {
        is_fulfilled = true;
        reject(out);
      }
    });

    xray_process.stdout?.on("data", async (data: Buffer) => {
      if (is_fulfilled) return;
      const out = data.toString().toLowerCase();
      if (!out.includes("started")) return;
      is_fulfilled = true;
      resolve();
    });

    xray_process.once("exit", () => {
      if (is_fulfilled) return;
      is_fulfilled = true;
      reject();
    });
  });
}

async function is_socks5_connected(port: number) {
  try {
    let is_fulfilled = false;

    let out_data = "";
    await new Promise((resolve, reject) => {
      // const process = $.spawn(
      //   "curl",
      //   `-x socks5://127.0.0.1:${port} -m 5 http://cp.cloudflare.com/`.split(" "),
      // );
      const process = $.spawn(
        "curl",
        `-x socks5://127.0.0.1:${port} -m 5 https://dns.google.com/resolve?name=google.com`.split(
          " ",
        ),
      );
      process.stdout.on("data", (data) => {
        const out = data.toString();
        if (out.toLowerCase().includes("curl:")) {
          is_fulfilled = true;
          reject(out);
        }
        out_data += data;
        // console.log(data);
      });

      process.stderr.on("data", (data) => {
        const out = data.toString();
        if (out.toLowerCase().includes("curl:")) {
          is_fulfilled = true;
          reject(out);
        }
      });
      process.once("exit", () => {
        if (is_fulfilled) return;
        is_fulfilled = true;
        resolve(true);
      });
    });
    if (!out_data.trim()) {
      console.log(false, "AFTER TRIM AFTER TRIM");
      return false;
    }
    console.log("true with:", out_data);
    return true;
  } catch (err) {
    return false;
  }
}
