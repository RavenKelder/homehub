import {
  getLights,
  initialise,
  setLightBrightness,
  setLightTemperature,
  toggleLight,
  tradfriClient,
} from "@/clients/tradfri";
import express from "express";
import { Accessory, Light } from "node-tradfri-client";

enum LIGHT {
  OBJECT,
}

const lightsRouter = express.Router();

const initialising = initialise();

lightsRouter.use(async (_req, _res, next) => {
  await initialising;
  next();
});

lightsRouter.get("/", async (_req, res) => {
  try {
    const lights = await getLights(tradfriClient);
    res.send(lights);
  } catch (err) {
    res.status(500).send(err);
  }
});

lightsRouter.use("/:id", async (req, res, next) => {
  const id = parseInt(req.params["id"]);
  let light: Accessory;
  try {
    const lights = await getLights(tradfriClient);

    const findLight = lights.filter((l) => l.instanceId === id);

    if (findLight.length <= 0) {
      res
        .status(404)
        .send({ msg: `no lights found with id ${req.params["id"]}` });
      return;
    } else {
      req.app.locals[LIGHT.OBJECT] = findLight[0];
    }
  } catch (err) {
    res.status(500).send({ msg: `failed to find light` });
  }

  if (req.path === "/") {
    res.send(req.app.locals[LIGHT.OBJECT]);
    return;
  };

  next();
});

lightsRouter.get("/:id/toggle", async (req, res) => {
  const light = req.app.locals[LIGHT.OBJECT] as Accessory;

  try {
    await toggleLight(tradfriClient, light.instanceId.toString(10));

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send({ msg: `failed to toggle light: ${err.message}` });
  }
});

lightsRouter.get("/:id/brightness/:value", async (req, res) => {
  const brightness = parseInt(req.params["value"]);
  if (!(brightness >= 0 && brightness <= 100)) {
    res
      .status(400)
      .send({ msg: "invalid brightness value (must be between 0-100)" });
    return;
  }

  const light = req.app.locals[LIGHT.OBJECT] as Accessory;

  try {
    await setLightBrightness(
      tradfriClient,
      light.instanceId.toString(10),
      brightness,
    );

    res.sendStatus(200);
  } catch (err) {
    res
      .status(500)
      .send({ msg: `failed to set light brightness: ${err.message}` });
  }
});

lightsRouter.get("/:id/temperature/:value", async (req, res) => {
  const brightness = parseInt(req.params["value"]);
  if (!(brightness >= 0 && brightness <= 100)) {
    res
      .status(400)
      .send({ msg: "invalid brightness value (must be between 0-100)" });
    return;
  }

  const light = req.app.locals[LIGHT.OBJECT] as Accessory;

  try {
    await setLightTemperature(
      tradfriClient,
      light.instanceId.toString(10),
      brightness,
    );

    res.sendStatus(200);
  } catch (err) {
    res
      .status(500)
      .send({ msg: `failed to set light brightness: ${err.message}` });
  }
});

export default lightsRouter;
