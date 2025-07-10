import express from "express";
import "dotenv/config";
const app = express();
const PORT = process.env.PORT ? +process.env.PORT : 5574;
const LOCAL_END_POINT = `http://127.0.0.1:${PORT}/s/add-config`;
const REMOTE_END_POINT = process.env.REMOTE_END_POINT;
import { getRootDir, setRootDir } from "./lib/dirname";
import path from "path";
import * as fs from "fs/promises";
import { is_config_ok } from "./lib/config-tester-q";
import axios from "axios";
import { route_subscription_server } from "./lib/local-server-subscription";
app.use(express.json());
setRootDir(path.resolve(process.cwd()));

async function addConfigToSub(
  config_uri: string,
  local?: string,
  remote?: string,
) {
  if (local) {
    axios.post(local, { config: config_uri }).catch((err) => {
      console.log("[warning] failed to send config to local end", err);
    });
  }
  if (remote) {
    axios.post(remote, { config: config_uri }).catch((err) => {
      console.log("[warning] failed to send config to remote end", err);
    });
  }
}

async function main() {
  await fs.mkdir(`${getRootDir()}/.configs`, { recursive: true });
  app.post("/add-config", async (req, res) => {
    if (!req.body.config || typeof req.body.config != "string") {
      res.status(400);
      return;
    }
    res.status(200).send("ok");
    const config_uri = req.body.config;
    const result = await is_config_ok(config_uri);
    console.log("is_config_ok:", result);
    if (result) {
      addConfigToSub(config_uri, LOCAL_END_POINT, REMOTE_END_POINT);
    }
  });
  route_subscription_server(app);
  app.listen(PORT, () => {
    console.log(`APP IS LITENING ON PORT ${PORT}`);
  });
}

main();
