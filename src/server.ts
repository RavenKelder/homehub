import express from "express";
import {
  getDevices,
  getLights,
  initialise,
  setLightBrightness,
  toggleLight,
} from "./tradfri";

const port = process.env.PORT || "8080";

const app = express();

(async () => {
  const client = await initialise();

  app.get("/devices", async (_req, res) => {
    try {
      const devices = await getDevices(client);
      res.status(200).send(devices);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.get("/lights", async (_req, res) => {
    try {
      const lights = await getLights(client);
      res.send(lights);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.get("/lights/dim/:id/:val", async (req, res) => {
    const id = req.params["id"];
    const val = req.params["val"];

    try {
      await setLightBrightness(client, id, parseInt(val));
      res.status(200).send({ msg: "Set brightness" });
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.get("/lights/toggle/:id", async (req, res) => {
    const id = req.params["id"];

    try {
      await toggleLight(client, id);
    } catch (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).send({ msg: "Toggled light" });
  });

  app.listen(port, () => {
    console.log("Listening on port " + port.toString());
  });
})();
