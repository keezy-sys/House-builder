import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const floorplanSize = { width: 800, height: 520 };
const floorBounds = { x: 50, y: 50, width: 680, height: 400 };
const MM_PER_PX = 20;
const WALL_HEIGHT_MM = 2800;
const MIN_ROOM_SIZE_PX = 60;

const LEGACY_ROOM_IDS = [
  "bedroom-left",
  "living",
  "bedroom-right",
  "cellar",
  "kitchen",
  "bathroom",
  "hallway",
  "storage",
];

const LEGACY_UPPER_LAYOUT = [
  { id: "upper-bedroom-left", x: 50, y: 50, width: 230, height: 160 },
  { id: "upper-living", x: 280, y: 50, width: 260, height: 160 },
  { id: "upper-bedroom-right", x: 540, y: 50, width: 190, height: 230 },
  { id: "upper-cellar", x: 50, y: 210, width: 230, height: 200 },
  { id: "upper-kitchen", x: 280, y: 210, width: 200, height: 150 },
  { id: "upper-bathroom", x: 480, y: 210, width: 170, height: 150 },
  { id: "upper-hallway", x: 280, y: 360, width: 330, height: 90 },
  { id: "upper-storage", x: 610, y: 360, width: 120, height: 90 },
];

const buildDefaultFloorPlans = () => ({
  ground: {
    id: "ground",
    name: "Erdgeschoss",
    rooms: [
      {
        id: "ground-bedroom-left",
        name: "Schlafzimmer",
        x: 50,
        y: 50,
        width: 230,
        height: 160,
      },
      {
        id: "ground-living",
        name: "Wohnzimmer",
        x: 280,
        y: 50,
        width: 260,
        height: 160,
      },
      {
        id: "ground-bedroom-right",
        name: "Schlafzimmer",
        x: 540,
        y: 50,
        width: 190,
        height: 230,
      },
      {
        id: "ground-cellar",
        name: "Keller",
        x: 50,
        y: 210,
        width: 230,
        height: 200,
      },
      {
        id: "ground-kitchen",
        name: "Küche",
        x: 280,
        y: 210,
        width: 200,
        height: 150,
      },
      {
        id: "ground-bathroom",
        name: "Bad",
        x: 480,
        y: 210,
        width: 170,
        height: 150,
      },
      {
        id: "ground-hallway",
        name: "Flur",
        x: 280,
        y: 360,
        width: 330,
        height: 90,
      },
      {
        id: "ground-storage",
        name: "Abstellschrank",
        x: 610,
        y: 360,
        width: 120,
        height: 90,
      },
    ],
    openings: [
      {
        id: "ground-window-left",
        type: "window",
        roomId: "ground-bedroom-left",
        label: "Fenster Schlafzimmer links (EG)",
        x1: 80,
        y1: 40,
        x2: 220,
        y2: 40,
      },
      {
        id: "ground-window-living",
        type: "window",
        roomId: "ground-living",
        label: "Fenster Wohnzimmer (EG)",
        x1: 320,
        y1: 40,
        x2: 520,
        y2: 40,
      },
      {
        id: "ground-window-right",
        type: "window",
        roomId: "ground-bedroom-right",
        label: "Fenster Schlafzimmer rechts (EG)",
        x1: 580,
        y1: 40,
        x2: 710,
        y2: 40,
      },
      {
        id: "ground-door-living-hall",
        type: "door",
        roomId: "ground-living",
        label: "Tür Wohnzimmer → Flur (EG)",
        x1: 380,
        y1: 210,
        x2: 460,
        y2: 210,
      },
      {
        id: "ground-door-kitchen-hall",
        type: "door",
        roomId: "ground-kitchen",
        label: "Tür Küche → Flur (EG)",
        x1: 340,
        y1: 360,
        x2: 400,
        y2: 360,
      },
      {
        id: "ground-door-bathroom-hall",
        type: "door",
        roomId: "ground-bathroom",
        label: "Tür Bad → Flur (EG)",
        x1: 520,
        y1: 360,
        x2: 580,
        y2: 360,
      },
      {
        id: "ground-door-bedroom-right",
        type: "door",
        roomId: "ground-bedroom-right",
        label: "Tür Schlafzimmer rechts (EG)",
        x1: 540,
        y1: 190,
        x2: 540,
        y2: 220,
      },
      {
        id: "ground-door-cellar",
        type: "door",
        roomId: "ground-cellar",
        label: "Tür Keller (EG)",
        x1: 250,
        y1: 260,
        x2: 280,
        y2: 260,
      },
    ],
  },
  upper: {
    id: "upper",
    name: "Obergeschoss",
    rooms: [
      {
        id: "upper-living",
        name: "Wohnzimmer",
        x: 50,
        y: 50,
        width: 310,
        height: 190,
      },
      {
        id: "upper-bedroom-left",
        name: "Schlafzimmer",
        x: 360,
        y: 50,
        width: 200,
        height: 120,
      },
      {
        id: "upper-bedroom-right",
        name: "Schlafzimmer",
        x: 560,
        y: 50,
        width: 170,
        height: 400,
      },
      {
        id: "upper-cellar",
        name: "Arbeitszimmer",
        x: 50,
        y: 240,
        width: 180,
        height: 210,
      },
      {
        id: "upper-kitchen",
        name: "Küche",
        x: 230,
        y: 240,
        width: 130,
        height: 210,
      },
      {
        id: "upper-hallway",
        name: "Flur",
        x: 360,
        y: 170,
        width: 200,
        height: 140,
      },
      {
        id: "upper-storage",
        name: "Treppe",
        x: 360,
        y: 310,
        width: 90,
        height: 140,
      },
      {
        id: "upper-bathroom",
        name: "Bad",
        x: 450,
        y: 310,
        width: 110,
        height: 140,
      },
    ],
    openings: [
      {
        id: "upper-window-living",
        type: "window",
        roomId: "upper-living",
        label: "Fenster Wohnzimmer (OG)",
        x1: 120,
        y1: 40,
        x2: 280,
        y2: 40,
      },
      {
        id: "upper-window-bedroom",
        type: "window",
        roomId: "upper-bedroom-left",
        label: "Fenster Schlafzimmer (OG)",
        x1: 400,
        y1: 40,
        x2: 520,
        y2: 40,
      },
      {
        id: "upper-window-office",
        type: "window",
        roomId: "upper-cellar",
        label: "Fenster Arbeitszimmer (OG)",
        x1: 40,
        y1: 300,
        x2: 40,
        y2: 360,
      },
      {
        id: "upper-door-living-hall",
        type: "door",
        roomId: "upper-living",
        label: "Tür Wohnzimmer → Flur (OG)",
        x1: 360,
        y1: 200,
        x2: 360,
        y2: 230,
      },
      {
        id: "upper-door-bedroom-hall",
        type: "door",
        roomId: "upper-bedroom-left",
        label: "Tür Schlafzimmer → Flur (OG)",
        x1: 430,
        y1: 170,
        x2: 470,
        y2: 170,
      },
      {
        id: "upper-door-bathroom-hall",
        type: "door",
        roomId: "upper-bathroom",
        label: "Tür Bad → Flur (OG)",
        x1: 490,
        y1: 310,
        x2: 530,
        y2: 310,
      },
      {
        id: "upper-door-bedroom-right",
        type: "door",
        roomId: "upper-bedroom-right",
        label: "Tür Schlafzimmer rechts (OG)",
        x1: 560,
        y1: 230,
        x2: 560,
        y2: 260,
      },
      {
        id: "upper-door-stairs-hall",
        type: "door",
        roomId: "upper-storage",
        label: "Tür Treppe → Flur (OG)",
        x1: 380,
        y1: 310,
        x2: 420,
        y2: 310,
      },
      {
        id: "upper-door-kitchen-stairs",
        type: "door",
        roomId: "upper-kitchen",
        label: "Tür Küche → Treppe (OG)",
        x1: 360,
        y1: 340,
        x2: 360,
        y2: 370,
      },
      {
        id: "upper-door-office-living",
        type: "door",
        roomId: "upper-cellar",
        label: "Tür Arbeitszimmer → Wohnzimmer (OG)",
        x1: 110,
        y1: 240,
        x2: 150,
        y2: 240,
      },
      {
        id: "upper-door-bedroom-balcony",
        type: "door",
        roomId: "upper-bedroom-right",
        label: "Tür Schlafzimmer rechts → Balkon (OG)",
        x1: 620,
        y1: 40,
        x2: 680,
        y2: 40,
      },
    ],
  },
});

const SHARED_STATE_TABLE = "house_state";
const SHARED_STATE_ID = "default";
const SAVE_DEBOUNCE_MS = 800;

const isPlaceholder = (value) =>
  !value || value.includes("YOUR_") || value.includes("your_");

const supabaseUrl = window.__SUPABASE_URL__ || "";
const supabaseAnonKey = window.__SUPABASE_ANON_KEY__ || "";
const supabaseConfigured =
  !isPlaceholder(supabaseUrl) && !isPlaceholder(supabaseAnonKey);
const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

const authState = {
  session: null,
  user: null,
  displayName: "",
};

const syncState = {
  saveTimer: null,
  lastSavedAt: 0,
  applyingRemote: false,
  subscription: null,
};

const isLocalHost = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

const state = {
  activeRoomId: null,
  activeFloorId: "ground",
  isAddingComment: false,
  isArchitectMode: false,
  floorPlans: buildDefaultFloorPlans(),
  roomData: {},
  selectedElement: null,
  show3d: false,
  wallLinkLocked: true,
};

const elements = {
  floorplan: document.getElementById("floorplan"),
  floorSwitch: document.getElementById("floor-toggle"),
  floorSwitchValue: document.getElementById("floor-label"),
  floorplanTitle: document.getElementById("floorplan-title"),
  roomTitle: document.getElementById("room-title"),
  roomSubtitle: document.getElementById("room-subtitle"),
  checklist: document.getElementById("checklist"),
  checklistForm: document.getElementById("checklist-form"),
  checklistInput: document.getElementById("checklist-input"),
  comments: document.getElementById("comments"),
  imageGallery: document.getElementById("image-gallery"),
  addCommentBtn: document.getElementById("add-comment"),
  clearSelectionBtn: document.getElementById("clear-selection"),
  uploadImageInput: document.getElementById("upload-image"),
  generateImageBtn: document.getElementById("generate-image"),
  toggleArchitect: document.getElementById("toggle-architect"),
  architectView: document.getElementById("architect-view"),
  architectTitle: document.getElementById("architect-title"),
  architectHelp: document.getElementById("architect-help"),
  measurementForm: document.getElementById("measurement-form"),
  measurementAxis: document.getElementById("measure-axis"),
  measurementAxisNumber: document.getElementById("measure-axis-number"),
  measurementAxisLabel: document.getElementById("measure-axis-label"),
  measurementSpan: document.getElementById("measure-span"),
  measurementSpanNumber: document.getElementById("measure-span-number"),
  measurementSpanLabel: document.getElementById("measure-span-label"),
  measurementLock: document.getElementById("measure-lock"),
  threeDPanel: document.getElementById("three-d-panel"),
  threeDButton: document.getElementById("toggle-3d"),
  threeDLabel: document.getElementById("three-d-label"),
  setApiKeyBtn: document.getElementById("set-api-key"),
  imageStatus: document.getElementById("image-status"),
  authScreen: document.getElementById("auth-screen"),
  loginForm: document.getElementById("login-form"),
  signupForm: document.getElementById("signup-form"),
  authError: document.getElementById("auth-error"),
  authInfo: document.getElementById("auth-info"),
  authUserName: document.getElementById("auth-user-name"),
  signOutBtn: document.getElementById("sign-out"),
};

const storageKey = "house-builder-state";
const apiKeyStorageKey = "house-builder-image-api-key";

const defaultRoomData = () => ({
  checklist: [],
  images: [],
  comments: [],
});

const buildStatePayload = () => ({
  roomData: state.roomData,
  floorPlans: state.floorPlans,
});

const saveStateLocal = () => {
  localStorage.setItem(storageKey, JSON.stringify(buildStatePayload()));
};

const loadStateLocal = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const applyStatePayload = (payload) => {
  state.roomData = migrateRoomData(payload?.roomData);
  state.floorPlans = cloneFloorPlans(loadFloorPlans(payload?.floorPlans));
  ensureRoomDataForFloors();
};

const hydrateStateFromLocal = () => {
  const localPayload = loadStateLocal();
  if (localPayload) {
    applyStatePayload(localPayload);
    return;
  }
  state.floorPlans = buildDefaultFloorPlans();
  ensureRoomDataForFloors();
};

const saveState = () => {
  saveStateLocal();
  queueRemoteSave();
};

const cloneFloorPlans = (floorPlans) =>
  JSON.parse(JSON.stringify(floorPlans || {}));

const migrateRoomData = (roomData) => {
  const migrated = { ...(roomData || {}) };
  LEGACY_ROOM_IDS.forEach((roomId) => {
    if (migrated[roomId] && !migrated[`ground-${roomId}`]) {
      migrated[`ground-${roomId}`] = migrated[roomId];
      delete migrated[roomId];
    }
  });
  return migrated;
};

const isLegacyUpperLayout = (floor) => {
  if (!floor || !Array.isArray(floor.rooms)) return false;
  if (floor.rooms.length !== LEGACY_UPPER_LAYOUT.length) return false;
  return LEGACY_UPPER_LAYOUT.every((legacyRoom) => {
    const room = floor.rooms.find((item) => item.id === legacyRoom.id);
    if (!room) return false;
    return (
      room.x === legacyRoom.x &&
      room.y === legacyRoom.y &&
      room.width === legacyRoom.width &&
      room.height === legacyRoom.height
    );
  });
};

const loadFloorPlans = (payloadFloorPlans) => {
  if (!payloadFloorPlans || typeof payloadFloorPlans !== "object") {
    return buildDefaultFloorPlans();
  }
  const fallback = buildDefaultFloorPlans();
  const floorPlans = {
    ground: payloadFloorPlans.ground || fallback.ground,
    upper: payloadFloorPlans.upper || fallback.upper,
  };
  if (isLegacyUpperLayout(floorPlans.upper)) {
    floorPlans.upper = fallback.upper;
  }
  return floorPlans;
};

const ensureRoomData = (roomId) => {
  if (!state.roomData[roomId]) {
    state.roomData[roomId] = defaultRoomData();
  }
  return state.roomData[roomId];
};

const ensureRoomDataForFloors = () => {
  Object.values(state.floorPlans).forEach((floor) => {
    floor.rooms.forEach((room) => {
      if (!state.roomData[room.id]) {
        state.roomData[room.id] = defaultRoomData();
      }
    });
  });
};

const getActiveFloor = () =>
  state.floorPlans[state.activeFloorId] || state.floorPlans.ground;

const findRoomById = (roomId) => {
  for (const floor of Object.values(state.floorPlans)) {
    const room = floor.rooms.find((item) => item.id === roomId);
    if (room) return room;
  }
  return null;
};

const toMm = (px) => Math.round(px * MM_PER_PX);
const toPx = (mm) => Number(mm) / MM_PER_PX;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const rangesOverlap = (startA, endA, startB, endB) =>
  Math.max(startA, startB) <= Math.min(endA, endB);

const buildWallSegments = (rooms) => {
  const segments = new Map();
  rooms.forEach((room) => {
    const edges = [
      { x1: room.x, y1: room.y, x2: room.x + room.width, y2: room.y },
      {
        x1: room.x + room.width,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y + room.height,
      },
      {
        x1: room.x,
        y1: room.y + room.height,
        x2: room.x + room.width,
        y2: room.y + room.height,
      },
      { x1: room.x, y1: room.y, x2: room.x, y2: room.y + room.height },
    ];
    edges.forEach((edge) => {
      const key = `${edge.x1},${edge.y1},${edge.x2},${edge.y2}`;
      const reverseKey = `${edge.x2},${edge.y2},${edge.x1},${edge.y1}`;
      if (segments.has(key)) return;
      if (segments.has(reverseKey)) return;
      segments.set(key, edge);
    });
  });
  return Array.from(segments.values());
};

const getWallForRoomSide = (room, side) => {
  const right = room.x + room.width;
  const bottom = room.y + room.height;
  switch (side) {
    case "top":
      return { x1: room.x, y1: room.y, x2: right, y2: room.y };
    case "right":
      return { x1: right, y1: room.y, x2: right, y2: bottom };
    case "bottom":
      return { x1: room.x, y1: bottom, x2: right, y2: bottom };
    case "left":
      return { x1: room.x, y1: room.y, x2: room.x, y2: bottom };
    default:
      return null;
  }
};

const getWallMeta = (wall) => {
  const isVertical = wall.x1 === wall.x2;
  const position = isVertical ? wall.x1 : wall.y1;
  const spanStart = isVertical ? Math.min(wall.y1, wall.y2) : Math.min(wall.x1, wall.x2);
  const spanEnd = isVertical ? Math.max(wall.y1, wall.y2) : Math.max(wall.x1, wall.x2);
  const length = spanEnd - spanStart;
  return {
    orientation: isVertical ? "vertical" : "horizontal",
    axis: isVertical ? "x" : "y",
    position,
    spanStart,
    spanEnd,
    length,
  };
};

const getRoomMeasurements = (room) => ({
  width: toMm(room.width),
  length: toMm(room.height),
  height: WALL_HEIGHT_MM,
});

const getRoomsSharingWall = (floor, wallMeta) => {
  const matches = [];
  floor.rooms.forEach((room) => {
    const edges = [
      {
        edge: "left",
        coord: room.x,
        spanStart: room.y,
        spanEnd: room.y + room.height,
      },
      {
        edge: "right",
        coord: room.x + room.width,
        spanStart: room.y,
        spanEnd: room.y + room.height,
      },
      {
        edge: "top",
        coord: room.y,
        spanStart: room.x,
        spanEnd: room.x + room.width,
      },
      {
        edge: "bottom",
        coord: room.y + room.height,
        spanStart: room.x,
        spanEnd: room.x + room.width,
      },
    ];
    edges.forEach((edge) => {
      if (edge.coord !== wallMeta.position) return;
      if (!rangesOverlap(edge.spanStart, edge.spanEnd, wallMeta.spanStart, wallMeta.spanEnd))
        return;
      matches.push({ room, edge: edge.edge });
    });
  });
  return matches;
};

const getPositionConstraints = (floor, wallMeta, affectedRooms) => {
  const minBound = wallMeta.axis === "x" ? floorBounds.x : floorBounds.y;
  const maxBound =
    wallMeta.axis === "x"
      ? floorBounds.x + floorBounds.width
      : floorBounds.y + floorBounds.height;
  if (wallMeta.position === minBound || wallMeta.position === maxBound) {
    return { min: wallMeta.position, max: wallMeta.position };
  }

  let min = minBound;
  let max = maxBound;

  affectedRooms.forEach(({ room, edge }) => {
    if (edge === "left") {
      max = Math.min(max, room.x + room.width - MIN_ROOM_SIZE_PX);
    } else if (edge === "right") {
      min = Math.max(min, room.x + MIN_ROOM_SIZE_PX);
    } else if (edge === "top") {
      max = Math.min(max, room.y + room.height - MIN_ROOM_SIZE_PX);
    } else if (edge === "bottom") {
      min = Math.max(min, room.y + MIN_ROOM_SIZE_PX);
    }
  });

  return { min, max };
};

const applyWallPosition = (floor, wallMeta, affectedRooms, newPosition) => {
  affectedRooms.forEach(({ room, edge }) => {
    if (edge === "left") {
      const right = room.x + room.width;
      room.x = newPosition;
      room.width = right - newPosition;
    } else if (edge === "right") {
      room.width = newPosition - room.x;
    } else if (edge === "top") {
      const bottom = room.y + room.height;
      room.y = newPosition;
      room.height = bottom - newPosition;
    } else if (edge === "bottom") {
      room.height = newPosition - room.y;
    }
  });
};

const applyWallLength = (room, wallMeta, newLength) => {
  if (wallMeta.orientation === "vertical") {
    room.height = newLength;
  } else {
    room.width = newLength;
  }
};

const updateOpeningsForWallMove = (floor, wallMeta, oldPosition, newPosition) => {
  floor.openings.forEach((opening) => {
    if (wallMeta.orientation === "vertical") {
      if (opening.x1 !== oldPosition || opening.x2 !== oldPosition) return;
      const spanStart = Math.min(opening.y1, opening.y2);
      const spanEnd = Math.max(opening.y1, opening.y2);
      if (!rangesOverlap(spanStart, spanEnd, wallMeta.spanStart, wallMeta.spanEnd))
        return;
      opening.x1 = newPosition;
      opening.x2 = newPosition;
    } else {
      if (opening.y1 !== oldPosition || opening.y2 !== oldPosition) return;
      const spanStart = Math.min(opening.x1, opening.x2);
      const spanEnd = Math.max(opening.x1, opening.x2);
      if (!rangesOverlap(spanStart, spanEnd, wallMeta.spanStart, wallMeta.spanEnd))
        return;
      opening.y1 = newPosition;
      opening.y2 = newPosition;
    }
  });
};

const getDisplayName = (user) =>
  user?.user_metadata?.name || user?.email || "Unbekannt";

const setAuthMessage = (message, isError = true) => {
  if (!elements.authError) return;
  elements.authError.textContent = message || "";
  elements.authError.classList.toggle("error", Boolean(message && isError));
};

const formatAuthError = (error) => {
  const message = String(error?.message || "").trim();
  if (!message) {
    return "Anmeldung fehlgeschlagen.";
  }
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Anmeldung fehlgeschlagen. Passwort prüfen oder E-Mail zuerst bestätigen.";
  }
  if (normalized.includes("email not confirmed")) {
    return "Bitte E-Mail bestätigen, bevor du dich anmeldest.";
  }
  if (normalized.includes("redirect") && normalized.includes("not allowed")) {
    return "Redirect-URL nicht erlaubt. In Supabase Auth → URL Configuration diese Domain erlauben.";
  }
  return message;
};

const setAuthFormsEnabled = (isEnabled) => {
  [elements.loginForm, elements.signupForm].forEach((form) => {
    if (!form) return;
    form.querySelectorAll("input, button").forEach((input) => {
      input.disabled = !isEnabled;
    });
  });
};

const setAuthScreenVisible = (isVisible) => {
  if (!elements.authScreen) return;
  elements.authScreen.hidden = !isVisible;
  document.body.classList.toggle("auth-locked", isVisible);
};

const updateAuthUI = () => {
  const isAuthed = Boolean(authState.user);
  setAuthScreenVisible(!isAuthed);
  if (elements.authInfo) {
    elements.authInfo.hidden = !isAuthed;
  }
  if (elements.authUserName) {
    elements.authUserName.textContent = isAuthed
      ? authState.displayName
      : "";
  }
};

const refreshUI = () => {
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  updateFloorButtons();
};

const getInitialPayload = () =>
  loadStateLocal() || {
    roomData: {},
    floorPlans: buildDefaultFloorPlans(),
  };

const loadRemoteState = async () => {
  if (!supabase || !authState.user) return;
  const { data, error } = await supabase
    .from(SHARED_STATE_TABLE)
    .select("data, updated_at")
    .eq("id", SHARED_STATE_ID)
    .maybeSingle();

  if (error) {
    console.error("Supabase Laden fehlgeschlagen:", error);
    const fallback = getInitialPayload();
    applyStatePayload(fallback);
    saveStateLocal();
    refreshUI();
    return;
  }

  if (data?.data) {
    applyStatePayload(data.data);
    saveStateLocal();
    refreshUI();
    return;
  }

  const initial = getInitialPayload();
  const { error: insertError } = await supabase
    .from(SHARED_STATE_TABLE)
    .upsert({
      id: SHARED_STATE_ID,
      data: initial,
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error("Supabase Initialisierung fehlgeschlagen:", insertError);
  }
  applyStatePayload(initial);
  saveStateLocal();
  refreshUI();
};

const queueRemoteSave = () => {
  if (!supabase || !authState.user || syncState.applyingRemote) return;
  window.clearTimeout(syncState.saveTimer);
  syncState.saveTimer = window.setTimeout(() => {
    void pushStateToSupabase();
  }, SAVE_DEBOUNCE_MS);
};

const pushStateToSupabase = async () => {
  if (!supabase || !authState.user) return;
  const payload = buildStatePayload();
  const timestamp = new Date().toISOString();
  syncState.lastSavedAt = Date.now();

  const { error } = await supabase.from(SHARED_STATE_TABLE).upsert({
    id: SHARED_STATE_ID,
    data: payload,
    updated_at: timestamp,
  });

  if (error) {
    console.error("Supabase Speichern fehlgeschlagen:", error);
  }
};

const clearStateSubscription = () => {
  if (!supabase || !syncState.subscription) return;
  supabase.removeChannel(syncState.subscription);
  syncState.subscription = null;
};

const subscribeToStateChanges = () => {
  if (!supabase) return;
  clearStateSubscription();
  syncState.subscription = supabase
    .channel("house_state")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: SHARED_STATE_TABLE,
        filter: `id=eq.${SHARED_STATE_ID}`,
      },
      (payload) => {
        const remotePayload = payload?.new?.data;
        if (!remotePayload) return;
        const updatedAt = payload?.new?.updated_at;
        const updatedTimestamp = updatedAt
          ? new Date(updatedAt).getTime()
          : 0;
        if (updatedTimestamp && updatedTimestamp <= syncState.lastSavedAt + 1500)
          return;

        syncState.applyingRemote = true;
        applyStatePayload(remotePayload);
        saveStateLocal();
        refreshUI();
        syncState.applyingRemote = false;
      },
    )
    .subscribe();
};

const handleSessionChange = async (session) => {
  const previousUserId = authState.user?.id;
  authState.session = session;
  authState.user = session?.user ?? null;
  authState.displayName = authState.user
    ? getDisplayName(authState.user)
    : "";
  updateAuthUI();
  if (authState.user) {
    setAuthMessage("", false);
  }

  if (!authState.user) {
    clearStateSubscription();
    return;
  }

  if (authState.user.id !== previousUserId) {
    await loadRemoteState();
    subscribeToStateChanges();
  }
};

const initAuth = async () => {
  if (!supabaseConfigured) {
    setAuthFormsEnabled(false);
    setAuthScreenVisible(true);
    setAuthMessage(
      "Supabase ist nicht konfiguriert. Bitte config.js ausfüllen.",
    );
    return;
  }

  setAuthFormsEnabled(true);
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Supabase Sessionfehler:", error);
    setAuthMessage("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
  }
  await handleSessionChange(data?.session ?? null);
  supabase.auth.onAuthStateChange((event, session) => {
    void handleSessionChange(session);
  });
};

const handleLogin = async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const formData = new FormData(event.target);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (!email || !password) {
    setAuthMessage("Bitte E-Mail und Passwort eingeben.");
    return;
  }
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    setAuthMessage(formatAuthError(error));
    return;
  }
  setAuthMessage("");
  event.target.reset();
};

const handleSignup = async (event) => {
  event.preventDefault();
  if (!supabase) return;
  const formData = new FormData(event.target);
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  if (!name || !email || !password) {
    setAuthMessage("Bitte Name, E-Mail und Passwort eingeben.");
    return;
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  if (error) {
    setAuthMessage(formatAuthError(error));
    return;
  }
  if (!data.session) {
    setAuthMessage(
      "Konto angelegt. Bitte E-Mail bestätigen (ggf. Spam-Ordner).",
      false,
    );
  } else {
    setAuthMessage("", false);
  }
  event.target.reset();
};

const handleSignOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

const renderFloorplan = () => {
  elements.floorplan.innerHTML = "";
  const floor = getActiveFloor();
  if (!floor) return;

  const outline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect",
  );
  outline.setAttribute("x", 30);
  outline.setAttribute("y", 30);
  outline.setAttribute("width", 740);
  outline.setAttribute("height", 460);
  outline.setAttribute("class", "outer-wall");
  elements.floorplan.appendChild(outline);

  buildWallSegments(floor.rooms).forEach((wall) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", wall.x1);
    line.setAttribute("y1", wall.y1);
    line.setAttribute("x2", wall.x2);
    line.setAttribute("y2", wall.y2);
    line.setAttribute("class", "interior-wall");
    elements.floorplan.appendChild(line);
  });

  floor.rooms.forEach((room) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", room.x);
    rect.setAttribute("y", room.y);
    rect.setAttribute("width", room.width);
    rect.setAttribute("height", room.height);
    rect.setAttribute(
      "class",
      `room-hit${state.activeRoomId === room.id ? " active" : ""}`,
    );
    rect.dataset.roomId = room.id;

    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", room.x + 12);
    label.setAttribute("y", room.y + 28);
    label.setAttribute("class", "room-label");
    label.textContent = room.name;

    elements.floorplan.appendChild(rect);
    elements.floorplan.appendChild(label);
  });

  floor.rooms.forEach((room) => {
    const wallSegments = [
      {
        x1: room.x,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y,
        position: "oben",
        side: "top",
      },
      {
        x1: room.x + room.width,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y + room.height,
        position: "rechts",
        side: "right",
      },
      {
        x1: room.x,
        y1: room.y + room.height,
        x2: room.x + room.width,
        y2: room.y + room.height,
        position: "unten",
        side: "bottom",
      },
      {
        x1: room.x,
        y1: room.y,
        x2: room.x,
        y2: room.y + room.height,
        position: "links",
        side: "left",
      },
    ];

    wallSegments.forEach((wall) => {
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", wall.x1);
      line.setAttribute("y1", wall.y1);
      line.setAttribute("x2", wall.x2);
      line.setAttribute("y2", wall.y2);
      line.setAttribute("class", "wall-line architect-hit");
      line.dataset.roomId = room.id;
      line.dataset.floorId = floor.id;
      line.dataset.elementType = "wall";
      line.dataset.wallSide = wall.side;
      line.dataset.elementLabel = `${room.name} – Wand ${wall.position}`;
      elements.floorplan.appendChild(line);
    });
  });

  floor.openings.forEach((opening) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", opening.x1);
    line.setAttribute("y1", opening.y1);
    line.setAttribute("x2", opening.x2);
    line.setAttribute("y2", opening.y2);
    line.setAttribute(
      "class",
      `${opening.type === "door" ? "door-marker" : "window-marker"} architect-hit`,
    );
    line.dataset.roomId = opening.roomId;
    line.dataset.floorId = floor.id;
    line.dataset.elementType = opening.type;
    line.dataset.elementLabel = opening.label;
    elements.floorplan.appendChild(line);
  });

  floor.rooms.forEach((room) => {
    const roomData = ensureRoomData(room.id);
    roomData.comments.forEach((comment) => {
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      marker.setAttribute("cx", comment.x);
      marker.setAttribute("cy", comment.y);
      marker.setAttribute("r", 6);
      marker.setAttribute("class", "comment-marker");
      marker.dataset.roomId = room.id;
      elements.floorplan.appendChild(marker);
    });
  });
};

const renderRoomPanel = () => {
  if (!state.activeRoomId) {
    elements.roomTitle.textContent = "Bitte wählen Sie einen Raum";
    elements.roomSubtitle.textContent =
      "Klicken Sie auf einen Raum im Grundriss, um Details zu sehen.";
    elements.checklist.innerHTML = "";
    elements.comments.innerHTML = "";
    elements.imageGallery.innerHTML = "";
    elements.threeDPanel.hidden = true;
    return;
  }

  const room = findRoomById(state.activeRoomId);
  if (!room) {
    elements.roomTitle.textContent = "Bitte wählen Sie einen Raum";
    elements.roomSubtitle.textContent =
      "Klicken Sie auf einen Raum im Grundriss, um Details zu sehen.";
    elements.checklist.innerHTML = "";
    elements.comments.innerHTML = "";
    elements.imageGallery.innerHTML = "";
    elements.threeDPanel.hidden = true;
    return;
  }
  const roomData = ensureRoomData(state.activeRoomId);

  elements.roomTitle.textContent = room.name;
  elements.roomSubtitle.textContent =
    "Aufgaben bearbeiten, Fotos ansehen oder Notizen hinterlassen.";
  elements.threeDLabel.textContent = `3D-Ansicht für ${room.name}`;
  elements.threeDPanel.hidden = false;
  elements.threeDPanel.classList.toggle("open", state.show3d);
  elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";
  update3DBox(room.id);

  renderChecklist(roomData);
  renderComments(roomData);
  renderImages(roomData);
};

const renderChecklist = (roomData) => {
  elements.checklist.innerHTML = "";
  roomData.checklist.forEach((item, index) => {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = item;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Entfernen";
    removeBtn.addEventListener("click", () => {
      roomData.checklist.splice(index, 1);
      saveState();
      renderChecklist(roomData);
    });

    li.appendChild(text);
    li.appendChild(removeBtn);
    elements.checklist.appendChild(li);
  });
};

const renderComments = (roomData) => {
  elements.comments.innerHTML = "";
  roomData.comments.forEach((comment) => {
    const li = document.createElement("li");
    const author = comment.userName || comment.userEmail || "Unbekannt";
    li.textContent = `${author}: ${comment.text}`;
    elements.comments.appendChild(li);
  });
};

const renderImages = (roomData) => {
  elements.imageGallery.innerHTML = "";
  roomData.images.forEach((image) => {
    const card = document.createElement("div");
    card.className = "image-card";

    if (image.url) {
      const img = document.createElement("img");
      img.src = image.url;
      img.alt = image.label;
      card.appendChild(img);
    }

    const caption = document.createElement("div");
    caption.textContent = image.label;
    card.appendChild(caption);

    elements.imageGallery.appendChild(card);
  });
};

const renderArchitectPanel = () => {
  if (!state.isArchitectMode || !state.selectedElement) {
    elements.architectTitle.textContent = "Element wählen";
    if (elements.architectHelp) {
      elements.architectHelp.textContent = "";
    }
    elements.measurementForm.hidden = true;
    return;
  }

  const { roomId, label, elementType, wallSide, floorId } = state.selectedElement;
  elements.architectTitle.textContent = label;

  if (elementType !== "wall") {
    if (elements.architectHelp) {
      elements.architectHelp.textContent =
        "Maße sind aktuell nur für Wände verfügbar.";
    }
    elements.measurementForm.hidden = true;
    return;
  }

  const floor = state.floorPlans[floorId] || getActiveFloor();
  const room = floor.rooms.find((item) => item.id === roomId);
  if (!room) {
    elements.measurementForm.hidden = true;
    return;
  }

  const wall = getWallForRoomSide(room, wallSide);
  if (!wall) {
    elements.measurementForm.hidden = true;
    return;
  }
  const wallMeta = getWallMeta(wall);
  const affectedRooms = state.wallLinkLocked
    ? getRoomsSharingWall(floor, wallMeta)
    : [{ room, edge: wallSide }];
  const { min, max } = getPositionConstraints(floor, wallMeta, affectedRooms);
  const positionPx = clamp(wallMeta.position, min, max);

  const axisLabel =
    wallMeta.orientation === "vertical"
      ? "X-Position der Wand (mm)"
      : "Y-Position der Wand (mm)";
  const spanLabel =
    wallMeta.orientation === "vertical"
      ? "Y-Länge der Wand (mm)"
      : "X-Länge der Wand (mm)";

  const positionMinMm = toMm(min);
  const positionMaxMm = toMm(max);
  const positionMm = toMm(positionPx);

  const lengthMinMm = toMm(MIN_ROOM_SIZE_PX);
  const lengthMaxPx =
    wallMeta.orientation === "vertical"
      ? floorBounds.y + floorBounds.height - room.y
      : floorBounds.x + floorBounds.width - room.x;
  const lengthMaxMm = toMm(lengthMaxPx);
  const lengthMm = toMm(wallMeta.length);

  const positionEditable = min !== max;
  if (elements.measurementAxisLabel) {
    elements.measurementAxisLabel.textContent = axisLabel;
  }
  if (elements.measurementSpanLabel) {
    elements.measurementSpanLabel.textContent = spanLabel;
  }
  if (elements.measurementLock) {
    elements.measurementLock.checked = state.wallLinkLocked;
  }
  if (elements.architectHelp) {
    elements.architectHelp.textContent = !positionEditable
      ? "Außenwände sind fixiert und können nicht verschoben werden."
      : state.wallLinkLocked
      ? "Wände sind gekoppelt: Position verschiebt angrenzende Räume."
      : "Kopplung gelöst: Änderungen wirken nur auf diese Wand.";
  }

  elements.measurementAxis.min = positionMinMm;
  elements.measurementAxis.max = positionMaxMm;
  elements.measurementAxis.step = MM_PER_PX;
  elements.measurementAxis.value = positionMm;
  elements.measurementAxis.disabled = !positionEditable;

  elements.measurementAxisNumber.min = positionMinMm;
  elements.measurementAxisNumber.max = positionMaxMm;
  elements.measurementAxisNumber.step = MM_PER_PX;
  elements.measurementAxisNumber.value = positionMm;
  elements.measurementAxisNumber.disabled = !positionEditable;

  elements.measurementSpan.min = lengthMinMm;
  elements.measurementSpan.max = lengthMaxMm;
  elements.measurementSpan.step = MM_PER_PX;
  elements.measurementSpan.value = lengthMm;
  elements.measurementSpan.disabled = state.wallLinkLocked;

  elements.measurementSpanNumber.min = lengthMinMm;
  elements.measurementSpanNumber.max = lengthMaxMm;
  elements.measurementSpanNumber.step = MM_PER_PX;
  elements.measurementSpanNumber.value = lengthMm;
  elements.measurementSpanNumber.disabled = state.wallLinkLocked;

  elements.measurementForm.hidden = false;
};

const update3DBox = (roomId) => {
  const room = findRoomById(roomId);
  if (!room) return;
  const measurement = getRoomMeasurements(room);

  const widthScale = Math.max(90, Math.min(200, measurement.width / 30));
  const lengthScale = Math.max(70, Math.min(160, measurement.length / 30));
  const depth = Math.round(
    Math.max(40, Math.min(120, measurement.height / 60)),
  );

  const box = elements.threeDPanel.querySelector(".three-d-box");
  box.style.setProperty("--box-width", `${widthScale}px`);
  box.style.setProperty("--box-height", `${lengthScale}px`);
  box.style.setProperty("--box-depth", `${depth}px`);
};

const clearHoverState = () => {
  elements.floorplan
    .querySelectorAll(".architect-hit.hovered")
    .forEach((el) => el.classList.remove("hovered"));
};

const setArchitectMode = (isOn) => {
  state.isArchitectMode = isOn;
  elements.architectView.hidden = !isOn;
  state.selectedElement = null;
  document.body.classList.toggle("architect-mode", isOn);
  clearHoverState();
  renderArchitectPanel();
};

const updateFloorButtons = () => {
  const floorName = getActiveFloor()?.name || "Etage";
  if (elements.floorSwitch) {
    elements.floorSwitch.value = state.activeFloorId === "upper" ? "1" : "0";
  }
  if (elements.floorSwitchValue) {
    elements.floorSwitchValue.textContent = floorName;
  }
  if (elements.floorplanTitle) {
    elements.floorplanTitle.textContent = `Interaktiver Grundriss – ${floorName}`;
  }
};

const setActiveFloor = (floorId) => {
  if (!state.floorPlans[floorId]) return;
  state.activeFloorId = floorId;
  state.activeRoomId = null;
  state.selectedElement = null;
  state.isAddingComment = false;
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  updateFloorButtons();
};

const selectRoom = (roomId) => {
  state.activeRoomId = roomId;
  state.isAddingComment = false;
  state.show3d = false;
  if (!roomId) {
    state.selectedElement = null;
  }
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
};

const selectArchitectElement = (target) => {
  const roomId = target.dataset.roomId;
  const label = target.dataset.elementLabel || "Element";
  const elementType = target.dataset.elementType || "element";
  const wallSide = target.dataset.wallSide || null;
  const floorId = target.dataset.floorId || state.activeFloorId;
  if (!roomId) {
    return;
  }
  if (state.activeFloorId !== floorId) {
    state.activeFloorId = floorId;
  }
  if (state.activeRoomId !== roomId) {
    state.activeRoomId = roomId;
    renderRoomPanel();
    renderFloorplan();
  }
  state.selectedElement = { roomId, label, elementType, wallSide, floorId };
  renderArchitectPanel();
};

const handleAddComment = (event) => {
  if (!state.activeRoomId || !state.isAddingComment) {
    return;
  }

  const bounds = elements.floorplan.getBoundingClientRect();
  const x =
    ((event.clientX - bounds.left) / bounds.width) * floorplanSize.width;
  const y =
    ((event.clientY - bounds.top) / bounds.height) * floorplanSize.height;

  const room = findRoomById(state.activeRoomId);
  if (!room) {
    return;
  }
  const withinRoom =
    x >= room.x &&
    x <= room.x + room.width &&
    y >= room.y &&
    y <= room.y + room.height;

  if (!withinRoom) {
    return;
  }

  const commentText = window.prompt("Wie lautet der Kommentar?");
  if (!commentText) {
    return;
  }

  if (!authState.user) {
    window.alert("Bitte anmelden, um Kommentare zu speichern.");
    return;
  }

  const userName = getDisplayName(authState.user);
  const roomData = ensureRoomData(state.activeRoomId);
  roomData.comments.unshift({
    id: `comment-${Date.now()}`,
    userId: authState.user.id,
    userName,
    userEmail: authState.user.email || "",
    text: commentText,
    x,
    y,
  });

  state.isAddingComment = false;
  saveState();
  renderFloorplan();
  renderComments(roomData);
};

const requireActiveRoom = (message) => {
  if (state.activeRoomId) return true;
  window.alert(message || "Bitte zuerst einen Raum auswählen.");
  return false;
};

const handleChecklistSubmit = (event) => {
  event.preventDefault();
  if (
    !requireActiveRoom(
      "Bitte zuerst einen Raum auswählen, bevor Sie Aufgaben hinzufügen.",
    )
  )
    return;
  const value = elements.checklistInput.value.trim();
  if (!value) {
    return;
  }
  const roomData = ensureRoomData(state.activeRoomId);
  roomData.checklist.unshift(value);
  elements.checklistInput.value = "";
  saveState();
  renderChecklist(roomData);
};

const buildPlaceholderImage = (text) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23e2e8f0'/><stop offset='100%' stop-color='%23f8fafc'/></linearGradient></defs><rect width='320' height='200' fill='url(%23g)'/><text x='50%' y='50%' fill='%234b5563' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle'>${text
      .slice(0, 36)
      .replace(/</g, "")}</text></svg>`,
  )}`;

const readApiKey = () => localStorage.getItem(apiKeyStorageKey) || "";
const writeApiKey = (value) =>
  localStorage.setItem(apiKeyStorageKey, value || "");

const setImageStatus = (text, isError = false) => {
  if (!elements.imageStatus) return;
  elements.imageStatus.textContent = text;
  elements.imageStatus.classList.toggle("status-line", true);
  elements.imageStatus.classList.toggle("error", isError);
};

const isLikelyNetworkBlock = (error) => {
  const message = error?.message || "";
  return (
    message.includes("Failed to fetch") ||
    message.includes("NetworkError") ||
    message.includes("ERR_BLOCKED") ||
    message.includes("TypeError: Network request failed")
  );
};

const handleSetApiKey = () => {
  if (!isLocalHost) {
    setImageStatus(
      "API-Schlüssel wird serverseitig verwaltet. Bitte in Netlify setzen.",
      true,
    );
    return;
  }
  const key = window.prompt(
    "Bitte OpenAI API-Schlüssel eingeben (wird lokal gespeichert).",
  );
  if (key === null) return;
  const trimmedKey = key.trim();
  writeApiKey(trimmedKey);
  setImageStatus(
    trimmedKey
      ? "API-Schlüssel gespeichert. Bilder werden lokal erzeugt."
      : "Kein API-Schlüssel gespeichert. Server-KEY fehlt.",
  );
};

const generateImageWithOpenAI = async (promptText, roomData) => {
  const apiKey = readApiKey();
  const requestId = `img-${Date.now()}`;
  const label = `ChatGPT-Anfrage: ${promptText}`;

  const pushImage = (url) => {
    roomData.images.unshift({
      id: requestId,
      label,
      url,
    });
    saveState();
    renderImages(roomData);
  };

  if (window.location.protocol === "file:") {
    pushImage(buildPlaceholderImage(promptText || "Idee ohne Beschreibung"));
    setImageStatus(
      "Bildgenerierung benötigt einen lokalen Server. Bitte über npm run serve öffnen.",
      true,
    );
    return;
  }

  try {
    setImageStatus("Bild wird erzeugt …");
    elements.generateImageBtn.disabled = true;

    const requestBody = {
      prompt: promptText,
    };
    if (isLocalHost && apiKey) {
      requestBody.apiKey = apiKey;
    }

    const response = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const error = new Error(data?.error || `HTTP ${response.status}`);
      error.code = data?.code;
      throw error;
    }

    const imageUrl = data?.imageUrl;
    if (!imageUrl) {
      const error = new Error("Kein Bild zurückgegeben");
      error.code = "missing_image_data";
      throw error;
    }

    pushImage(imageUrl);
    setImageStatus("Bild wurde erzeugt.");
  } catch (error) {
    console.error("Bildgenerierung fehlgeschlagen:", error);
    pushImage(buildPlaceholderImage(promptText || "Idee ohne Beschreibung"));
    const networkBlocked = isLikelyNetworkBlock(error);
    const message =
      error?.code === "missing_api_key"
        ? "Kein API-Schlüssel gefunden – im Dialog speichern oder OPENAI_API_KEY am Server setzen."
        : error?.code === "openai_network_error"
        ? "Netzwerk blockiert – HTTPS zu api.openai.com ist gesperrt. Zugriff erlauben und erneut versuchen."
        : networkBlocked
        ? "Lokaler Bilddienst nicht erreichbar. App über npm run serve starten."
        : error?.code === "openai_error"
        ? `OpenAI-Fehler: ${error.message}`
        : "Bildgenerierung fehlgeschlagen – Platzhalter gespeichert. API-Schlüssel prüfen?";
    setImageStatus(message, true);
  } finally {
    elements.generateImageBtn.disabled = false;
  }
};

const handleGenerateImage = () => {
  if (
    !requireActiveRoom(
      "Bitte wählen Sie einen Raum, bevor Sie eine Bildidee speichern.",
    )
  )
    return;

  const promptText =
    window.prompt("Beschreiben Sie das Bild, das erzeugt werden soll.") ||
    "Idee ohne Beschreibung";

  const roomData = ensureRoomData(state.activeRoomId);
  generateImageWithOpenAI(promptText, roomData);
};

const handleUploadImage = (event) => {
  if (
    !requireActiveRoom(
      "Bitte zuerst einen Raum auswählen, bevor Sie ein Foto hochladen.",
    )
  )
    return;
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const roomData = ensureRoomData(state.activeRoomId);
    roomData.images.unshift({
      id: `img-${Date.now()}`,
      label: file.name,
      url: loadEvent.target.result,
    });
    saveState();
    renderImages(roomData);
  };
  reader.readAsDataURL(file);
};

const handleMeasurementSubmit = (event) => {
  event.preventDefault();
  if (!state.selectedElement || state.selectedElement.elementType !== "wall") {
    return;
  }
  const { roomId, wallSide, floorId } = state.selectedElement;
  const floor = state.floorPlans[floorId] || getActiveFloor();
  const room = floor.rooms.find((item) => item.id === roomId);
  if (!room) {
    return;
  }
  const wall = getWallForRoomSide(room, wallSide);
  if (!wall) {
    return;
  }
  const wallMeta = getWallMeta(wall);
  const affectedRooms = state.wallLinkLocked
    ? getRoomsSharingWall(floor, wallMeta)
    : [{ room, edge: wallSide }];
  const { min, max } = getPositionConstraints(floor, wallMeta, affectedRooms);
  const oldPosition = wallMeta.position;
  const newPosition = clamp(
    toPx(elements.measurementAxisNumber.value || elements.measurementAxis.value),
    min,
    max,
  );

  if (Math.abs(newPosition - oldPosition) > 0.01) {
    applyWallPosition(floor, wallMeta, affectedRooms, newPosition);
    updateOpeningsForWallMove(floor, wallMeta, oldPosition, newPosition);
  }

  if (!state.wallLinkLocked) {
    const maxLengthPx =
      wallMeta.orientation === "vertical"
        ? floorBounds.y + floorBounds.height - room.y
        : floorBounds.x + floorBounds.width - room.x;
    const newLength = clamp(
      toPx(
        elements.measurementSpanNumber.value || elements.measurementSpan.value,
      ),
      MIN_ROOM_SIZE_PX,
      maxLengthPx,
    );
    if (Math.abs(newLength - wallMeta.length) > 0.01) {
      applyWallLength(room, wallMeta, newLength);
    }
  }

  saveState();
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  update3DBox(room.id);
};

const syncRangeNumber = (rangeEl, numberEl) => {
  if (!rangeEl || !numberEl) return;
  const syncFromRange = () => {
    numberEl.value = rangeEl.value;
  };
  const syncFromNumber = () => {
    const min = Number(rangeEl.min);
    const max = Number(rangeEl.max);
    const value = clamp(Number(numberEl.value), min, max);
    rangeEl.value = value;
    numberEl.value = value;
  };
  rangeEl.addEventListener("input", syncFromRange);
  numberEl.addEventListener("input", syncFromNumber);
};

const bindEvents = () => {
  elements.floorplan.addEventListener("click", (event) => {
    const target = event.target;
    if (state.isArchitectMode) {
      if (target.classList.contains("architect-hit")) {
        selectArchitectElement(target);
        return;
      }
    }

    if (state.isAddingComment) {
      handleAddComment(event);
      return;
    }

    if (target.classList.contains("room-hit")) {
      selectRoom(target.dataset.roomId);
    }
  });

  elements.floorplan.addEventListener("mouseover", (event) => {
    if (!state.isArchitectMode) return;
    const target = event.target;
    if (target.classList.contains("architect-hit")) {
      clearHoverState();
      target.classList.add("hovered");
    }
  });

  elements.floorplan.addEventListener("mouseout", (event) => {
    if (!state.isArchitectMode) return;
    const target = event.target;
    if (target.classList.contains("architect-hit")) {
      target.classList.remove("hovered");
    }
  });

  elements.addCommentBtn.addEventListener("click", () => {
    if (
      !requireActiveRoom(
        "Bitte wählen Sie einen Raum aus, um einen Kommentar zu platzieren.",
      )
    ) {
      return;
    }
    window.alert("Klicken Sie in den Raum, um den Kommentar zu platzieren.");
    state.isAddingComment = true;
  });

  elements.clearSelectionBtn.addEventListener("click", () => {
    selectRoom(null);
  });

  if (elements.floorSwitch) {
    elements.floorSwitch.addEventListener("input", (event) => {
      const value = Number(event.target.value);
      setActiveFloor(value >= 1 ? "upper" : "ground");
    });
  }

  elements.checklistForm.addEventListener("submit", handleChecklistSubmit);
  elements.generateImageBtn.addEventListener("click", handleGenerateImage);
  elements.uploadImageInput.addEventListener("change", handleUploadImage);
  elements.setApiKeyBtn?.addEventListener("click", handleSetApiKey);
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.signupForm?.addEventListener("submit", handleSignup);
  elements.signOutBtn?.addEventListener("click", handleSignOut);

  elements.toggleArchitect.addEventListener("change", (event) => {
    setArchitectMode(event.target.checked);
  });

  elements.threeDButton.addEventListener("click", () => {
    state.show3d = !state.show3d;
    elements.threeDPanel.classList.toggle("open", state.show3d);
    elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";
  });

  if (elements.measurementLock) {
    elements.measurementLock.addEventListener("change", () => {
      state.wallLinkLocked = elements.measurementLock.checked;
      renderArchitectPanel();
    });
  }
  syncRangeNumber(elements.measurementAxis, elements.measurementAxisNumber);
  syncRangeNumber(elements.measurementSpan, elements.measurementSpanNumber);

  elements.measurementForm.addEventListener("submit", handleMeasurementSubmit);
};

const init = () => {
  hydrateStateFromLocal();
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  setArchitectMode(state.isArchitectMode);
  updateFloorButtons();
  if (elements.setApiKeyBtn) {
    elements.setApiKeyBtn.hidden = !isLocalHost;
  }
  if (supabaseConfigured) {
    setAuthScreenVisible(true);
  }
  bindEvents();
  void initAuth();
};

init();
