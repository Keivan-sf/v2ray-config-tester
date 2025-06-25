import express from "express";
import "dotenv/config";
const app = express();
const PORT = +process.env.PORT!;
const REMOTE_END_POINT = process.env.REMOTE_END_POINT!;
import { getRootDir, setRootDir } from "./lib/dirname";
import path from "path";
import { is_config_ok } from "./lib/config-tester-q";
import axios from "axios";
import { route_subscription_server } from "./lib/remote-server-subscription";
app.use(express.json());
setRootDir(path.resolve(process.cwd()));
console.log("root dir:", getRootDir());

async function main() {
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
      axios.post(REMOTE_END_POINT, { config: config_uri }).catch((err) => {
        console.log("[warning] failed to send config to remote end", err);
      });
    }
  });
  route_subscription_server(app);
  app.listen(PORT, () => {
    console.log(`APP IS LITENING ON PORT ${PORT}`);
  });
}

main();
