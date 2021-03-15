import express from "express";
import lightsRouter from "./lights"

const tradfriRouter = express.Router();

tradfriRouter.use("/lights", lightsRouter)

export default tradfriRouter;
