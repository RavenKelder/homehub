import {
  getLights,
  setLightBrightness,
  tradfriClient,
} from "@/clients/tradfri";
import cron from "node-cron";

const SCHEDULED_LIGHTS = process.env.SCHEDULED_LIGHTS;

const cronOff = process.env.CRON_OFF;
const cronOn = process.env.CRON_ON;

const setHallwayLights = (brightness: number) => async () => {
  try {
    const client = await tradfriClient;
    const lights = await getLights(client);
    const hallway = lights.filter((light) => light.name === SCHEDULED_LIGHTS);

    if (hallway.length === 0) {
      console.log(`No hallway lights found.`);
    } else {
      await setLightBrightness(
        client,
        hallway[0].instanceId.toString(10),
        brightness,
      );

      console.log(
        `Set ${SCHEDULED_LIGHTS} to brightness ${brightness.toString(
          10,
        )} at time ${new Date().toString()}.`,
      );
    }
  } catch (err) {
    console.log(`Failed to run scheduled job: ${err.message}`);
  }
};

const tasks = [
  cron.schedule(cronOff, setHallwayLights(0)),
  cron.schedule(cronOn, setHallwayLights(100)),
];

console.log(`Set ${SCHEDULED_LIGHTS} to turn off using cron job ${cronOff}`);
console.log(`Set ${SCHEDULED_LIGHTS} to turn on using cron job ${cronOn}`);

export { tasks };
