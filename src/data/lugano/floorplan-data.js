const MM_PER_PX = 20;
const CM_PER_PX = MM_PER_PX / 10;
const PX_PER_CM = 1 / CM_PER_PX;

const DEFAULT_VIEWBOX = { x: 0, y: 0, width: 800, height: 520 };
const OUTER_WALL_BOUNDS = { x: 30, y: 30, width: 700, height: 415 };
const floorBounds = { ...OUTER_WALL_BOUNDS };

const EXTERIOR_SCALE = 2.5;
const EXTERIOR_TERRACE_DEPTH_PX = Math.round(80 * EXTERIOR_SCALE);
const EXTERIOR_CORRIDOR_DEPTH_PX = Math.round(40 * EXTERIOR_SCALE);
const EXTERIOR_STAIRS_DEPTH_PX = Math.round(80 * EXTERIOR_SCALE);
const EXTERIOR_STAIRS_HEIGHT_PX = 170;
const EXTERIOR_STAIRS_Y_PX = 320;
const EXTERIOR_OG_TERRACE_HEIGHT_PX = 300;
const EXTERIOR_OG_TERRACE_Y_PX = 190;
const EXTERIOR_VIEWBOX = {
  x: OUTER_WALL_BOUNDS.x - EXTERIOR_TERRACE_DEPTH_PX,
  y: OUTER_WALL_BOUNDS.y - EXTERIOR_TERRACE_DEPTH_PX,
  width:
    OUTER_WALL_BOUNDS.width +
    EXTERIOR_TERRACE_DEPTH_PX +
    EXTERIOR_STAIRS_DEPTH_PX,
  height:
    OUTER_WALL_BOUNDS.height +
    EXTERIOR_TERRACE_DEPTH_PX +
    EXTERIOR_CORRIDOR_DEPTH_PX,
};

const EXTERIOR_ROOMS = {
  ground: [
    {
      id: "ground-terrace",
      name: "Terrasse unten",
      exteriorType: "terrace",
      x: OUTER_WALL_BOUNDS.x,
      y: OUTER_WALL_BOUNDS.y - EXTERIOR_TERRACE_DEPTH_PX,
      width: OUTER_WALL_BOUNDS.width,
      height: EXTERIOR_TERRACE_DEPTH_PX,
    },
    {
      id: "ground-stairs",
      name: "Aussentreppe",
      exteriorType: "stairs",
      x: OUTER_WALL_BOUNDS.x + OUTER_WALL_BOUNDS.width,
      y: EXTERIOR_STAIRS_Y_PX,
      width: EXTERIOR_STAIRS_DEPTH_PX,
      height: EXTERIOR_STAIRS_HEIGHT_PX,
    },
  ],
  upper: [
    {
      id: "upper-terrace",
      name: "Terrasse oben",
      exteriorType: "terrace",
      x: OUTER_WALL_BOUNDS.x - EXTERIOR_TERRACE_DEPTH_PX,
      y: EXTERIOR_OG_TERRACE_Y_PX,
      width: EXTERIOR_TERRACE_DEPTH_PX,
      height: EXTERIOR_OG_TERRACE_HEIGHT_PX,
    },
    {
      id: "upper-corridor",
      name: "Durchgang",
      exteriorType: "corridor",
      x: OUTER_WALL_BOUNDS.x,
      y: OUTER_WALL_BOUNDS.y + OUTER_WALL_BOUNDS.height,
      width: OUTER_WALL_BOUNDS.width,
      height: EXTERIOR_CORRIDOR_DEPTH_PX,
    },
  ],
};

const FLOOR_LAYOUT_CM = {
  ground: {
    id: "ground",
    name: "Erdgeschoss",
    rooms: [
      {
        id: "ground-bedroom-left",
        name: "Camera/Zimmer (West)",
        xCm: 0,
        yCm: 100,
        widthCm: 305,
        heightCm: 555,
      },
      {
        id: "ground-living",
        name: "Wohnraum/Soggiorno",
        xCm: 415,
        yCm: 510,
        widthCm: 450,
        heightCm: 320,
      },
      {
        id: "ground-bedroom-right",
        name: "Zimmer/Camera (Ost)",
        xCm: 865,
        yCm: 510,
        widthCm: 535,
        heightCm: 320,
      },
      {
        id: "ground-cellar",
        name: "Keller",
        xCm: 1090,
        yCm: 0,
        widthCm: 310,
        heightCm: 330,
      },
      {
        id: "ground-hallway",
        name: "Atrio",
        xCm: 320,
        yCm: 330,
        widthCm: 240,
        heightCm: 180,
      },
      {
        id: "ground-bathroom",
        name: "Doccia/WC",
        xCm: 560,
        yCm: 330,
        widthCm: 220,
        heightCm: 180,
      },
      {
        id: "ground-kitchen",
        name: "Corridoio",
        xCm: 790,
        yCm: 330,
        widthCm: 75,
        heightCm: 180,
      },
      {
        id: "ground-storage",
        name: "Scala/Treppe",
        xCm: 875,
        yCm: 330,
        widthCm: 70,
        heightCm: 180,
      },
    ],
    openings: [
      {
        id: "ground-bottom-window-190x130",
        type: "window",
        roomId: "ground-bedroom-left",
        side: "bottom",
        widthCm: 190,
        heightCm: 130,
        label: "190/130 GELOSIE",
      },
      {
        id: "ground-bottom-door-190x211p4-left",
        type: "door",
        roomId: "ground-living",
        side: "bottom",
        widthCm: 190,
        heightCm: 215,
        label: "190/211+4 GELOSIE",
      },
      {
        id: "ground-top-window-70x40",
        type: "window",
        roomId: "ground-cellar",
        side: "top",
        widthCm: 70,
        heightCm: 40,
        label: "70/40",
      },
      {
        id: "ground-bottom-door-190x211p4-right",
        type: "door",
        roomId: "ground-bedroom-right",
        side: "bottom",
        widthCm: 190,
        heightCm: 215,
        label: "190/211+4 GELOSIE",
      },
    ],
  },
  upper: {
    id: "upper",
    name: "Obergeschoss",
    rooms: [
      {
        id: "upper-bedroom-left",
        name: "Camera/Zimmer (West)",
        xCm: 0,
        yCm: 100,
        widthCm: 320,
        heightCm: 535,
      },
      {
        id: "upper-cellar",
        name: "Pranzo/Essraum",
        xCm: 320,
        yCm: 0,
        widthCm: 310,
        heightCm: 330,
      },
      {
        id: "upper-kitchen",
        name: "Cucina/Kuche",
        xCm: 648,
        yCm: 0,
        widthCm: 189,
        heightCm: 330,
      },
      {
        id: "upper-bedroom-right",
        name: "Camera/Zimmer (Ost)",
        xCm: 940,
        yCm: 0,
        widthCm: 460,
        heightCm: 320,
      },
      {
        id: "upper-hallway",
        name: "Atrio",
        xCm: 320,
        yCm: 330,
        widthCm: 240,
        heightCm: 452,
      },
      {
        id: "upper-bathroom",
        name: "Bagno/Bad",
        xCm: 560,
        yCm: 330,
        widthCm: 210,
        heightCm: 242,
      },
      {
        id: "upper-storage",
        name: "Scala/Treppe",
        xCm: 770,
        yCm: 330,
        widthCm: 85,
        heightCm: 220,
      },
      {
        id: "upper-living",
        name: "Soggiorno/Wohnraum",
        xCm: 855,
        yCm: 392,
        widthCm: 545,
        heightCm: 438,
      },
    ],
    openings: [
      {
        id: "upper-top-window-130x90-left",
        type: "window",
        roomId: "upper-bedroom-left",
        side: "top",
        widthCm: 130,
        heightCm: 90,
        label: "130/90 FERRATINA",
      },
      {
        id: "upper-top-door-100x260",
        type: "door",
        roomId: "upper-kitchen",
        side: "top",
        widthCm: 100,
        heightCm: 260,
        label: "100/260",
      },
      {
        id: "upper-top-window-90x150",
        type: "window",
        roomId: "upper-bedroom-right",
        side: "top",
        widthCm: 90,
        heightCm: 150,
        label: "90/150 FERRATINA",
      },
      {
        id: "upper-top-window-130x90-right",
        type: "window",
        roomId: "upper-cellar",
        side: "top",
        widthCm: 130,
        heightCm: 90,
        label: "130/90 FERRATINA",
      },
      {
        id: "upper-bottom-door-190x211p4",
        type: "door",
        roomId: "upper-bedroom-left",
        side: "bottom",
        widthCm: 190,
        heightCm: 215,
        label: "190/211+4 LAMELLE",
      },
      {
        id: "upper-bottom-window-190x150",
        type: "window",
        roomId: "upper-living",
        side: "bottom",
        widthCm: 190,
        heightCm: 150,
        offsetCm: 355,
        label: "190/150 LAMELLE",
      },
      {
        id: "upper-bottom-window-300x150",
        type: "window",
        roomId: "upper-living",
        side: "bottom",
        widthCm: 300,
        heightCm: 150,
        offsetCm: 30,
        label: "300/150 LAMELLE",
      },
      {
        id: "upper-right-window-120x130",
        type: "window",
        roomId: "upper-bedroom-right",
        side: "right",
        widthCm: 120,
        heightCm: 130,
        label: "120/130 CLOSIE",
      },
      {
        id: "upper-right-door-120x214p4",
        type: "door",
        roomId: "upper-living",
        side: "right",
        widthCm: 120,
        heightCm: 218,
        label: "120/214+4 FERRATINA",
      },
    ],
  },
};

const cmToPx = (value) => value * PX_PER_CM;

const toPxRect = (room) => ({
  id: room.id,
  name: room.name,
  x: OUTER_WALL_BOUNDS.x + cmToPx(room.xCm),
  y: OUTER_WALL_BOUNDS.y + cmToPx(room.yCm),
  width: cmToPx(room.widthCm),
  height: cmToPx(room.heightCm),
});

const buildOpening = (opening, room) => {
  if (!room) {
    return {
      id: opening.id,
      type: opening.type,
      roomId: opening.roomId,
      label: opening.label,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
    };
  }

  const lengthCm = opening.widthCm;
  const lengthPx = cmToPx(lengthCm);
  const roomWidthCm = room.widthCm;
  const roomHeightCm = room.heightCm;
  const offsetCm =
    Number.isFinite(opening.offsetCm)
      ? opening.offsetCm
      : opening.side === "top" || opening.side === "bottom"
        ? (roomWidthCm - lengthCm) / 2
        : (roomHeightCm - lengthCm) / 2;

  let x1Cm = 0;
  let y1Cm = 0;
  let x2Cm = 0;
  let y2Cm = 0;

  switch (opening.side) {
    case "top":
      x1Cm = room.xCm + offsetCm;
      x2Cm = x1Cm + lengthCm;
      y1Cm = room.yCm;
      y2Cm = y1Cm;
      break;
    case "bottom":
      x1Cm = room.xCm + offsetCm;
      x2Cm = x1Cm + lengthCm;
      y1Cm = room.yCm + roomHeightCm;
      y2Cm = y1Cm;
      break;
    case "left":
      x1Cm = room.xCm;
      x2Cm = x1Cm;
      y1Cm = room.yCm + offsetCm;
      y2Cm = y1Cm + lengthCm;
      break;
    case "right":
      x1Cm = room.xCm + roomWidthCm;
      x2Cm = x1Cm;
      y1Cm = room.yCm + offsetCm;
      y2Cm = y1Cm + lengthCm;
      break;
    default:
      break;
  }

  return {
    id: opening.id,
    type: opening.type,
    roomId: opening.roomId,
    label: opening.label,
    x1: OUTER_WALL_BOUNDS.x + cmToPx(x1Cm),
    y1: OUTER_WALL_BOUNDS.y + cmToPx(y1Cm),
    x2: OUTER_WALL_BOUNDS.x + cmToPx(x2Cm),
    y2: OUTER_WALL_BOUNDS.y + cmToPx(y2Cm),
    heightMm: Number.isFinite(opening.heightCm) ? opening.heightCm * 10 : null,
  };
};

const buildFloorFromLayout = (layout) => {
  const rooms = layout.rooms.map((room) => ({
    ...toPxRect(room),
  }));
  const roomMap = new Map(layout.rooms.map((room) => [room.id, room]));
  const openings = layout.openings.map((opening) =>
    buildOpening(opening, roomMap.get(opening.roomId)),
  );

  return {
    id: layout.id,
    name: layout.name,
    rooms,
    openings,
  };
};

const buildLuganoFloorPlans = () => ({
  ground: buildFloorFromLayout(FLOOR_LAYOUT_CM.ground),
  upper: buildFloorFromLayout(FLOOR_LAYOUT_CM.upper),
});

const FLOORPLAN_CONFIG = {
  MM_PER_PX,
  DEFAULT_VIEWBOX,
  OUTER_WALL_BOUNDS,
  EXTERIOR_VIEWBOX,
  floorBounds,
};

export {
  buildLuganoFloorPlans,
  EXTERIOR_ROOMS,
  FLOORPLAN_CONFIG,
  MM_PER_PX,
};
