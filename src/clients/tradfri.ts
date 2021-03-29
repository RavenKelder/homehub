import {
  discoverGateway,
  TradfriClient,
  Accessory,
  Light,
} from "node-tradfri-client";

const secCode: string = process.env.SEC_CODE || "";

const tradfriBulbModelIdentifier = "TRADFRI bulb";

export async function initialise(): Promise<TradfriClient> {
  console.log("Discovering gateway...");
  const result = await discoverGateway();

  if (!result) {
    throw new TradfriError("no gateway found");
  }

  const addr = result.addresses[0];
  const tradfri = new TradfriClient(addr);

  const { identity, psk } = await tradfri.authenticate(secCode);

  await tradfri.connect(identity, psk);

  return tradfri;
}

export async function getDevices(client: TradfriClient): Promise<Accessory[]> {
  await refreshDevices(client);

  return Object.values(client.devices);
}

export async function getLights(client: TradfriClient): Promise<Accessory[]> {
  await refreshDevices(client);

  return Object.values(client.devices).filter((acc) =>
    acc.deviceInfo.modelNumber.includes(tradfriBulbModelIdentifier),
  );
}

export async function setLightBrightness(
  client: TradfriClient,
  id: string,
  brightness: number,
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

export async function setLightTemperature(
  client: TradfriClient,
  id: string,
  temperature: number,
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

  const tempVal = temperature ?? device.lightList[0].dimmer;

  await client.operateLight(device, { colorTemperature: tempVal });
}

export async function toggleLight(
  client: TradfriClient,
  id: string,
): Promise<void> {
  await refreshDevices(client);

  const device = client.devices[id];

  if (!device || !device.lightList) {
    throw new TradfriError("light device not found");
  }

  const statuses = device.lightList.map((light) => light.onOff);

  if (statuses.length <= 0) {
    throw new TradfriError("light has empty lightlist");
  }

  let failures: Light[] = [];

  for (let i = 0; i < statuses.length; i++) {
    const result = await client.operateLight(device, { onOff: !statuses[0] });
    if (!result) {
      failures.push(device.lightList[i]);
    }
  }

  if (failures.length > 0) {
    throw new TradfriError("failed to operate lights", failures);
  }
}

async function refreshDevices(client: TradfriClient): Promise<void> {
  return client.observeDevices();
}

class TradfriError extends Error {
  data: unknown;
  constructor(m: string, data?: unknown) {
    super(m);
    this.name = "TradfriError";
    if (data) {
      this.data = data;
    }
  }
}

const tradfriClient: Promise<TradfriClient> = initialise();

export { tradfriClient };
