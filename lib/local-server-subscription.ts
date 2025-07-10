import { Router } from "express";
const LIMIT = 60;
const uris: string[] = [];
export function route_subscription_server(router: Router) {
  router.post("/s/add-config", (req, res) => {
    if (!req.body.config || typeof req.body.config != "string") {
      res.status(400);
      return;
    }
    res.send(200);
    if (uris.includes(req.body.config)) return;
    uris.unshift(req.body.config);
    if (uris.length > LIMIT) {
      uris.pop();
    }
  });

  router.get("/s/configs", (req, res) => {
    res.send(uris.join("\n"));
  });
}
