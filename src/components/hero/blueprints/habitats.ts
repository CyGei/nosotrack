// All coordinates are in the blueprints' 1000 × 1000 viewBox.

import {
  HOSP_NORTH_Y,
  HOSP_NORTH_H,
  HOSP_SOUTH_Y,
  HOSP_SOUTH_H,
  HOSP_TOP_ROOMS,
  HOSP_TOP_ROOM_W,
  hospTopX,
  HOSP_LEFT_ROOMS,
  hospLeftY,
  HOSP_WEST_X,
  HOSP_WEST_W,
  HOSP_EAST_X,
  HOSP_EAST_W,
  HOSP_LW_ROOM_H,
} from "./Hospital";
import {
  SHIP_PORT_CABIN_Y,
  SHIP_PORT_CABIN_H,
  SHIP_STBD_CABIN_Y,
  SHIP_STBD_CABIN_H,
  SHIP_PORT_CORR,
  SHIP_STBD_CORR,
  SHIP_AFT_CABINS,
  SHIP_FWD_CABINS,
  shipAftX,
  shipFwdX,
  SHIP_AFT_CABIN_W_EXPORT,
  SHIP_FWD_CABIN_W_EXPORT,
  SHIP_ATRIUM,
  SHIP_DINING,
} from "./CruiseShip";
import {
  FARM_PASTURE,
  FARM_STALLS,
  FARM_HOLDING,
  FARM_PARLOR,
  FARM_CALVES,
  FARM_MILK_ROOM,
  FARM_ALLEY,
} from "./Farm";

export type HabitatMotion = "corridor-h" | "corridor-v";
export type HabitatShape = "circle" | "square" | "triangle";

export type Habitat = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  count: number;
  neighbours: string[];
  motion?: HabitatMotion;
  forceShape?: HabitatShape;
};

const HOSP_INSET = 9;
const EW_CORR_ID = "hosp-corr-EW";
const NS_CORR_ID = "hosp-corr-NS";

const hospital: Habitat[] = [];

const allNorthIds = Array.from(
  { length: HOSP_TOP_ROOMS },
  (_, i) => `hosp-N${i}`,
);
const allSouthIds = Array.from(
  { length: HOSP_TOP_ROOMS },
  (_, i) => `hosp-S${i}`,
);
const allWestIds = Array.from(
  { length: HOSP_LEFT_ROOMS },
  (_, i) => `hosp-W${i}`,
);
const allEastIds = Array.from(
  { length: HOSP_LEFT_ROOMS },
  (_, i) => `hosp-E${i}`,
);

for (let i = 0; i < HOSP_TOP_ROOMS; i++) {
  const neighbours: string[] = [EW_CORR_ID];
  if (i > 0) neighbours.push(`hosp-N${i - 1}`);
  if (i < HOSP_TOP_ROOMS - 1) neighbours.push(`hosp-N${i + 1}`);
  hospital.push({
    id: `hosp-N${i}`,
    x: hospTopX(i) + HOSP_INSET,
    y: HOSP_NORTH_Y + HOSP_INSET,
    w: HOSP_TOP_ROOM_W - HOSP_INSET * 2,
    h: HOSP_NORTH_H - HOSP_INSET * 2,
    count: i % 4 === 1 ? 3 : i % 2 === 0 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < HOSP_TOP_ROOMS; i++) {
  const neighbours: string[] = [EW_CORR_ID];
  if (i > 0) neighbours.push(`hosp-S${i - 1}`);
  if (i < HOSP_TOP_ROOMS - 1) neighbours.push(`hosp-S${i + 1}`);
  hospital.push({
    id: `hosp-S${i}`,
    x: hospTopX(i) + HOSP_INSET,
    y: HOSP_SOUTH_Y + HOSP_INSET,
    w: HOSP_TOP_ROOM_W - HOSP_INSET * 2,
    h: HOSP_SOUTH_H - HOSP_INSET * 2,
    count: i % 3 === 0 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < HOSP_LEFT_ROOMS; i++) {
  const neighbours: string[] = [NS_CORR_ID];
  if (i > 0) neighbours.push(`hosp-W${i - 1}`);
  if (i < HOSP_LEFT_ROOMS - 1) neighbours.push(`hosp-W${i + 1}`);
  hospital.push({
    id: `hosp-W${i}`,
    x: HOSP_WEST_X + HOSP_INSET,
    y: hospLeftY(i) + HOSP_INSET,
    w: HOSP_WEST_W - HOSP_INSET * 2,
    h: HOSP_LW_ROOM_H - HOSP_INSET * 2,
    count: i % 2 === 0 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < HOSP_LEFT_ROOMS; i++) {
  const neighbours: string[] = [NS_CORR_ID];
  if (i > 0) neighbours.push(`hosp-E${i - 1}`);
  if (i < HOSP_LEFT_ROOMS - 1) neighbours.push(`hosp-E${i + 1}`);
  hospital.push({
    id: `hosp-E${i}`,
    x: HOSP_EAST_X + HOSP_INSET,
    y: hospLeftY(i) + HOSP_INSET,
    w: HOSP_EAST_W - HOSP_INSET * 2,
    h: HOSP_LW_ROOM_H - HOSP_INSET * 2,
    count: i % 2 === 0 ? 3 : 2,
    neighbours,
  });
}

hospital.push({
  id: EW_CORR_ID,
  x: 82,
  y: 232,
  w: 856,
  h: 36,
  count: 7,
  motion: "corridor-h",
  neighbours: [...allNorthIds, ...allSouthIds, NS_CORR_ID],
});

hospital.push({
  id: NS_CORR_ID,
  x: 226,
  y: 282,
  w: 38,
  h: 646,
  count: 5,
  motion: "corridor-v",
  neighbours: [...allWestIds, ...allEastIds, EW_CORR_ID],
});

export const HOSPITAL_HABITATS: Habitat[] = hospital;

const SHIP_CABIN_INSET_X = 3;
const SHIP_CABIN_INSET_Y = 10;
const SHIP_DINING_INSET = 10;
const SHIP_ATRIUM_INSET = 6;
const SHIP_CORR_INSET = 4;

const ship: Habitat[] = [];

const aftPortId = (i: number) => `ship-AP-${i}`;
const aftStbdId = (i: number) => `ship-AS-${i}`;
const fwdPortId = (i: number) => `ship-FP-${i}`;
const fwdStbdId = (i: number) => `ship-FS-${i}`;
const PORT_CORR_ID = "ship-corr-port";
const STBD_CORR_ID = "ship-corr-stbd";
const DINING_ID = "ship-dining";
const ATRIUM_ID = "ship-atrium";

const allAftPortIds = Array.from({ length: SHIP_AFT_CABINS }, (_, i) => aftPortId(i));
const allAftStbdIds = Array.from({ length: SHIP_AFT_CABINS }, (_, i) => aftStbdId(i));
const allFwdPortIds = Array.from({ length: SHIP_FWD_CABINS }, (_, i) => fwdPortId(i));
const allFwdStbdIds = Array.from({ length: SHIP_FWD_CABINS }, (_, i) => fwdStbdId(i));

for (let i = 0; i < SHIP_AFT_CABINS; i++) {
  const neighbours: string[] = [PORT_CORR_ID];
  if (i > 0) neighbours.push(aftPortId(i - 1));
  if (i < SHIP_AFT_CABINS - 1) neighbours.push(aftPortId(i + 1));
  ship.push({
    id: aftPortId(i),
    x: shipAftX(i) + SHIP_CABIN_INSET_X,
    y: SHIP_PORT_CABIN_Y + SHIP_CABIN_INSET_Y,
    w: SHIP_AFT_CABIN_W_EXPORT - SHIP_CABIN_INSET_X * 2,
    h: SHIP_PORT_CABIN_H - SHIP_CABIN_INSET_Y * 2,
    count: i % 3 === 0 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < SHIP_AFT_CABINS; i++) {
  const neighbours: string[] = [STBD_CORR_ID];
  if (i > 0) neighbours.push(aftStbdId(i - 1));
  if (i < SHIP_AFT_CABINS - 1) neighbours.push(aftStbdId(i + 1));
  ship.push({
    id: aftStbdId(i),
    x: shipAftX(i) + SHIP_CABIN_INSET_X,
    y: SHIP_STBD_CABIN_Y + SHIP_CABIN_INSET_Y,
    w: SHIP_AFT_CABIN_W_EXPORT - SHIP_CABIN_INSET_X * 2,
    h: SHIP_STBD_CABIN_H - SHIP_CABIN_INSET_Y * 2,
    count: i % 3 === 1 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < SHIP_FWD_CABINS; i++) {
  const neighbours: string[] = [PORT_CORR_ID];
  if (i > 0) neighbours.push(fwdPortId(i - 1));
  if (i < SHIP_FWD_CABINS - 1) neighbours.push(fwdPortId(i + 1));
  ship.push({
    id: fwdPortId(i),
    x: shipFwdX(i) + SHIP_CABIN_INSET_X,
    y: SHIP_PORT_CABIN_Y + SHIP_CABIN_INSET_Y,
    w: SHIP_FWD_CABIN_W_EXPORT - SHIP_CABIN_INSET_X * 2,
    h: SHIP_PORT_CABIN_H - SHIP_CABIN_INSET_Y * 2,
    count: i % 2 === 0 ? 2 : 1,
    neighbours,
  });
}

for (let i = 0; i < SHIP_FWD_CABINS; i++) {
  const neighbours: string[] = [STBD_CORR_ID];
  if (i > 0) neighbours.push(fwdStbdId(i - 1));
  if (i < SHIP_FWD_CABINS - 1) neighbours.push(fwdStbdId(i + 1));
  ship.push({
    id: fwdStbdId(i),
    x: shipFwdX(i) + SHIP_CABIN_INSET_X,
    y: SHIP_STBD_CABIN_Y + SHIP_CABIN_INSET_Y,
    w: SHIP_FWD_CABIN_W_EXPORT - SHIP_CABIN_INSET_X * 2,
    h: SHIP_STBD_CABIN_H - SHIP_CABIN_INSET_Y * 2,
    count: i % 2 === 1 ? 2 : 1,
    neighbours,
  });
}

ship.push({
  id: ATRIUM_ID,
  x: SHIP_ATRIUM.x + SHIP_ATRIUM_INSET,
  y: SHIP_ATRIUM.y + SHIP_ATRIUM_INSET,
  w: SHIP_ATRIUM.w - SHIP_ATRIUM_INSET * 2,
  h: SHIP_ATRIUM.h - SHIP_ATRIUM_INSET * 2,
  count: 3,
  neighbours: [PORT_CORR_ID, STBD_CORR_ID, DINING_ID],
});

ship.push({
  id: DINING_ID,
  x: SHIP_DINING.x + SHIP_DINING_INSET,
  y: SHIP_DINING.y + SHIP_DINING_INSET,
  w: SHIP_DINING.w - SHIP_DINING_INSET * 2,
  h: SHIP_DINING.h - SHIP_DINING_INSET * 2,
  count: 18,
  neighbours: [PORT_CORR_ID, STBD_CORR_ID, ATRIUM_ID],
});

ship.push({
  id: PORT_CORR_ID,
  x: SHIP_PORT_CORR.x + SHIP_CORR_INSET,
  y: SHIP_PORT_CORR.y,
  w: SHIP_PORT_CORR.w - SHIP_CORR_INSET * 2,
  h: SHIP_PORT_CORR.h,
  count: 6,
  motion: "corridor-h",
  neighbours: [
    ...allAftPortIds,
    ...allFwdPortIds,
    DINING_ID,
    ATRIUM_ID,
    STBD_CORR_ID,
  ],
});

ship.push({
  id: STBD_CORR_ID,
  x: SHIP_STBD_CORR.x + SHIP_CORR_INSET,
  y: SHIP_STBD_CORR.y,
  w: SHIP_STBD_CORR.w - SHIP_CORR_INSET * 2,
  h: SHIP_STBD_CORR.h,
  count: 5,
  motion: "corridor-h",
  neighbours: [
    ...allAftStbdIds,
    ...allFwdStbdIds,
    DINING_ID,
    ATRIUM_ID,
    PORT_CORR_ID,
  ],
});

export const SHIP_HABITATS: Habitat[] = ship;

const FARM_INSET = 14;
const FARM_TITLE_INSET = 30;

const PASTURE_ID = "farm-pasture";
const STALLS_ID = "farm-stalls";
const HOLDING_ID = "farm-holding";
const PARLOR_ID = "farm-parlor";
const CALVES_ID = "farm-calves";
const MILK_ROOM_ID = "farm-milkroom";
const ALLEY_ID = "farm-alley";

const farm: Habitat[] = [
  {
    id: PASTURE_ID,
    x: FARM_PASTURE.x + FARM_INSET,
    y: FARM_PASTURE.y + FARM_TITLE_INSET,
    w: FARM_PASTURE.w - FARM_INSET * 2,
    h: FARM_PASTURE.h - FARM_TITLE_INSET - FARM_INSET,
    count: 24,
    neighbours: [STALLS_ID, ALLEY_ID],
  },
  {
    id: STALLS_ID,
    x: FARM_STALLS.x + FARM_INSET,
    y: FARM_STALLS.y + FARM_TITLE_INSET,
    w: FARM_STALLS.w - FARM_INSET * 2,
    h: FARM_STALLS.h - FARM_TITLE_INSET - FARM_INSET,
    count: 6,
    neighbours: [HOLDING_ID, ALLEY_ID],
  },
  {
    id: HOLDING_ID,
    x: FARM_HOLDING.x + FARM_INSET,
    y: FARM_HOLDING.y + FARM_TITLE_INSET,
    w: FARM_HOLDING.w - FARM_INSET * 2,
    h: FARM_HOLDING.h - FARM_TITLE_INSET - FARM_INSET,
    count: 5,
    neighbours: [STALLS_ID, PARLOR_ID, ALLEY_ID],
  },
  {
    id: PARLOR_ID,
    x: FARM_PARLOR.x + FARM_INSET,
    y: FARM_PARLOR.y + FARM_TITLE_INSET,
    w: FARM_PARLOR.w - FARM_INSET * 2,
    h: FARM_PARLOR.h - FARM_TITLE_INSET - FARM_INSET,
    count: 3,
    neighbours: [HOLDING_ID, MILK_ROOM_ID, ALLEY_ID],
  },
  {
    id: CALVES_ID,
    x: FARM_CALVES.x + FARM_INSET,
    y: FARM_CALVES.y + FARM_TITLE_INSET,
    w: FARM_CALVES.w - FARM_INSET * 2,
    h: FARM_CALVES.h - FARM_TITLE_INSET - FARM_INSET,
    count: 6,
    neighbours: [ALLEY_ID, MILK_ROOM_ID],
  },
  {
    id: MILK_ROOM_ID,
    x: FARM_MILK_ROOM.x + FARM_INSET,
    y: FARM_MILK_ROOM.y + FARM_TITLE_INSET,
    w: FARM_MILK_ROOM.w - FARM_INSET * 2,
    h: FARM_MILK_ROOM.h - FARM_TITLE_INSET - FARM_INSET,
    // Equipment-only: no particles, but relays contact between parlor and calves.
    count: 0,
    neighbours: [PARLOR_ID, CALVES_ID, ALLEY_ID],
  },
  {
    id: ALLEY_ID,
    x: FARM_ALLEY.x + 12,
    y: FARM_ALLEY.y + 10,
    w: FARM_ALLEY.w - 24,
    h: FARM_ALLEY.h - 20,
    count: 5,
    motion: "corridor-h",
    forceShape: "triangle",
    neighbours: [
      PASTURE_ID,
      STALLS_ID,
      HOLDING_ID,
      PARLOR_ID,
      CALVES_ID,
      MILK_ROOM_ID,
    ],
  },
];

export const FARM_HABITATS: Habitat[] = farm;
export const FARM_IDS = {
  PASTURE: PASTURE_ID,
  STALLS: STALLS_ID,
  HOLDING: HOLDING_ID,
  PARLOR: PARLOR_ID,
  CALVES: CALVES_ID,
  MILK_ROOM: MILK_ROOM_ID,
  ALLEY: ALLEY_ID,
} as const;
