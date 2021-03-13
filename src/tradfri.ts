import {
  discoverGateway,
  TradfriClient,
  Accessory,
  Light,
} from "node-tradfri-client";
import { kStringMaxLength } from "node:buffer";

const secCode: string = process.env.SEC_CODE || "";

export async function initialise(): Promise<TradfriClient> {
  console.log("Discovering gateway...");
  const result = await discoverGateway();

  if (!result) {
    throw new Error("No gateway found");
  }

  console.log("Gateway found.");

  const addr = result.addresses[0];
  const tradfri = new TradfriClient(addr);

  console.log("Authenticating...");
  const { identity, psk } = await tradfri.authenticate(secCode);

  console.log("Authentication successful. Connecting...");

  await tradfri.connect(identity, psk);

  console.log("Connected.");
  return tradfri;
}

export async function getDevices(client: TradfriClient): Promise<Accessory[]> {
  await refreshDevices(client);

  return Object.values(client.devices);
}

export async function getLights(client: TradfriClient): Promise<Accessory[]> {
  await refreshDevices(client);

  return Object.values(client.devices).filter((acc) =>
    acc.deviceInfo.modelNumber.includes("TRADFRI bulb")
  );
}

export async function setLightBrightness(
  client: TradfriClient,
  id: string,
  brightness: number
): Promise<void> {
  await refreshDevices(client);

  const device = client.devices[id];

  if (!device || !device.lightList) {
    throw { msg: "Light not found" };
  }

  const statuses = device.lightList.map((light) => light.onOff);

  if (statuses.length <= 0) {
    throw { msg: "Light not found" };
  }

  const brightVal = brightness ?? device.lightList[0].dimmer;

  await client.operateLight(device, { dimmer: brightVal });
}

export async function toggleLight(
  client: TradfriClient,
  id: string
): Promise<void> {
  await refreshDevices(client);

  const device = client.devices[id];

  if (!device || !device.lightList) {
    throw { msg: "Light not found" };
  }

  const statuses = device.lightList.map((light) => light.onOff);

  if (statuses.length <= 0) {
    throw { msg: "Light not found" };
  }

  await client.operateLight(device, { onOff: !statuses[0] });
}

async function refreshDevices(client: TradfriClient): Promise<void> {
  return client.observeDevices();
}
