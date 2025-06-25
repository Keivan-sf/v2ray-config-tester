import { Router } from "express";

export function route_subscription_server(router: Router) {
  const uris: string[] = [];
  router.post("/s/add-config", (req, res) => {
    if (!req.body.config || typeof req.body.config != "string") {
      res.status(400);
      return;
    }
    res.send(200);
    uris.unshift(req.body.config);
    if (uris.length > 30) {
      uris.pop();
    }
  });

  router.get("/s/irancell", (req, res) => {
    // return the last 30 URIs each on a new line
    res.send(uris.join("\n"));
  });
}
