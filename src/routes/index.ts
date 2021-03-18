import express from "express";
import tradfriRouter from "./tradfri";
import { shutdown } from "@/clients/shutdown";

const router = express.Router();

router.use("/tradfri", tradfriRouter)

router.use("/kill", async (req, res) => {
  var exitCode = 0;

  try {
    exitCode = await shutdown();  
  } catch (err) {
    exitCode = 1;
  }

  res.status(200).send({ msg: "Exiting with code " + exitCode.toString() });

  process.exit(exitCode);
});

export default router;
