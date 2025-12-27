import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const DEFAULT_VIEWBOX = { x: 0, y: 0, width: 800, height: 520 };
const OUTER_WALL_BOUNDS = { x: 30, y: 30, width: 740, height: 460 };
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
const floorBounds = { x: 50, y: 50, width: 680, height: 400 };
const MM_PER_PX = 20;
const WALL_HEIGHT_MM = 2800;
const DEFAULT_DOOR_HEIGHT_MM = 2100;
const DEFAULT_WINDOW_HEIGHT_MM = 1400;
const MIN_DOOR_HEIGHT_MM = 1800;
const MIN_WINDOW_HEIGHT_MM = 600;
const MAX_OPENING_HEIGHT_MM = WALL_HEIGHT_MM;
const OPENING_HEIGHT_STEP_MM = 10;
const MIN_ROOM_SIZE_PX = 60;
const MIN_OPENING_SIZE_PX = 30;
const DRAG_THRESHOLD_PX = 4;
const OPENING_INSET_PX = 8;
const WINDOW_GAP_PX = 4;
const DEFAULT_DOOR_WIDTH_PX = 60;
const DEFAULT_WINDOW_WIDTH_PX = 120;
const SVG_NS = "http://www.w3.org/2000/svg";
const DEFAULT_FLOORPLAN_HINT =
  "Bewegen Sie die Maus über einen Raum, um ihn hervorzuheben.";

const THREE_D_DEFAULT_SCENE = {
  view: "walkthrough",
};

const THREE_D_VIEW_PRESETS = {
  walkthrough: {
    yaw: -32,
    pitch: 18,
    distanceFactor: 1.1,
  },
  model: {
    yaw: -42,
    pitch: 28,
    distanceFactor: 1.55,
  },
};

const THREE_D_FURNITURE_PRESETS = {
  living: [
    { x: 0.08, z: 0.6, width: 0.52, depth: 0.24, soft: true },
    { x: 0.44, z: 0.34, width: 0.2, depth: 0.2 },
    { x: 0.68, z: 0.62, width: 0.2, depth: 0.18 },
    { x: 0.1, z: 0.12, width: 0.18, depth: 0.18 },
  ],
  bedroom: [
    { x: 0.1, z: 0.12, width: 0.58, depth: 0.32, soft: true },
    { x: 0.14, z: 0.5, width: 0.3, depth: 0.14 },
    { x: 0.72, z: 0.1, width: 0.2, depth: 0.2 },
  ],
  kitchen: [
    { x: 0.06, z: 0.08, width: 0.86, depth: 0.16 },
    { x: 0.36, z: 0.46, width: 0.32, depth: 0.2 },
    { x: 0.72, z: 0.66, width: 0.2, depth: 0.16 },
  ],
  bathroom: [
    { x: 0.08, z: 0.1, width: 0.34, depth: 0.18 },
    { x: 0.6, z: 0.1, width: 0.22, depth: 0.2 },
    { x: 0.12, z: 0.58, width: 0.4, depth: 0.18 },
  ],
  office: [
    { x: 0.1, z: 0.12, width: 0.44, depth: 0.22 },
    { x: 0.62, z: 0.12, width: 0.24, depth: 0.2 },
    { x: 0.12, z: 0.58, width: 0.32, depth: 0.14 },
  ],
  hallway: [
    { x: 0.14, z: 0.12, width: 0.72, depth: 0.12 },
    { x: 0.7, z: 0.58, width: 0.18, depth: 0.18 },
  ],
  default: [
    { x: 0.2, z: 0.12, width: 0.52, depth: 0.2 },
    { x: 0.62, z: 0.56, width: 0.24, depth: 0.2 },
  ],
};

const TASK_STATUSES = ["Backlog", "Planned", "InProgress", "Blocked", "Done"];
const TASK_STATUS_LABELS = {
  Backlog: "Backlog",
  Planned: "Geplant",
  InProgress: "In Arbeit",
  Blocked: "Blockiert",
  Done: "Erledigt",
};
const TASK_STATUS_ALIASES = {
  backlog: "Backlog",
  todo: "Backlog",
  planned: "Planned",
  plan: "Planned",
  inprogress: "InProgress",
  "in-progress": "InProgress",
  progress: "InProgress",
  blocked: "Blocked",
  done: "Done",
  complete: "Done",
  completed: "Done",
};
const TASK_PRIORITIES = ["Low", "Med", "High"];
const TASK_PRIORITY_LABELS = {
  Low: "Niedrig",
  Med: "Mittel",
  High: "Hoch",
};
const DEFAULT_TASK_STATUS = "Backlog";
const DEFAULT_TASK_PRIORITY = "Med";
const DEFAULT_TASK_FILTERS = {
  view: "all",
  roomId: "all",
  status: "all",
  assignee: "all",
  tag: "all",
  query: "",
};
const DEFAULT_CHAT_CONFIG = {
  model: "",
  reasoningEffort: "auto",
};
const CHAT_MESSAGE_LIMIT = 20;
const EVIDENCE_ROOM_ACTIVE = "active";
const EVIDENCE_ROOM_NONE = "none";
const EVIDENCE_TASK_NONE = "none";

const TASK_TAG_GROUPS = {
  materials: ["material"],
  devices: ["geraet", "geraete", "device"],
  permits: ["permit", "genehmigung"],
  contractors: ["contractor", "handwerker", "auftragnehmer"],
};

const TASK_COST_FIELDS = [
  {
    key: "materials",
    label: "Materialkosten (Schätzung)",
    tags: TASK_TAG_GROUPS.materials,
  },
  {
    key: "devices",
    label: "Geraetekosten (Schätzung)",
    tags: TASK_TAG_GROUPS.devices,
  },
  {
    key: "permits",
    label: "Genehmigungskosten (Schätzung)",
    tags: TASK_TAG_GROUPS.permits,
  },
  {
    key: "contractors",
    label: "Handwerkerkosten (Schätzung)",
    tags: TASK_TAG_GROUPS.contractors,
  },
];

const TASK_VIEW_PRESETS = {
  all: {
    label: "Alle",
    filter: () => true,
  },
  materials: {
    label: "Material",
    filter: (task) =>
      taskHasAnyTag(task, TASK_TAG_GROUPS.materials) && !isTaskDone(task),
  },
  devices: {
    label: "Geraete",
    filter: (task) =>
      taskHasAnyTag(task, TASK_TAG_GROUPS.devices) && !isTaskDone(task),
  },
  permits: {
    label: "Genehmigungen",
    filter: (task) => taskHasAnyTag(task, TASK_TAG_GROUPS.permits),
  },
  contractors: {
    label: "Handwerker",
    filter: (task) => taskHasAnyTag(task, TASK_TAG_GROUPS.contractors),
  },
};

const ROOM_TABS = ["overview", "tasks", "inspiration", "decisions"];
const APP_VIEWS = ["room", "tasks"];
const MOBILE_MEDIA_QUERY = window.matchMedia("(max-width: 720px)");
const IMAGE_PIN_SURFACE_LABELS = {
  "wall-north": "Wand Nord",
  "wall-south": "Wand Süd",
  "wall-east": "Wand Ost",
  "wall-west": "Wand West",
  floor: "Boden",
  ceiling: "Decke",
};

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

const getDefaultOpeningHeightMm = (type) =>
  type === "door" ? DEFAULT_DOOR_HEIGHT_MM : DEFAULT_WINDOW_HEIGHT_MM;

const getOpeningHeightBoundsMm = (type) => {
  if (type === "door") {
    return { min: MIN_DOOR_HEIGHT_MM, max: MAX_OPENING_HEIGHT_MM };
  }
  return { min: MIN_WINDOW_HEIGHT_MM, max: MAX_OPENING_HEIGHT_MM };
};

const applyOpeningDefaults = (openings) =>
  openings.map((opening) => {
    const normalized = {
      ...opening,
      heightMm: Number.isFinite(opening.heightMm)
        ? opening.heightMm
        : getDefaultOpeningHeightMm(opening.type),
    };
    if (opening.type === "door") {
      normalized.showSwing =
        typeof opening.showSwing === "boolean" ? opening.showSwing : false;
    }
    return normalized;
  });

const ensureExteriorRooms = (floorPlans) => {
  if (!floorPlans || typeof floorPlans !== "object") return floorPlans;
  Object.entries(EXTERIOR_ROOMS).forEach(([floorId, exteriorRooms]) => {
    const floor = floorPlans[floorId];
    if (!floor || !Array.isArray(floor.rooms)) return;
    exteriorRooms.forEach((exteriorRoom) => {
      const existing = floor.rooms.find((room) => room.id === exteriorRoom.id);
      if (existing) {
        existing.name = exteriorRoom.name || existing.name;
        existing.exteriorType = exteriorRoom.exteriorType;
        existing.isExterior = true;
        existing.x = exteriorRoom.x;
        existing.y = exteriorRoom.y;
        existing.width = exteriorRoom.width;
        existing.height = exteriorRoom.height;
        return;
      }
      floor.rooms.push({
        ...exteriorRoom,
        isExterior: true,
      });
    });
  });
  return floorPlans;
};

const buildDefaultFloorPlans = () =>
  ensureExteriorRooms({
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
      openings: applyOpeningDefaults([
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
      ]),
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
      openings: applyOpeningDefaults([
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
      ]),
    },
  });

const SHARED_STATE_TABLE = "house_state";
const SHARED_STATE_ID = "default";
const SAVE_DEBOUNCE_MS = 800;
const ACTIVITY_EVENT_LIMIT = 200;
const ACTIVITY_FEED_LIMIT = 15;
const ROOM_ACTIVITY_LIMIT = 12;
const ACTIVITY_NOTIFICATION_STORAGE_KEY = "house-builder-activity-viewed";
const ACTIVITY_NOTIFICATION_CLEAR_DELAY_MS = 2600;

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
  isRecovery: false,
};

const syncState = {
  saveTimer: null,
  lastSavedAt: 0,
  applyingRemote: false,
  subscription: null,
};

const activityNotificationState = {
  lastViewedAt: null,
  pendingViewedAt: null,
  clearTimer: null,
  newEventIds: new Set(),
  userKey: "",
};

const emailState = {
  accounts: [],
  unlinkedThreads: [],
  linkedThreads: [],
  activeThread: null,
  threadMessages: [],
  loadingAccounts: false,
  loadingThreads: false,
  loadingMessages: false,
  translatingMessageIds: new Set(),
  translatingDraft: false,
  error: "",
};

const securityState = {
  totpEnabled: false,
  recoveryCodesRemaining: 0,
  lastVerifiedAt: null,
  loading: false,
  setup: null,
  recoveryCodes: [],
};

const reauthState = {
  isOpen: false,
  context: "",
  method: "",
  onSuccess: null,
};

const isLocalHost = ["localhost", "127.0.0.1"].includes(
  window.location.hostname,
);

const state = {
  activeRoomId: null,
  activeFloorId: "ground",
  activeView: "room",
  activeRoomTab: "overview",
  isMobileView: false,
  isAddingComment: false,
  isArchitectMode: false,
  isExteriorMode: false,
  architectTool: "select",
  roomDraft: null,
  floorPlans: buildDefaultFloorPlans(),
  roomData: {},
  tasks: [],
  taskFilters: { ...DEFAULT_TASK_FILTERS },
  selectedTaskIds: new Set(),
  activityEvents: [],
  selectedElement: null,
  show3d: false,
  wallLinkLocked: true,
};

const taskModalState = {
  taskId: null,
  dependencyDrafts: null,
  dependencyPickerOpen: false,
};

const imageModalState = {
  roomId: null,
  imageId: null,
  baseVersionId: null,
  isOpen: false,
};

const chatModalState = {
  scope: null,
  roomId: null,
  taskId: null,
  commentId: null,
  isOpen: false,
};

const chatRequestState = {
  inFlight: false,
};

const chatConfigState = {
  model: DEFAULT_CHAT_CONFIG.model,
  reasoningEffort: DEFAULT_CHAT_CONFIG.reasoningEffort,
  loaded: false,
  loading: null,
};

const imageMaskState = {
  active: false,
  drawing: false,
  brushSize: 28,
  hasEdits: false,
  lastPoint: null,
};

const commentTooltipState = {
  commentId: null,
  roomId: null,
};

const commentContextState = {
  commentId: null,
  roomId: null,
  isOpen: false,
};

const taskPlanMenuState = {
  taskId: null,
  isOpen: false,
  trigger: null,
};

const dragState = {
  active: false,
  didMove: false,
  suppressClick: false,
  pointerId: null,
  type: null,
  axis: null,
  startPointerAxis: 0,
  startPointerX: 0,
  startPointerY: 0,
  startPosition: 0,
  lastPosition: 0,
  context: null,
  startClientX: 0,
  startClientY: 0,
};

const threeDState = {
  activeRoomId: null,
  activeView: null,
  camera: {
    yaw: -32,
    pitch: 18,
    distance: -420,
  },
  bounds: {
    minDistance: -720,
    maxDistance: -220,
  },
  drag: {
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
  },
};

const elements = {
  floorplan: document.getElementById("floorplan"),
  floorplanWrapper: document.getElementById("floorplan-wrapper"),
  floorSwitch: document.getElementById("floor-toggle"),
  floorSwitchValue: document.getElementById("floor-label"),
  floorplanTitle: document.getElementById("floorplan-title"),
  floorplanHint: document.getElementById("floorplan-hint"),
  mobileRoomSelect: document.getElementById("mobile-room-select"),
  roomTitle: document.getElementById("room-title"),
  roomSubtitle: document.getElementById("room-subtitle"),
  roomChatTrigger: document.getElementById("room-chat-trigger"),
  roomTabButtons: Array.from(document.querySelectorAll("[data-room-tab]")),
  roomTabPanels: Array.from(document.querySelectorAll("[data-room-panel]")),
  roomView: document.getElementById("room-view"),
  tasksView: document.getElementById("tasks-view"),
  viewButtons: Array.from(document.querySelectorAll("[data-app-view]")),
  taskViewButtons: Array.from(document.querySelectorAll("[data-task-view]")),
  roomTasks: document.getElementById("room-tasks"),
  roomTasksEmpty: document.getElementById("room-tasks-empty"),
  comments: document.getElementById("comments"),
  commentTooltip: document.getElementById("comment-tooltip"),
  commentTooltipAuthor: document.getElementById("comment-tooltip-author"),
  commentTooltipText: document.getElementById("comment-tooltip-text"),
  commentContextMenu: document.getElementById("comment-context-menu"),
  taskPlanMenu: document.getElementById("task-plan-menu"),
  decisionList: document.getElementById("decision-list"),
  decisionForm: document.getElementById("decision-form"),
  decisionTitleInput: document.getElementById("decision-title"),
  decisionBodyInput: document.getElementById("decision-body"),
  decisionTasks: document.getElementById("decision-tasks"),
  decisionTasksEmpty: document.getElementById("decision-tasks-empty"),
  roomActivity: document.getElementById("room-activity"),
  roomActivityEmpty: document.getElementById("room-activity-empty"),
  imageGallery: document.getElementById("image-gallery"),
  addCommentBtn: document.getElementById("add-comment"),
  clearSelectionBtn: document.getElementById("clear-selection"),
  uploadImageInput: document.getElementById("upload-image"),
  generateImageBtn: document.getElementById("generate-image"),
  addEvidenceLinkBtn: document.getElementById("add-evidence-link"),
  evidenceRoomSelect: document.getElementById("evidence-room-select"),
  evidenceTaskSelect: document.getElementById("evidence-task-select"),
  architectToggleLabel: document.getElementById("architect-toggle-label"),
  toggleArchitect: document.getElementById("toggle-architect"),
  helpButton: document.getElementById("help-button"),
  helpModal: document.getElementById("help-modal"),
  helpModalClose: document.getElementById("help-modal-close"),
  architectView: document.getElementById("architect-view"),
  architectTitle: document.getElementById("architect-title"),
  architectHelp: document.getElementById("architect-help"),
  architectToolButtons: Array.from(
    document.querySelectorAll("[data-architect-tool]"),
  ),
  architectToolHint: document.getElementById("architect-tool-hint"),
  exteriorToggle: document.getElementById("toggle-exterior"),
  architectHiddenPanels: Array.from(
    document.querySelectorAll("[data-architect-hidden]"),
  ),
  measurementForm: document.getElementById("measurement-form"),
  measurementAxis: document.getElementById("measure-axis"),
  measurementAxisNumber: document.getElementById("measure-axis-number"),
  measurementAxisLabel: document.getElementById("measure-axis-label"),
  measurementSpan: document.getElementById("measure-span"),
  measurementSpanNumber: document.getElementById("measure-span-number"),
  measurementSpanLabel: document.getElementById("measure-span-label"),
  measurementHeight: document.getElementById("measure-height"),
  measurementHeightNumber: document.getElementById("measure-height-number"),
  measurementHeightLabel: document.getElementById("measure-height-label"),
  measurementHeightRow: document.getElementById("measure-height-row"),
  measurementSwing: document.getElementById("measure-swing"),
  measurementSwingRow: document.getElementById("measure-swing-row"),
  measurementLock: document.getElementById("measure-lock"),
  measurementLockRow: document.getElementById("measure-lock-row"),
  measurementNote: document.getElementById("measure-note"),
  threeDPanel: document.getElementById("three-d-panel"),
  threeDButton: document.getElementById("toggle-3d"),
  threeDLabel: document.getElementById("three-d-label"),
  threeDStage: document.getElementById("three-d-stage"),
  threeDCamera: document.getElementById("three-d-camera"),
  threeDRoom: document.getElementById("three-d-room"),
  threeDReadout: document.getElementById("three-d-readout"),
  threeDReset: document.getElementById("three-d-reset"),
  threeDViewButtons: Array.from(
    document.querySelectorAll(".segmented-option[data-view]"),
  ),
  setApiKeyBtn: document.getElementById("set-api-key"),
  imageStatus: document.getElementById("image-status"),
  imageModal: document.getElementById("image-modal"),
  imageModalClose: document.getElementById("image-modal-close"),
  imageModalTitle: document.getElementById("image-modal-title"),
  imageModalPreview: document.getElementById("image-modal-preview"),
  imageModalMeta: document.getElementById("image-modal-meta"),
  imageEditForm: document.getElementById("image-edit-form"),
  imageEditPrompt: document.getElementById("image-edit-prompt"),
  imageEditStatus: document.getElementById("image-edit-status"),
  imageMaskCanvas: document.getElementById("image-mask-canvas"),
  imageMaskToggle: document.getElementById("image-mask-toggle"),
  imageMaskClear: document.getElementById("image-mask-clear"),
  imageMaskSize: document.getElementById("image-mask-size"),
  imageThreadList: document.getElementById("image-thread-list"),
  imageDeleteBtn: document.getElementById("image-delete"),
  imagePinSurface: document.getElementById("image-pin-surface"),
  imagePinApply: document.getElementById("image-pin-apply"),
  imagePinClear: document.getElementById("image-pin-clear"),
  taskForm: document.getElementById("task-form"),
  taskInput: document.getElementById("task-input"),
  taskCreateForm: document.getElementById("task-create-form"),
  taskCreateInput: document.getElementById("task-create-input"),
  taskCreateRoom: document.getElementById("task-create-room"),
  taskTagsInput: document.getElementById("task-tags-input"),
  taskStatusInput: document.getElementById("task-status-input"),
  taskList: document.getElementById("task-list"),
  ganttChart: document.getElementById("gantt-chart"),
  ganttRange: document.getElementById("gantt-range"),
  taskSelectAll: document.getElementById("task-select-all"),
  taskSelectionCount: document.getElementById("task-selection-count"),
  taskCount: document.getElementById("task-count"),
  taskBulkDone: document.getElementById("task-bulk-done"),
  taskBulkAssignee: document.getElementById("task-bulk-assignee"),
  taskBulkAssign: document.getElementById("task-bulk-assign"),
  taskBulkDueDate: document.getElementById("task-bulk-due"),
  taskBulkDueApply: document.getElementById("task-bulk-due-apply"),
  taskFilterRoom: document.getElementById("task-filter-room"),
  taskFilterStatus: document.getElementById("task-filter-status"),
  taskFilterAssignee: document.getElementById("task-filter-assignee"),
  taskFilterTag: document.getElementById("task-filter-tag"),
  taskFilterSearch: document.getElementById("task-filter-search"),
  tasksReset: document.getElementById("tasks-reset"),
  tasksEmpty: document.getElementById("tasks-empty"),
  taskModal: document.getElementById("task-modal"),
  taskModalForm: document.getElementById("task-modal-form"),
  taskModalTitle: document.getElementById("task-modal-title"),
  taskModalChat: document.getElementById("task-modal-chat"),
  taskModalClose: document.getElementById("task-modal-close"),
  taskModalCancel: document.getElementById("task-modal-cancel"),
  taskFileList: document.getElementById("task-file-list"),
  taskFileEmpty: document.getElementById("task-file-empty"),
  taskFileUpload: document.getElementById("task-file-upload"),
  taskFileLink: document.getElementById("task-file-link"),
  taskDatePanel: document.getElementById("task-date-panel"),
  taskDateSummary: document.getElementById("task-date-summary"),
  taskStartDate: document.getElementById("task-start-date"),
  taskEndDate: document.getElementById("task-end-date"),
  taskDependencyList: document.getElementById("task-dependency-list"),
  taskDependencySummary: document.getElementById("task-dependency-summary"),
  taskDependencyToggle: document.getElementById("task-dependency-toggle"),
  taskDependencyPicker: document.getElementById("task-dependency-picker"),
  taskDependencyClose: document.getElementById("task-dependency-close"),
  emailPanelStatus: document.getElementById("email-panel-status"),
  emailPanelRefresh: document.getElementById("email-panel-refresh"),
  emailAccounts: document.getElementById("email-accounts"),
  emailConnectActions: document.getElementById("email-connect-actions"),
  emailConnectGmail: document.getElementById("email-connect-gmail"),
  emailConnectMicrosoft: document.getElementById("email-connect-microsoft"),
  emailUnlinkedThreads: document.getElementById("email-unlinked-threads"),
  emailUnlinkedPanel: document.getElementById("email-unlinked-panel"),
  emailUnlinkedToggle: document.getElementById("email-unlinked-toggle"),
  emailLinkedThreads: document.getElementById("email-linked-threads"),
  emailThreadView: document.getElementById("email-thread-view"),
  emailThreadMeta: document.getElementById("email-thread-meta"),
  emailThreadMessages: document.getElementById("email-thread-messages"),
  emailReplyText: document.getElementById("email-reply-text"),
  emailReplyTextIt: document.getElementById("email-reply-text-it"),
  emailReplyTranslation: document.getElementById("email-reply-translation"),
  emailReplyTranslate: document.getElementById("email-reply-translate"),
  emailReplyTranslateStatus: document.getElementById(
    "email-reply-translate-status",
  ),
  emailReplySend: document.getElementById("email-reply-send"),
  emailReplyStatus: document.getElementById("email-reply-status"),
  chatModal: document.getElementById("chat-modal"),
  chatModalClose: document.getElementById("chat-modal-close"),
  chatModalTitle: document.getElementById("chat-modal-title"),
  chatModalContext: document.getElementById("chat-modal-context"),
  chatThread: document.getElementById("chat-thread"),
  chatStatus: document.getElementById("chat-status"),
  chatForm: document.getElementById("chat-form"),
  chatInput: document.getElementById("chat-input"),
  chatConfigModel: document.getElementById("chat-config-model"),
  chatConfigEffort: document.getElementById("chat-config-effort"),
  activityPage: document.getElementById("activity-page"),
  activityNotification: document.getElementById("activity-notification"),
  activityNotificationCount: document.getElementById(
    "activity-notification-count",
  ),
  activityFeed: document.getElementById("activity-feed"),
  activityEmpty: document.getElementById("activity-empty"),
  authScreen: document.getElementById("auth-screen"),
  authForms: document.getElementById("auth-forms"),
  loginForm: document.getElementById("login-form"),
  signupForm: document.getElementById("signup-form"),
  authError: document.getElementById("auth-error"),
  authInfo: document.getElementById("auth-info"),
  authUserName: document.getElementById("auth-user-name"),
  emailAccountsButton: document.getElementById("email-accounts-button"),
  emailAccountsModal: document.getElementById("email-accounts-modal"),
  emailAccountsClose: document.getElementById("email-accounts-close"),
  emailAccountsRefresh: document.getElementById("email-accounts-refresh"),
  emailAccountsStatus: document.getElementById("email-accounts-status"),
  securitySettingsBtn: document.getElementById("security-settings"),
  magicLinkBtn: document.getElementById("magic-link-btn"),
  resetPasswordBtn: document.getElementById("reset-password-btn"),
  passwordResetPanel: document.getElementById("password-reset-panel"),
  passwordResetForm: document.getElementById("password-reset-form"),
  signOutBtn: document.getElementById("sign-out"),
  securityModal: document.getElementById("security-modal"),
  securityModalClose: document.getElementById("security-modal-close"),
  security2faStatus: document.getElementById("security-2fa-status"),
  security2faStart: document.getElementById("security-2fa-start"),
  security2faDisable: document.getElementById("security-2fa-disable"),
  security2faSetup: document.getElementById("security-2fa-setup"),
  securityQrImage: document.getElementById("security-qr-image"),
  securitySecret: document.getElementById("security-secret"),
  security2faCode: document.getElementById("security-2fa-code"),
  security2faConfirm: document.getElementById("security-2fa-confirm"),
  securityRecovery: document.getElementById("security-recovery-codes"),
  securityRecoveryList: document.getElementById("security-recovery-list"),
  reauthModal: document.getElementById("reauth-modal"),
  reauthModalClose: document.getElementById("reauth-modal-close"),
  reauthModalTitle: document.getElementById("reauth-modal-title"),
  reauthHelper: document.getElementById("reauth-helper"),
  reauthForm: document.getElementById("reauth-form"),
  reauthCodeRow: document.getElementById("reauth-code-row"),
  reauthCodeInput: document.getElementById("reauth-code"),
  reauthRecoveryRow: document.getElementById("reauth-recovery-row"),
  reauthRecoveryInput: document.getElementById("reauth-recovery"),
  reauthPasswordRow: document.getElementById("reauth-password-row"),
  reauthPasswordInput: document.getElementById("reauth-password"),
  reauthStatus: document.getElementById("reauth-status"),
};

const storageKey = "house-builder-state";
const apiKeyStorageKey = "house-builder-image-api-key";
const emailOAuthStateKey = "house-builder-email-oauth-state";
const emailOAuthCodeKey = "house-builder-email-oauth-code";
const emailOAuthProviderKey = "house-builder-email-oauth-provider";

const defaultRoomData = () => ({
  checklist: [],
  images: [],
  comments: [],
  decisions: [],
  chat: null,
  scene: null,
});

const createTaskId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `task-${crypto.randomUUID()}`;
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const createActivityId = () =>
  `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createDecisionId = () =>
  `decision-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createCommentId = () =>
  `comment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createChatThreadId = () =>
  `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createChatMessageId = () =>
  `chatmsg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createRoomId = (floorId) =>
  `room-${floorId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createOpeningId = () =>
  `opening-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isValidDateInput = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizeTaskStatus = (status, doneFlag) => {
  const raw = typeof status === "string" ? status.trim() : "";
  if (TASK_STATUSES.includes(raw)) return raw;
  if (doneFlag) return "Done";
  const lowered = raw.toLowerCase().replace(/[\s_-]+/g, "");
  return TASK_STATUS_ALIASES[lowered] || DEFAULT_TASK_STATUS;
};

const normalizeTaskPriority = (priority) => {
  const raw = typeof priority === "string" ? priority.trim() : "";
  if (TASK_PRIORITIES.includes(raw)) return raw;
  const lowered = raw.toLowerCase();
  if (lowered === "low") return "Low";
  if (lowered === "med" || lowered === "medium") return "Med";
  if (lowered === "high") return "High";
  return DEFAULT_TASK_PRIORITY;
};

const normalizeTaskTags = (tags) => {
  const raw = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : [];
  const seen = new Set();
  const normalized = [];
  raw.forEach((tag) => {
    String(tag || "")
      .split(/\s+/)
      .forEach((chunk) => {
        const value = String(chunk || "")
          .trim()
          .replace(/^#/, "")
          .toLowerCase();
        if (!value || seen.has(value)) return;
        seen.add(value);
        normalized.push(value);
      });
  });
  return normalized;
};

const normalizeTaskLink = (value) => {
  if (value === null || value === undefined) return "";
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.toString();
  } catch {
    return "";
  }
};

const normalizeTaskMaterials = (materials) => ({
  ordered: Boolean(materials?.ordered),
  deliveryDate: isValidDateInput(materials?.deliveryDate)
    ? materials.deliveryDate
    : null,
  vendor: typeof materials?.vendor === "string" ? materials.vendor.trim() : "",
});

const normalizeCostValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const raw =
    typeof value === "string" ? value.trim().replace(",", ".") : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeTaskCosts = (costs) => {
  const source = costs && typeof costs === "object" ? costs : {};
  return TASK_COST_FIELDS.reduce((normalized, field) => {
    normalized[field.key] = normalizeCostValue(source[field.key]);
    return normalized;
  }, {});
};

const normalizeChatRole = (value) =>
  value === "assistant" || value === "user" ? value : "user";

const normalizeChatMessage = (message) => {
  if (!message || typeof message !== "object") return null;
  const text = typeof message.text === "string" ? message.text.trim() : "";
  if (!text) return null;
  const createdAt =
    typeof message.createdAt === "string" && message.createdAt.trim()
      ? message.createdAt.trim()
      : new Date().toISOString();
  return {
    id:
      typeof message.id === "string" && message.id.trim()
        ? message.id.trim()
        : createChatMessageId(),
    role: normalizeChatRole(message.role),
    text,
    createdAt,
    userId:
      typeof message.userId === "string" && message.userId.trim()
        ? message.userId.trim()
        : null,
    userName:
      typeof message.userName === "string" ? message.userName.trim() : "",
    userEmail:
      typeof message.userEmail === "string" ? message.userEmail.trim() : "",
  };
};

const normalizeChatMessages = (messages) => {
  if (!Array.isArray(messages)) return [];
  return messages.map(normalizeChatMessage).filter(Boolean);
};

const normalizeChatThread = (thread) => {
  if (!thread || typeof thread !== "object") return null;
  const model =
    typeof thread.model === "string" && thread.model.trim()
      ? thread.model.trim()
      : "";
  const effort =
    typeof thread.effort === "string" && thread.effort.trim()
      ? thread.effort.trim()
      : "";
  const createdAt =
    typeof thread.createdAt === "string" && thread.createdAt.trim()
      ? thread.createdAt.trim()
      : new Date().toISOString();
  const updatedAt =
    typeof thread.updatedAt === "string" && thread.updatedAt.trim()
      ? thread.updatedAt.trim()
      : createdAt;
  return {
    id:
      typeof thread.id === "string" && thread.id.trim()
        ? thread.id.trim()
        : createChatThreadId(),
    model,
    effort,
    messages: normalizeChatMessages(thread.messages),
    createdAt,
    updatedAt,
  };
};

const buildChatThread = () => {
  const timestamp = new Date().toISOString();
  return {
    id: createChatThreadId(),
    model: chatConfigState.model || "",
    effort: chatConfigState.reasoningEffort || "auto",
    messages: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const buildTaskSearchIndex = (task) => {
  const parts = [
    task.title,
    task.notes,
    task.link,
    task.assignee,
    Array.isArray(task.tags) ? task.tags.join(" ") : "",
    task.materials?.vendor,
  ];
  return parts
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

const updateTaskSearchIndex = (task) => {
  task.searchIndex = buildTaskSearchIndex(task);
  return task.searchIndex;
};

const taskHasTag = (task, needle) => {
  const target = String(needle || "")
    .trim()
    .toLowerCase();
  if (!target || !Array.isArray(task.tags)) return false;
  return task.tags.some((tag) => tag.includes(target));
};

const taskHasAnyTag = (task, needles) => {
  const targets = Array.isArray(needles) ? needles : [needles];
  if (!targets.length) return false;
  return targets.some((target) => taskHasTag(task, target));
};

const taskHasMaterialsTag = (task) =>
  taskHasAnyTag(task, TASK_TAG_GROUPS.materials);

const normalizeTask = (task, fallbackTitle) => {
  if (typeof task === "string") {
    const title = task.trim() || fallbackTitle;
    return createTask({ title });
  }
  if (!task || typeof task !== "object") return null;

  const title =
    typeof task.title === "string"
      ? task.title.trim()
      : typeof task.name === "string"
        ? task.name.trim()
        : "";
  const roomId =
    task.roomId === null || task.roomId === undefined || task.roomId === ""
      ? null
      : String(task.roomId);
  const assignee =
    typeof task.assignee === "string"
      ? task.assignee.trim()
      : typeof task.assignedTo === "string"
        ? task.assignedTo.trim()
        : typeof task.owner === "string"
          ? task.owner.trim()
          : "";
  const createdAt =
    typeof task.createdAt === "string" && task.createdAt.trim()
      ? task.createdAt
      : new Date().toISOString();
  const updatedAt =
    typeof task.updatedAt === "string" && task.updatedAt.trim()
      ? task.updatedAt
      : createdAt;

  const normalized = {
    id:
      typeof task.id === "string" && task.id.trim()
        ? task.id.trim()
        : createTaskId(),
    title: title || fallbackTitle,
    roomId,
    status: normalizeTaskStatus(task.status, task.done || task.isDone),
    tags: normalizeTaskTags(task.tags),
    assignee,
    dueDate:
      typeof task.dueDate === "string" && task.dueDate.trim()
        ? task.dueDate
        : null,
    startDate: isValidDateInput(task.startDate) ? task.startDate : null,
    endDate: isValidDateInput(task.endDate) ? task.endDate : null,
    dependencyIds: Array.isArray(task.dependencyIds)
      ? task.dependencyIds.filter((id) => typeof id === "string")
      : Array.isArray(task.dependencies)
        ? task.dependencies.filter((id) => typeof id === "string")
        : Array.isArray(task.dependsOn)
          ? task.dependsOn.filter((id) => typeof id === "string")
          : [],
    materials: normalizeTaskMaterials(task.materials),
    costs: normalizeTaskCosts(task.costs),
    priority: normalizeTaskPriority(task.priority),
    link: normalizeTaskLink(task.link),
    notes: typeof task.notes === "string" ? task.notes : "",
    chat: normalizeChatThread(task.chat),
    createdAt,
    updatedAt,
  };
  updateTaskSearchIndex(normalized);
  return normalized;
};

const normalizeTasks = (tasks) => {
  if (!Array.isArray(tasks)) return [];
  const normalized = [];
  const seenIds = new Set();

  tasks.forEach((task, index) => {
    const item = normalizeTask(task, `Aufgabe ${index + 1}`);
    if (!item) return;
    while (seenIds.has(item.id)) {
      item.id = createTaskId();
    }
    seenIds.add(item.id);
    normalized.push(item);
  });

  const validIds = new Set(normalized.map((task) => task.id));
  normalized.forEach((task) => {
    task.dependencyIds = Array.from(
      new Set(
        (task.dependencyIds || []).filter(
          (id) => validIds.has(id) && id !== task.id,
        ),
      ),
    );
  });

  return normalized;
};

const createTask = ({
  title,
  roomId = null,
  status = DEFAULT_TASK_STATUS,
  tags = [],
  assignee = "",
  dueDate = null,
  startDate = null,
  endDate = null,
  dependencyIds = [],
  materials = null,
  costs = null,
  priority = DEFAULT_TASK_PRIORITY,
  link = "",
  notes = "",
} = {}) => {
  const timestamp = new Date().toISOString();
  const task = {
    id: createTaskId(),
    title: (title || "").trim(),
    roomId: roomId || null,
    status: TASK_STATUSES.includes(status) ? status : DEFAULT_TASK_STATUS,
    tags: normalizeTaskTags(tags),
    assignee: assignee || "",
    dueDate: dueDate || null,
    startDate: isValidDateInput(startDate) ? startDate : null,
    endDate: isValidDateInput(endDate) ? endDate : null,
    dependencyIds: Array.isArray(dependencyIds)
      ? dependencyIds.filter((id) => typeof id === "string")
      : [],
    materials: normalizeTaskMaterials(materials),
    costs: normalizeTaskCosts(costs),
    priority: TASK_PRIORITIES.includes(priority)
      ? priority
      : DEFAULT_TASK_PRIORITY,
    link: normalizeTaskLink(link),
    notes: notes || "",
    chat: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  updateTaskSearchIndex(task);
  return task;
};

const normalizeDecision = (decision, fallbackText) => {
  if (typeof decision === "string") {
    const text = decision.trim();
    if (!text) return null;
    return {
      id: createDecisionId(),
      title: fallbackText || text,
      body: text,
      actor: "Unbekannt",
      userId: null,
      createdAt: new Date().toISOString(),
      taskIds: [],
      taskLinks: [],
    };
  }
  if (!decision || typeof decision !== "object") return null;
  const title = typeof decision.title === "string" ? decision.title.trim() : "";
  const body = typeof decision.body === "string" ? decision.body.trim() : "";
  const text = typeof decision.text === "string" ? decision.text.trim() : "";
  const taskIdsRaw = Array.isArray(decision.taskIds) ? decision.taskIds : [];
  const taskLinksRaw = Array.isArray(decision.taskLinks)
    ? decision.taskLinks
    : [];
  const taskIds = taskIdsRaw
    .map((id) => String(id || "").trim())
    .filter(Boolean);
  const taskLinks = taskLinksRaw
    .map((label) => String(label || "").trim())
    .filter(Boolean);
  let resolvedBody = body || text;
  let resolvedTitle = title;
  if (!resolvedTitle) {
    if (resolvedBody) {
      resolvedTitle = fallbackText || resolvedBody;
    } else if (text) {
      resolvedTitle = fallbackText || text;
    } else {
      resolvedTitle = fallbackText || "";
    }
  }
  if (!resolvedTitle && !resolvedBody) return null;
  const actor =
    typeof decision.actor === "string" && decision.actor.trim()
      ? decision.actor.trim()
      : typeof decision.userName === "string" && decision.userName.trim()
        ? decision.userName.trim()
        : typeof decision.userEmail === "string" && decision.userEmail.trim()
          ? decision.userEmail.trim()
          : "Unbekannt";
  const userId =
    typeof decision.userId === "string" && decision.userId.trim()
      ? decision.userId.trim()
      : null;
  const createdAt =
    typeof decision.createdAt === "string" && decision.createdAt.trim()
      ? decision.createdAt.trim()
      : new Date().toISOString();
  return {
    id:
      typeof decision.id === "string" && decision.id.trim()
        ? decision.id.trim()
        : createDecisionId(),
    title: resolvedTitle,
    body: resolvedBody || "",
    actor,
    userId,
    createdAt,
    taskIds,
    taskLinks,
  };
};

const normalizeDecisions = (decisions) => {
  if (!Array.isArray(decisions)) return [];
  const normalized = [];
  decisions.forEach((decision, index) => {
    const item = normalizeDecision(decision, `Entscheidung ${index + 1}`);
    if (!item) return;
    normalized.push(item);
  });
  return normalized;
};

const normalizeComments = (comments) => {
  if (!Array.isArray(comments)) return [];
  const seed = Date.now();
  return comments
    .map((comment, index) => {
      if (!comment || typeof comment !== "object") return null;
      if (typeof comment.id !== "string" || !comment.id.trim()) {
        comment.id = `comment-${seed}-${index}`;
      }
      if (typeof comment.text !== "string") {
        comment.text = String(comment.text ?? "");
      }
      if (!Number.isFinite(comment.x)) {
        comment.x = 0;
      }
      if (!Number.isFinite(comment.y)) {
        comment.y = 0;
      }
      comment.resolved = comment.resolved === true;
      if (comment.resolved && !comment.resolvedAt) {
        comment.resolvedAt = new Date().toISOString();
      }
      if (!comment.resolved && comment.resolvedAt) {
        comment.resolvedAt = null;
      }
      comment.chat = normalizeChatThread(comment.chat);
      return comment;
    })
    .filter(Boolean);
};

const normalizeActivityEvents = (events) => {
  if (!Array.isArray(events)) return [];
  return events
    .map((event) => {
      if (!event || typeof event !== "object") return null;
      const metadata =
        event.metadata && typeof event.metadata === "object"
          ? event.metadata
          : {};
      return {
        id:
          typeof event.id === "string" && event.id.trim()
            ? event.id.trim()
            : createActivityId(),
        type:
          typeof event.type === "string" && event.type.trim()
            ? event.type.trim()
            : "activity",
        actor:
          typeof event.actor === "string" && event.actor.trim()
            ? event.actor.trim()
            : "Unbekannt",
        actorId:
          typeof event.actorId === "string" && event.actorId.trim()
            ? event.actorId.trim()
            : null,
        actorEmail:
          typeof event.actorEmail === "string" && event.actorEmail.trim()
            ? event.actorEmail.trim()
            : null,
        roomId:
          typeof event.roomId === "string" && event.roomId.trim()
            ? event.roomId.trim()
            : null,
        taskId:
          typeof event.taskId === "string" && event.taskId.trim()
            ? event.taskId.trim()
            : null,
        metadata,
        createdAt:
          typeof event.createdAt === "string" && event.createdAt.trim()
            ? event.createdAt.trim()
            : new Date().toISOString(),
      };
    })
    .filter(Boolean);
};

const buildStatePayload = () => ({
  roomData: state.roomData,
  floorPlans: state.floorPlans,
  tasks: state.tasks,
  activityEvents: state.activityEvents,
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
  state.floorPlans = normalizeOpenings(
    cloneFloorPlans(loadFloorPlans(payload?.floorPlans)),
  );
  state.tasks = normalizeTasks(payload?.tasks);
  clearTaskSelection();
  state.activityEvents = normalizeActivityEvents(payload?.activityEvents);
  let didMigrateTasks = false;
  if (!state.tasks.length) {
    const migratedTasks = migrateChecklistToTasks(state.roomData);
    if (migratedTasks.length) {
      state.tasks = migratedTasks;
      didMigrateTasks = true;
    }
  }
  ensureRoomDataForFloors();
  return didMigrateTasks;
};

const hydrateStateFromLocal = () => {
  const localPayload = loadStateLocal();
  if (localPayload) {
    const didMigrateTasks = applyStatePayload(localPayload);
    if (didMigrateTasks) {
      saveStateLocal();
    }
    return;
  }
  state.floorPlans = buildDefaultFloorPlans();
  state.tasks = [];
  clearTaskSelection();
  state.activityEvents = [];
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
  return ensureExteriorRooms(floorPlans);
};

const normalizeOpenings = (floorPlans) => {
  Object.values(floorPlans || {}).forEach((floor) => {
    if (!floor || !Array.isArray(floor.openings)) return;
    floor.openings.forEach((opening) => {
      if (!Number.isFinite(opening.heightMm)) {
        opening.heightMm = getDefaultOpeningHeightMm(opening.type);
      }
      if (opening.type === "door" && typeof opening.showSwing !== "boolean") {
        opening.showSwing = false;
      }
    });
  });
  return floorPlans;
};

const ensureRoomData = (roomId) => {
  if (!state.roomData[roomId]) {
    state.roomData[roomId] = defaultRoomData();
  }
  const roomData = state.roomData[roomId];
  if (!Array.isArray(roomData.checklist)) roomData.checklist = [];
  if (!Array.isArray(roomData.images)) roomData.images = [];
  if (!Array.isArray(roomData.comments)) roomData.comments = [];
  if (!Array.isArray(roomData.decisions)) roomData.decisions = [];
  roomData.comments = normalizeComments(roomData.comments);
  roomData.decisions = normalizeDecisions(roomData.decisions);
  roomData.chat = normalizeChatThread(roomData.chat);
  if (roomData.scene === undefined) roomData.scene = null;
  return roomData;
};

const ensureRoomDataForFloors = () => {
  Object.values(state.floorPlans).forEach((floor) => {
    floor.rooms.forEach((room) => {
      if (!state.roomData[room.id]) {
        state.roomData[room.id] = defaultRoomData();
      }
      ensureRoomData(room.id);
    });
  });
};

const migrateChecklistToTasks = (roomData) => {
  const migrated = [];
  Object.entries(roomData || {}).forEach(([roomId, data]) => {
    if (!Array.isArray(data?.checklist)) return;
    data.checklist.forEach((item) => {
      const title = String(item || "").trim();
      if (!title) return;
      migrated.push(createTask({ title, roomId }));
    });
  });
  return migrated;
};

const parseTaskInput = (value) => {
  const raw = String(value || "");
  const tags = [];
  const seen = new Set();
  const title = raw.replace(/#[A-Za-z0-9_-]+/g, (match) => {
    const cleaned = match.slice(1).toLowerCase();
    if (cleaned && !seen.has(cleaned)) {
      seen.add(cleaned);
      tags.push(cleaned);
    }
    return "";
  });
  return {
    title: title.replace(/\s+/g, " ").trim(),
    tags,
  };
};

const buildTaskMap = (tasks = state.tasks) =>
  new Map((tasks || []).map((task) => [task.id, task]));

const isTaskDone = (task) => normalizeTaskStatus(task?.status) === "Done";

const getBlockingTasks = (task, taskMap) => {
  if (!task || !Array.isArray(task.dependencyIds)) return [];
  return task.dependencyIds
    .map((dependencyId) => taskMap.get(dependencyId))
    .filter((dependency) => dependency && !isTaskDone(dependency));
};

const isTaskBlocked = (task, taskMap) =>
  normalizeTaskStatus(task?.status) === "Blocked" ||
  (!isTaskDone(task) && getBlockingTasks(task, taskMap).length > 0);

const hasDependencyPath = (startId, targetId, taskMap, visited = new Set()) => {
  if (startId === targetId) return true;
  if (visited.has(startId)) return false;
  visited.add(startId);
  const node = taskMap.get(startId);
  if (!node || !Array.isArray(node.dependencyIds)) return false;
  return node.dependencyIds.some((dependencyId) =>
    hasDependencyPath(dependencyId, targetId, taskMap, visited),
  );
};

const wouldCreateCycle = (taskId, dependencyId, taskMap) =>
  taskId === dependencyId || hasDependencyPath(dependencyId, taskId, taskMap);

const getTaskScheduleDate = (task) => {
  const candidate = task.startDate || task.dueDate;
  return isValidDateInput(candidate) ? candidate : null;
};

const getTaskDeliveryDate = (task) => {
  const candidate = task?.materials?.deliveryDate;
  return isValidDateInput(candidate) ? candidate : null;
};

const parseDateInput = (value) => {
  if (!isValidDateInput(value)) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatShortDate = (value) => {
  const parsed = parseDateInput(value);
  if (!parsed) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(parsed);
};

const formatMonthLabel = (date) =>
  new Intl.DateTimeFormat("de-DE", {
    month: "long",
    year: "numeric",
  }).format(date);

const getWeekStart = (date) => {
  const dayIndex = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - dayIndex);
  start.setHours(0, 0, 0, 0);
  return start;
};

const formatWeekLabel = (date) =>
  `Woche ab ${new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(date)}`;

const getActiveFloor = () =>
  state.floorPlans[state.activeFloorId] || state.floorPlans.ground;

const isExteriorRoom = (room) => room?.isExterior === true;

const getInteriorRooms = (floor) =>
  floor?.rooms?.filter((room) => !isExteriorRoom(room)) ?? [];

const getExteriorRooms = (floor) =>
  floor?.rooms?.filter((room) => isExteriorRoom(room)) ?? [];

const findRoomById = (roomId) => {
  for (const floor of Object.values(state.floorPlans)) {
    const room = floor.rooms.find((item) => item.id === roomId);
    if (room) return room;
  }
  return null;
};

const getNextRoomName = (floor) => {
  const base = "Neuer Raum";
  if (!floor || !Array.isArray(floor.rooms)) return base;
  const names = floor.rooms.map((room) => room.name);
  if (!names.includes(base)) return base;
  let index = 2;
  while (names.includes(`${base} ${index}`)) {
    index += 1;
  }
  return `${base} ${index}`;
};

const toMm = (px) => Math.round(px * MM_PER_PX);
const toPx = (mm) => Number(mm) / MM_PER_PX;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const getFloorplanViewBox = () => {
  const base = elements.floorplan?.viewBox?.baseVal;
  if (base && Number.isFinite(base.width) && Number.isFinite(base.height)) {
    return { x: base.x, y: base.y, width: base.width, height: base.height };
  }
  return { ...DEFAULT_VIEWBOX };
};
const getFloorplanPoint = (event) => {
  const bounds = elements.floorplan.getBoundingClientRect();
  const viewBox = getFloorplanViewBox();
  return {
    x:
      ((event.clientX - bounds.left) / bounds.width) * viewBox.width +
      viewBox.x,
    y:
      ((event.clientY - bounds.top) / bounds.height) * viewBox.height +
      viewBox.y,
  };
};
const setFloorplanViewBox = (viewBox) => {
  if (!elements.floorplan) return;
  const target = viewBox || DEFAULT_VIEWBOX;
  elements.floorplan.setAttribute(
    "viewBox",
    `${target.x} ${target.y} ${target.width} ${target.height}`,
  );
};
const updateFloorplanViewBox = () => {
  setFloorplanViewBox(
    state.isExteriorMode ? EXTERIOR_VIEWBOX : DEFAULT_VIEWBOX,
  );
};
const getInputNumber = (primary, fallback) => {
  const raw = primary?.value;
  if (raw === "" || raw === null || raw === undefined) {
    return Number(fallback?.value);
  }
  const value = Number(raw);
  return Number.isNaN(value) ? Number(fallback?.value) : value;
};

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
  const spanStart = isVertical
    ? Math.min(wall.y1, wall.y2)
    : Math.min(wall.x1, wall.x2);
  const spanEnd = isVertical
    ? Math.max(wall.y1, wall.y2)
    : Math.max(wall.x1, wall.x2);
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

const getOpeningMeta = (opening) => {
  const isVertical = opening.x1 === opening.x2;
  const position = isVertical
    ? (opening.y1 + opening.y2) / 2
    : (opening.x1 + opening.x2) / 2;
  const length = isVertical
    ? Math.abs(opening.y2 - opening.y1)
    : Math.abs(opening.x2 - opening.x1);
  return {
    axis: isVertical ? "y" : "x",
    position,
    length,
  };
};

const getOpeningWallSide = (opening, room) => {
  if (!room) return null;
  const tolerance = 0.5;
  if (opening.x1 === opening.x2) {
    if (Math.abs(opening.x1 - room.x) <= tolerance) return "left";
    if (Math.abs(opening.x1 - (room.x + room.width)) <= tolerance)
      return "right";
  } else {
    if (Math.abs(opening.y1 - room.y) <= tolerance) return "top";
    if (Math.abs(opening.y1 - (room.y + room.height)) <= tolerance)
      return "bottom";
  }
  return null;
};

const getRoomWalls = (room) => {
  if (!room) return [];
  return [
    {
      side: "top",
      axis: "x",
      position: room.y,
      spanStart: room.x,
      spanEnd: room.x + room.width,
      normal: { x: 0, y: 1 },
    },
    {
      side: "bottom",
      axis: "x",
      position: room.y + room.height,
      spanStart: room.x,
      spanEnd: room.x + room.width,
      normal: { x: 0, y: -1 },
    },
    {
      side: "left",
      axis: "y",
      position: room.x,
      spanStart: room.y,
      spanEnd: room.y + room.height,
      normal: { x: 1, y: 0 },
    },
    {
      side: "right",
      axis: "y",
      position: room.x + room.width,
      spanStart: room.y,
      spanEnd: room.y + room.height,
      normal: { x: -1, y: 0 },
    },
  ];
};

const getWallDataForSide = (room, side) =>
  getRoomWalls(room).find((wall) => wall.side === side) || null;

const getWallDistanceForPoint = (wall, point) => {
  if (wall.axis === "x") {
    const clamped = clamp(point.x, wall.spanStart, wall.spanEnd);
    const dx = point.x - clamped;
    const dy = point.y - wall.position;
    return dx * dx + dy * dy;
  }
  const clamped = clamp(point.y, wall.spanStart, wall.spanEnd);
  const dx = point.x - wall.position;
  const dy = point.y - clamped;
  return dx * dx + dy * dy;
};

const getClosestWallForPoint = (room, point, minSpan) => {
  const walls = getRoomWalls(room);
  if (!walls.length) return null;
  const viableWalls = walls.filter(
    (wall) => wall.spanEnd - wall.spanStart >= minSpan,
  );
  const candidates = viableWalls.length ? viableWalls : walls;
  let best = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  candidates.forEach((wall) => {
    const distance = getWallDistanceForPoint(wall, point);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = { ...wall, distance };
    }
  });
  return best;
};

const getClosestWallForPointInFloor = (
  floor,
  point,
  minSpan,
  preferredRoomId = null,
) => {
  const rooms = getInteriorRooms(floor);
  if (!rooms.length) return null;
  let best = null;
  rooms.forEach((room) => {
    const walls = getRoomWalls(room);
    if (!walls.length) return;
    const viableWalls = walls.filter(
      (wall) => wall.spanEnd - wall.spanStart >= minSpan,
    );
    const candidates = viableWalls.length ? viableWalls : walls;
    candidates.forEach((wall) => {
      const distance = getWallDistanceForPoint(wall, point);
      const isPreferred = room.id === preferredRoomId;
      if (
        !best ||
        distance < best.distance - 0.01 ||
        (Math.abs(distance - best.distance) < 0.01 &&
          isPreferred &&
          !best.isPreferred)
      ) {
        best = { ...wall, room, distance, isPreferred };
      }
    });
  });
  return best;
};

const getOpeningCenterPoint = (opening, meta) => {
  if (meta.axis === "x") {
    return { x: meta.position, y: opening.y1 };
  }
  return { x: opening.x1, y: meta.position };
};

const resolveOpeningWallSide = (opening, room, meta) => {
  const wallSide = getOpeningWallSide(opening, room);
  if (wallSide) return wallSide;
  const closest = getClosestWallForPoint(
    room,
    getOpeningCenterPoint(opening, meta),
    meta.length,
  );
  return closest?.side || null;
};

const getOpeningBoundsForWall = (room, wallSide, axis) => {
  if (!room || !wallSide) {
    return axis === "x"
      ? { start: floorBounds.x, end: floorBounds.x + floorBounds.width }
      : { start: floorBounds.y, end: floorBounds.y + floorBounds.height };
  }
  if (wallSide === "top" || wallSide === "bottom") {
    return { start: room.x, end: room.x + room.width };
  }
  return { start: room.y, end: room.y + room.height };
};

const getOpeningPositionBounds = (bounds, length) => {
  const half = length / 2;
  return {
    min: bounds.start + half,
    max: bounds.end - half,
  };
};

const setOpeningOnWall = (opening, axis, wallPosition, center, length) => {
  const half = length / 2;
  if (axis === "x") {
    opening.x1 = center - half;
    opening.x2 = center + half;
    opening.y1 = wallPosition;
    opening.y2 = wallPosition;
    return;
  }
  opening.y1 = center - half;
  opening.y2 = center + half;
  opening.x1 = wallPosition;
  opening.x2 = wallPosition;
};

const translateOpeningsForRoom = (floor, roomId, deltaX, deltaY) => {
  if (!floor || (!deltaX && !deltaY)) return;
  floor.openings.forEach((opening) => {
    if (opening.roomId !== roomId) return;
    opening.x1 += deltaX;
    opening.x2 += deltaX;
    opening.y1 += deltaY;
    opening.y2 += deltaY;
  });
  const roomData = state.roomData?.[roomId];
  if (roomData?.comments) {
    roomData.comments.forEach((comment) => {
      comment.x += deltaX;
      comment.y += deltaY;
    });
  }
};

const updateOpeningsForRoomResize = (floor, room) => {
  if (!floor || !room) return;
  floor.openings.forEach((opening) => {
    if (opening.roomId !== room.id) return;
    const meta = getOpeningMeta(opening);
    const wallSide = resolveOpeningWallSide(opening, room, meta);
    const wallData = wallSide ? getWallDataForSide(room, wallSide) : null;
    if (!wallData) return;
    const bounds = getOpeningBoundsForWall(room, wallSide, wallData.axis);
    const span = Math.max(0, bounds.end - bounds.start);
    const minLength = Math.min(MIN_OPENING_SIZE_PX, span);
    const maxLength = Math.max(minLength, span);
    const length = clamp(meta.length, minLength, maxLength);
    const positionBounds = getOpeningPositionBounds(bounds, length);
    const center = clamp(meta.position, positionBounds.min, positionBounds.max);
    setOpeningOnWall(opening, wallData.axis, wallData.position, center, length);
  });
};

const getWallSelectionData = (selection) => {
  if (!selection || selection.elementType !== "wall") return null;
  const floor = state.floorPlans[selection.floorId] || getActiveFloor();
  const room = floor.rooms.find((item) => item.id === selection.roomId);
  if (!room || isExteriorRoom(room)) return null;
  const wall = getWallForRoomSide(room, selection.wallSide);
  if (!wall) return null;
  const wallMeta = getWallMeta(wall);
  const affectedRooms = state.wallLinkLocked
    ? getRoomsSharingWall(floor, wallMeta)
    : [{ room, edge: selection.wallSide }];
  const constraints = getPositionConstraints(floor, wallMeta, affectedRooms);
  return { floor, room, wallMeta, affectedRooms, constraints };
};

const getOpeningSelectionData = (selection) => {
  if (!selection || selection.elementType === "wall") return null;
  const floor = state.floorPlans[selection.floorId] || getActiveFloor();
  const opening = floor.openings.find(
    (item) => item.id === selection.openingId,
  );
  if (!opening) return null;
  const room = floor.rooms.find((item) => item.id === opening.roomId);
  if (!room || isExteriorRoom(room)) return null;
  const meta = getOpeningMeta(opening);
  const wallSide = resolveOpeningWallSide(opening, room, meta);
  const bounds = getOpeningBoundsForWall(room, wallSide, meta.axis);
  const span = Math.max(0, bounds.end - bounds.start);
  const minLength = Math.min(MIN_OPENING_SIZE_PX, span);
  const maxLength = Math.max(minLength, span);
  const clampedLength = clamp(meta.length, minLength, maxLength);
  const positionBounds = getOpeningPositionBounds(bounds, clampedLength);
  if (!Number.isFinite(opening.heightMm)) {
    opening.heightMm = getDefaultOpeningHeightMm(opening.type);
  }
  return {
    floor,
    room,
    opening,
    meta: { ...meta, length: clampedLength },
    bounds,
    wallSide,
    minLength,
    maxLength,
    positionBounds,
  };
};

const getRoomsSharingWall = (floor, wallMeta) => {
  const matches = [];
  getInteriorRooms(floor).forEach((room) => {
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
      if (
        !rangesOverlap(
          edge.spanStart,
          edge.spanEnd,
          wallMeta.spanStart,
          wallMeta.spanEnd,
        )
      )
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

const updateOpeningsForWallMove = (
  floor,
  wallMeta,
  oldPosition,
  newPosition,
) => {
  floor.openings.forEach((opening) => {
    if (wallMeta.orientation === "vertical") {
      if (opening.x1 !== oldPosition || opening.x2 !== oldPosition) return;
      const spanStart = Math.min(opening.y1, opening.y2);
      const spanEnd = Math.max(opening.y1, opening.y2);
      if (
        !rangesOverlap(spanStart, spanEnd, wallMeta.spanStart, wallMeta.spanEnd)
      )
        return;
      opening.x1 = newPosition;
      opening.x2 = newPosition;
    } else {
      if (opening.y1 !== oldPosition || opening.y2 !== oldPosition) return;
      const spanStart = Math.min(opening.x1, opening.x2);
      const spanEnd = Math.max(opening.x1, opening.x2);
      if (
        !rangesOverlap(spanStart, spanEnd, wallMeta.spanStart, wallMeta.spanEnd)
      )
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
  if (
    (normalized.includes("signup") || normalized.includes("signups")) &&
    (normalized.includes("disabled") || normalized.includes("not allowed"))
  ) {
    return "Registrierung ist deaktiviert. Bitte Admin kontaktieren.";
  }
  if (normalized.includes("redirect") && normalized.includes("not allowed")) {
    return "Redirect-URL nicht erlaubt. In Supabase Auth → URL Configuration diese Domain erlauben.";
  }
  if (normalized.includes("user") && normalized.includes("not found")) {
    return "Kein Konto mit dieser E-Mail gefunden.";
  }
  return message;
};

const getAuthRedirectUrl = () => {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
};

const hasRecoveryParam = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, ""),
  );
  return (
    searchParams.get("type") === "recovery" ||
    hashParams.get("type") === "recovery"
  );
};

const getActivityActor = () =>
  authState.displayName ||
  (authState.user ? getDisplayName(authState.user) : "Unbekannt");

const getAuthToken = () => authState.session?.access_token || "";

const logActivityEvent = (
  type,
  { roomId = null, taskId = null, metadata = {} } = {},
) => {
  const event = {
    id: createActivityId(),
    type,
    actor: getActivityActor(),
    actorId: authState.user?.id || null,
    actorEmail: authState.user?.email || null,
    roomId,
    taskId,
    metadata: metadata && typeof metadata === "object" ? metadata : {},
    createdAt: new Date().toISOString(),
  };
  if (!Array.isArray(state.activityEvents)) {
    state.activityEvents = [];
  }
  state.activityEvents.unshift(event);
  if (state.activityEvents.length > ACTIVITY_EVENT_LIMIT) {
    state.activityEvents.length = ACTIVITY_EVENT_LIMIT;
  }
  renderActivityFeed();
  renderRoomActivity();
};

const setAuthFormsEnabled = (isEnabled) => {
  [elements.loginForm, elements.signupForm, elements.passwordResetForm].forEach(
    (form) => {
      if (!form) return;
      form.querySelectorAll("input, button").forEach((input) => {
        input.disabled = !isEnabled;
      });
    },
  );
};

const setAuthScreenVisible = (isVisible) => {
  if (!elements.authScreen) return;
  elements.authScreen.hidden = !isVisible;
  document.body.classList.toggle("auth-locked", isVisible);
};

const updateAuthUI = () => {
  const isAuthed = Boolean(authState.user);
  const isRecovery = Boolean(authState.isRecovery);
  setAuthScreenVisible(!isAuthed || isRecovery);
  if (elements.authForms) {
    elements.authForms.hidden = isRecovery;
  }
  if (elements.passwordResetPanel) {
    elements.passwordResetPanel.hidden = !isRecovery;
  }
  if (elements.authInfo) {
    elements.authInfo.hidden = !isAuthed || isRecovery;
  }
  if (elements.emailAccountsButton) {
    elements.emailAccountsButton.hidden = !isAuthed || isRecovery;
  }
  if ((!isAuthed || isRecovery) && elements.emailAccountsModal) {
    elements.emailAccountsModal.hidden = true;
    updateModalScrollLock();
  }
  if (elements.securitySettingsBtn) {
    elements.securitySettingsBtn.hidden = !isAuthed || isRecovery;
  }
  if (elements.authUserName) {
    elements.authUserName.textContent =
      isAuthed && !isRecovery ? authState.displayName : "";
    if (isAuthed && !isRecovery) {
      elements.authUserName.classList.add("user-name");
      applyUserColor(elements.authUserName, {
        id: authState.user?.id,
        email: authState.user?.email,
        name: authState.displayName,
      });
    } else {
      elements.authUserName.classList.remove("user-name");
    }
  }
};

const readJson = async (response) => {
  try {
    const text = await response.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch {
      return { _rawText: text };
    }
  } catch {
    return {};
  }
};

const stripHtml = (value) => {
  const raw = String(value || "");
  if (!raw) return "";
  const withoutScripts = raw
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
  const withBreaks = withoutScripts
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n");
  const withoutTags = withBreaks.replace(/<[^>]+>/g, " ");
  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+\n/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const createEmailOAuthState = () => {
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const setEmailPanelStatus = (message, isError = false) => {
  const targets = [
    elements.emailPanelStatus,
    elements.emailAccountsStatus,
  ].filter(Boolean);
  if (!targets.length) return;
  targets.forEach((target) => {
    target.textContent = message || "";
    target.classList.toggle("error", Boolean(message && isError));
    target.hidden = !message;
  });
};

const setEmailReplyStatus = (message, isError = false) => {
  if (!elements.emailReplyStatus) return;
  elements.emailReplyStatus.textContent = message || "";
  elements.emailReplyStatus.classList.toggle(
    "error",
    Boolean(message && isError),
  );
  elements.emailReplyStatus.hidden = !message;
};

const setEmailReplyTranslateStatus = (message, isError = false) => {
  if (!elements.emailReplyTranslateStatus) return;
  elements.emailReplyTranslateStatus.textContent = message || "";
  elements.emailReplyTranslateStatus.classList.toggle(
    "error",
    Boolean(message && isError),
  );
  elements.emailReplyTranslateStatus.hidden = !message;
};

const setReauthStatus = (message, isError = false) => {
  if (!elements.reauthStatus) return;
  elements.reauthStatus.textContent = message || "";
  elements.reauthStatus.classList.toggle("error", Boolean(message && isError));
  elements.reauthStatus.hidden = !message;
};

const setSecurityStatus = (message, isError = false) => {
  if (!elements.security2faStatus) return;
  elements.security2faStatus.textContent = message || "";
  elements.security2faStatus.classList.toggle(
    "error",
    Boolean(message && isError),
  );
};

const getSecurityErrorMessage = (response, data, fallback) => {
  const code = String(data?.code || "").trim();
  if (code === "missing_encryption_key") {
    return "Server-Konfiguration fehlt (EMAIL_TOKEN_ENCRYPTION_KEY).";
  }
  if (code === "missing_supabase_config") {
    return "Supabase-Konfiguration fehlt.";
  }
  if (code === "missing_access_token" || code === "invalid_access_token") {
    return "Sitzung abgelaufen. Bitte neu anmelden.";
  }
  if (code === "invalid_code") {
    return "Der Code ist ungültig. Bitte erneut versuchen.";
  }
  if (code === "disable_failed") {
    return "2FA konnte nicht deaktiviert werden.";
  }
  if (code === "setup_failed") {
    return "Setup konnte nicht gestartet werden.";
  }
  const rawText = String(data?._rawText || "").trim();
  if (rawText && !rawText.startsWith("<")) {
    return `Fehler: ${rawText.slice(0, 160)}`;
  }
  if (data?.error) {
    return `Fehler: ${String(data.error).slice(0, 160)}`;
  }
  if (response?.status) {
    return `${fallback} (HTTP ${response.status})`;
  }
  return fallback;
};

const getSecurityFetchErrorMessage = (error, fallback) => {
  const message = String(error?.message || "");
  if (message.includes("Failed to fetch")) {
    return "Server nicht erreichbar. Bitte neu laden.";
  }
  return fallback;
};

const getEmailOAuthErrorMessage = (response, data, fallback) => {
  const code = String(data?.code || "").trim();
  if (code === "missing_oauth_config") {
    return "OAuth-Konfiguration fehlt. Bitte APP_BASE_URL und Client-ID/Secret prüfen.";
  }
  if (code === "missing_access_token" || code === "invalid_access_token") {
    return "Sitzung abgelaufen. Bitte neu anmelden.";
  }
  if (code === "unknown_provider") {
    return "Unbekannter E-Mail-Anbieter.";
  }
  if (code === "oauth_connect_failed") {
    const detail =
      String(data?._rawText || "").trim() || String(data?.error || "").trim();
    if (detail) {
      return `OAuth konnte nicht abgeschlossen werden: ${detail.slice(0, 180)}`;
    }
    return "OAuth konnte nicht abgeschlossen werden.";
  }
  const rawText = String(data?._rawText || "").trim();
  if (rawText && !rawText.startsWith("<")) {
    return `Fehler: ${rawText.slice(0, 160)}`;
  }
  if (data?.error) {
    return `Fehler: ${String(data.error).slice(0, 160)}`;
  }
  if (response?.status) {
    return `${fallback} (HTTP ${response.status})`;
  }
  return fallback;
};

const getEmailApiErrorMessage = (response, data, fallback) => {
  const code = String(data?.code || "").trim();
  if (code === "missing_supabase_config") {
    return "Supabase-Konfiguration fehlt.";
  }
  if (code === "missing_access_token" || code === "invalid_access_token") {
    return "Sitzung abgelaufen. Bitte neu anmelden.";
  }
  if (code === "reauth_required") {
    return "Bestätigung erforderlich. Bitte erneut bestätigen.";
  }
  if (code === "missing_api_key") {
    return "OpenAI API-Schlüssel fehlt.";
  }
  if (code === "openai_network_error") {
    return "OpenAI ist nicht erreichbar.";
  }
  if (code === "openai_error") {
    return "OpenAI-Fehler.";
  }
  if (code === "missing_translation_data") {
    return "Übersetzungsdaten fehlen.";
  }
  if (code === "unsupported_target") {
    return "Übersetzungssprache nicht unterstützt.";
  }
  if (code === "message_not_found") {
    return "Nachricht nicht gefunden.";
  }
  if (code === "missing_message_body") {
    return "Nachricht enthält keinen Text.";
  }
  if (code === "missing_text") {
    return "Kein Text zum Übersetzen vorhanden.";
  }
  if (code === "missing_target") {
    return "Zielsprache fehlt.";
  }
  const rawText = String(data?._rawText || "").trim();
  if (rawText && !rawText.startsWith("<")) {
    return `Fehler: ${rawText.slice(0, 160)}`;
  }
  if (data?.error) {
    return `Fehler: ${String(data.error).slice(0, 160)}`;
  }
  if (response?.status) {
    return `${fallback} (HTTP ${response.status})`;
  }
  return fallback;
};

const getEmailFetchErrorMessage = (error, fallback) => {
  const message = String(error?.message || "");
  if (message.includes("Failed to fetch")) {
    return "Server nicht erreichbar. Bitte neu laden.";
  }
  return fallback;
};

const isLocalReauthFresh = () => {
  const userId = sessionStorage.getItem("2fa_user_id");
  if (!authState.user || userId !== authState.user.id) return false;
  const stamp = sessionStorage.getItem("2fa_verified_at");
  if (!stamp) return false;
  const timestamp = new Date(stamp).getTime();
  return Number.isFinite(timestamp) && timestamp > Date.now() - 30 * 60 * 1000;
};

const getProviderLabel = (provider) =>
  provider === "gmail" ? "Gmail" : "Outlook";

const requestEmailReauth = (method) => {
  if (reauthState.isOpen) return;
  openReauthModal({
    context: "email",
    method: method || "totp",
    onSuccess: async () => {
      const task = getTaskFromModal();
      if (task) {
        await refreshEmailPanel(task, { force: true });
      } else {
        await loadEmailAccounts();
      }
    },
  });
};

const handleEmailReauthRequired = (response, data) => {
  if (response.status === 401 && data?.requiresReauth) {
    requestEmailReauth(data?.method || "totp");
    return true;
  }
  return false;
};

const updateEmailConnectActions = () => {
  if (!elements.emailConnectActions) return;
  const hasGmail = emailState.accounts.some(
    (account) => account.provider === "gmail",
  );
  const hasMicrosoft = emailState.accounts.some(
    (account) => account.provider === "microsoft",
  );
  if (elements.emailConnectGmail) {
    elements.emailConnectGmail.hidden = hasGmail;
  }
  if (elements.emailConnectMicrosoft) {
    elements.emailConnectMicrosoft.hidden = hasMicrosoft;
  }
  const isAuthed = Boolean(authState.user) && !authState.isRecovery;
  elements.emailConnectActions.hidden = !isAuthed;
};

const renderEmailAccounts = () => {
  if (!elements.emailAccounts) return;
  elements.emailAccounts.innerHTML = "";
  if (!authState.user) return;
  if (!emailState.accounts.length) {
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = "Noch keine E-Mail-Konten verbunden.";
    elements.emailAccounts.appendChild(note);
    return;
  }
  emailState.accounts.forEach((account) => {
    const row = document.createElement("div");
    row.className = "email-account-row";
    const meta = document.createElement("div");
    meta.className = "email-account-meta";
    const provider = document.createElement("div");
    provider.className = "email-account-provider";
    provider.textContent = getProviderLabel(account.provider);
    const status = document.createElement("div");
    status.className = "email-account-status";
    const address = account.emailAddress || "Verbunden";
    status.textContent = account.isPaused
      ? `Pausiert · ${address}`
      : account.emailAddress
        ? `Verbunden als ${account.emailAddress}`
        : address;
    meta.appendChild(provider);
    meta.appendChild(status);
    row.appendChild(meta);
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = account.isPaused ? "Fortsetzen" : "Pausieren";
    toggle.addEventListener("click", () => void toggleEmailPause(account));
    row.appendChild(toggle);
    elements.emailAccounts.appendChild(row);
  });
};

const resetEmailState = () => {
  emailState.accounts = [];
  emailState.unlinkedThreads = [];
  emailState.linkedThreads = [];
  emailState.activeThread = null;
  emailState.threadMessages = [];
  emailState.loadingAccounts = false;
  emailState.loadingThreads = false;
  emailState.loadingMessages = false;
  emailState.translatingMessageIds = new Set();
  emailState.translatingDraft = false;
  emailState.error = "";
  setEmailPanelStatus("", false);
  setEmailReplyStatus("", false);
  setEmailReplyTranslateStatus("", false);
  if (elements.emailUnlinkedThreads) {
    elements.emailUnlinkedThreads.innerHTML = "";
  }
  if (elements.emailLinkedThreads) {
    elements.emailLinkedThreads.innerHTML = "";
  }
  clearEmailThreadView();
  updateEmailConnectActions();
  renderEmailAccounts();
};

const captureEmailOAuthParams = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const stateParam = params.get("state");
  const error = params.get("error");
  if (!code && !error) return;

  if (error) {
    emailState.error = "E-Mail-Verbindung abgebrochen.";
    sessionStorage.removeItem(emailOAuthCodeKey);
    sessionStorage.removeItem(emailOAuthProviderKey);
  } else if (code) {
    const storedState = sessionStorage.getItem(emailOAuthStateKey);
    const storedProvider = sessionStorage.getItem(emailOAuthProviderKey);
    if (storedState && stateParam && storedState !== stateParam) {
      emailState.error =
        "E-Mail-Verbindung fehlgeschlagen. Bitte erneut verbinden.";
      sessionStorage.removeItem(emailOAuthCodeKey);
      sessionStorage.removeItem(emailOAuthProviderKey);
    } else if (storedProvider) {
      sessionStorage.setItem(emailOAuthCodeKey, code);
    }
  }

  ["code", "state", "scope", "error"].forEach((key) => params.delete(key));
  const url = new URL(window.location.href);
  url.search = params.toString();
  window.history.replaceState({}, "", url.toString());
  if (emailState.error) {
    setEmailPanelStatus(emailState.error, true);
  }
};

const exchangeEmailCode = async (provider, code) => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await fetch(
      `/api/email/oauth/${provider}/callback?code=${encodeURIComponent(code)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error(
        getEmailOAuthErrorMessage(
          response,
          data,
          "E-Mail-Verbindung fehlgeschlagen.",
        ),
      );
    }
    emailState.error = "";
    sessionStorage.removeItem(emailOAuthCodeKey);
    sessionStorage.removeItem(emailOAuthProviderKey);
    sessionStorage.removeItem(emailOAuthStateKey);
    await loadEmailAccounts();
    const activeTask = getTaskFromModal();
    if (activeTask) {
      await refreshEmailPanel(activeTask, { force: true });
    }
  } catch (error) {
    emailState.error = getEmailFetchErrorMessage(
      error,
      error?.message || "E-Mail-Verbindung fehlgeschlagen.",
    );
    setEmailPanelStatus(emailState.error, true);
  }
};

const completePendingEmailOAuth = async () => {
  const code = sessionStorage.getItem(emailOAuthCodeKey);
  const provider = sessionStorage.getItem(emailOAuthProviderKey);
  if (!code || !provider) return;
  await exchangeEmailCode(provider, code);
};

const startEmailConnect = async (provider) => {
  if (!authState.user) {
    window.alert("Bitte zuerst anmelden.");
    return;
  }
  const token = getAuthToken();
  if (!token) {
    setEmailPanelStatus("Anmeldung abgelaufen. Bitte erneut anmelden.", true);
    return;
  }
  const stateToken = createEmailOAuthState();
  sessionStorage.setItem(emailOAuthStateKey, stateToken);
  sessionStorage.setItem(emailOAuthProviderKey, provider);
  try {
    const response = await fetch(
      `/api/email/oauth/${provider}/start?state=${encodeURIComponent(
        stateToken,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (!response.ok || !data?.url) {
      throw new Error(
        getEmailOAuthErrorMessage(
          response,
          data,
          "OAuth konnte nicht gestartet werden.",
        ),
      );
    }
    window.location.assign(data.url);
  } catch (error) {
    setEmailPanelStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "OAuth konnte nicht gestartet werden.",
      ),
      true,
    );
  }
};

const loadEmailAccounts = async () => {
  if (!authState.user) {
    resetEmailState();
    return;
  }
  const token = getAuthToken();
  if (!token) return;
  emailState.loadingAccounts = true;
  try {
    const response = await fetch("/api/email/accounts", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Konten konnten nicht geladen werden.",
        ),
      );
    }
    emailState.accounts = Array.isArray(data?.accounts) ? data.accounts : [];
    emailState.error = "";
  } catch (error) {
    emailState.accounts = [];
    emailState.error = getEmailFetchErrorMessage(
      error,
      error?.message || "Konten konnten nicht geladen werden.",
    );
    setEmailPanelStatus(emailState.error, true);
  } finally {
    emailState.loadingAccounts = false;
    renderEmailAccounts();
    updateEmailConnectActions();
  }
};

const toggleEmailPause = async (account) => {
  const token = getAuthToken();
  if (!token) return;
  const action = account.isPaused ? "unpause" : "pause";
  try {
    const response = await fetch(
      `/api/email/accounts/${encodeURIComponent(account.id)}/${action}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error("Status konnte nicht geändert werden.");
    }
    await loadEmailAccounts();
    const activeTask = getTaskFromModal();
    if (activeTask) {
      await refreshEmailPanel(activeTask, { force: true });
    }
  } catch (error) {
    setEmailPanelStatus(
      error?.message || "Status konnte nicht geändert werden.",
      true,
    );
  }
};

const loadSecuritySettings = async () => {
  if (!authState.user) {
    securityState.totpEnabled = false;
    securityState.recoveryCodesRemaining = 0;
    securityState.lastVerifiedAt = null;
    securityState.setup = null;
    securityState.recoveryCodes = [];
    renderSecurityPanel();
    return;
  }
  const token = getAuthToken();
  if (!token) return;
  securityState.loading = true;
  try {
    const response = await fetch("/api/security/settings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error("Sicherheitsstatus konnte nicht geladen werden.");
    }
    securityState.totpEnabled = Boolean(data?.totpEnabled);
    securityState.recoveryCodesRemaining = Number(
      data?.recoveryCodesRemaining || 0,
    );
    securityState.lastVerifiedAt = data?.lastVerifiedAt || null;
    securityState.setup = null;
    securityState.recoveryCodes = [];
  } catch (error) {
    securityState.totpEnabled = false;
    securityState.recoveryCodesRemaining = 0;
    securityState.lastVerifiedAt = null;
    securityState.setup = null;
    securityState.recoveryCodes = [];
  } finally {
    securityState.loading = false;
    renderSecurityPanel();
  }
};

const renderSecurityPanel = () => {
  const enabled = securityState.totpEnabled;
  setSecurityStatus(
    enabled
      ? `2FA ist aktiv. ${securityState.recoveryCodesRemaining} Recovery-Codes verfügbar.`
      : "2FA ist nicht aktiviert.",
    false,
  );
  if (elements.security2faStart) {
    elements.security2faStart.hidden = enabled;
  }
  if (elements.security2faDisable) {
    elements.security2faDisable.hidden = !enabled;
  }
  if (elements.security2faSetup) {
    elements.security2faSetup.hidden = !securityState.setup;
  }
  if (elements.securityQrImage) {
    if (securityState.setup?.qrDataUrl) {
      elements.securityQrImage.src = securityState.setup.qrDataUrl;
    } else {
      elements.securityQrImage.removeAttribute("src");
    }
  }
  if (elements.securitySecret) {
    elements.securitySecret.textContent = securityState.setup?.secret || "";
  }
  if (elements.securityRecovery) {
    elements.securityRecovery.hidden = !securityState.recoveryCodes.length;
  }
  if (elements.securityRecoveryList) {
    elements.securityRecoveryList.innerHTML = "";
    securityState.recoveryCodes.forEach((code) => {
      const item = document.createElement("li");
      item.textContent = code;
      elements.securityRecoveryList.appendChild(item);
    });
  }
};

const updateModalScrollLock = () => {
  if (!document.body) return;
  const hasOpenModal = Boolean(document.querySelector(".modal:not([hidden])"));
  document.body.classList.toggle("modal-open", hasOpenModal);
};

const openEmailAccountsModal = () => {
  if (!elements.emailAccountsModal) return;
  if (!authState.user || authState.isRecovery) {
    window.alert("Bitte zuerst anmelden.");
    return;
  }
  elements.emailAccountsModal.hidden = false;
  updateModalScrollLock();
  void loadEmailAccounts();
};

const closeEmailAccountsModal = () => {
  if (!elements.emailAccountsModal) return;
  elements.emailAccountsModal.hidden = true;
  updateModalScrollLock();
};

const handleEmailAccountsRefresh = () => {
  void loadEmailAccounts();
};

const openSecurityModal = () => {
  if (!elements.securityModal) return;
  elements.securityModal.hidden = false;
  updateModalScrollLock();
  void loadSecuritySettings();
};

const closeSecurityModal = () => {
  if (!elements.securityModal) return;
  elements.securityModal.hidden = true;
  updateModalScrollLock();
};

const handleSecurityStart = async () => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await fetch("/api/security/totp/setup", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error(
        getSecurityErrorMessage(
          response,
          data,
          "Setup konnte nicht gestartet werden.",
        ),
      );
    }
    securityState.setup = data;
    securityState.recoveryCodes = [];
    renderSecurityPanel();
  } catch (error) {
    setSecurityStatus(
      getSecurityFetchErrorMessage(
        error,
        error?.message || "Setup konnte nicht gestartet werden.",
      ),
      true,
    );
  }
};

const handleSecurityConfirm = async () => {
  const token = getAuthToken();
  if (!token || !elements.security2faCode) return;
  const code = elements.security2faCode.value.trim();
  if (!code) {
    setSecurityStatus("Bitte Code eingeben.", true);
    return;
  }
  try {
    const response = await fetch("/api/security/totp/confirm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error(
        getSecurityErrorMessage(
          response,
          data,
          "Code konnte nicht bestätigt werden.",
        ),
      );
    }
    securityState.totpEnabled = true;
    securityState.setup = null;
    securityState.recoveryCodes = Array.isArray(data?.recoveryCodes)
      ? data.recoveryCodes
      : [];
    securityState.recoveryCodesRemaining = securityState.recoveryCodes.length;
    const verifiedAt = new Date().toISOString();
    securityState.lastVerifiedAt = verifiedAt;
    sessionStorage.setItem("2fa_verified_at", verifiedAt);
    if (authState.user?.id) {
      sessionStorage.setItem("2fa_user_id", authState.user.id);
    }
    if (elements.security2faCode) {
      elements.security2faCode.value = "";
    }
    renderSecurityPanel();
  } catch (error) {
    setSecurityStatus(
      getSecurityFetchErrorMessage(
        error,
        error?.message || "Code konnte nicht bestätigt werden.",
      ),
      true,
    );
  }
};

const handleSecurityDisable = () => {
  openReauthModal({
    context: "disable-2fa",
    method: "totp",
  });
};

const openReauthModal = ({ context, method, onSuccess } = {}) => {
  if (!elements.reauthModal) return;
  const resolvedMethod = method || "totp";
  reauthState.isOpen = true;
  reauthState.context = context || "";
  reauthState.method = resolvedMethod;
  reauthState.onSuccess = onSuccess || null;
  if (elements.reauthModalTitle) {
    elements.reauthModalTitle.textContent =
      context === "reply"
        ? "Antwort bestätigen"
        : context === "disable-2fa"
          ? "2FA deaktivieren"
          : "Zwei-Faktor-Bestätigung";
  }
  if (elements.reauthHelper) {
    elements.reauthHelper.textContent =
      context === "reply"
        ? "Bitte bestätigen, um die Antwort zu senden."
        : context === "disable-2fa"
          ? "Bitte TOTP-Code eingeben, um 2FA zu deaktivieren."
          : resolvedMethod === "password"
            ? "Bitte Passwort eingeben, um fortzufahren."
            : "Bitte 2FA-Code eingeben, um fortzufahren.";
  }
  if (elements.reauthCodeRow) {
    elements.reauthCodeRow.hidden = resolvedMethod !== "totp";
  }
  if (elements.reauthRecoveryRow) {
    elements.reauthRecoveryRow.hidden =
      resolvedMethod !== "totp" || context === "disable-2fa";
  }
  if (elements.reauthPasswordRow) {
    elements.reauthPasswordRow.hidden = resolvedMethod !== "password";
  }
  if (elements.reauthCodeInput) elements.reauthCodeInput.value = "";
  if (elements.reauthRecoveryInput) elements.reauthRecoveryInput.value = "";
  if (elements.reauthPasswordInput) elements.reauthPasswordInput.value = "";
  setReauthStatus("", false);
  elements.reauthModal.hidden = false;
  updateModalScrollLock();
  if (resolvedMethod === "password") {
    elements.reauthPasswordInput?.focus();
  } else {
    elements.reauthCodeInput?.focus();
  }
};

const closeReauthModal = (force = false) => {
  if (!elements.reauthModal) return;
  if (!force && reauthState.context === "login") return;
  elements.reauthModal.hidden = true;
  reauthState.isOpen = false;
  reauthState.context = "";
  reauthState.method = "";
  reauthState.onSuccess = null;
  setReauthStatus("", false);
  updateModalScrollLock();
};

const handleReauthSubmit = async (event) => {
  event.preventDefault();
  const token = getAuthToken();
  if (!token) return;
  const code = String(elements.reauthCodeInput?.value || "").trim();
  const recovery = String(elements.reauthRecoveryInput?.value || "").trim();
  const password = String(elements.reauthPasswordInput?.value || "").trim();

  if (reauthState.context === "disable-2fa") {
    if (!code) {
      setReauthStatus("Bitte TOTP-Code eingeben.", true);
      return;
    }
    try {
      const response = await fetch("/api/security/totp/disable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      const data = await readJson(response);
      if (!response.ok) {
        throw new Error(
          getSecurityErrorMessage(
            response,
            data,
            "2FA konnte nicht deaktiviert werden.",
          ),
        );
      }
      securityState.totpEnabled = false;
      securityState.recoveryCodesRemaining = 0;
      securityState.recoveryCodes = [];
      securityState.lastVerifiedAt = null;
      securityState.setup = null;
      renderSecurityPanel();
      closeReauthModal(true);
    } catch (error) {
      setReauthStatus(
        getSecurityFetchErrorMessage(
          error,
          error?.message || "2FA konnte nicht deaktiviert werden.",
        ),
        true,
      );
    }
    return;
  }

  try {
    if (reauthState.method === "password" && !password) {
      setReauthStatus("Bitte Passwort eingeben.", true);
      return;
    }
    if (reauthState.method !== "password" && !code && !recovery) {
      setReauthStatus("Bitte Code eingeben.", true);
      return;
    }
    const payload =
      reauthState.method === "password"
        ? { password }
        : code
          ? { code }
          : { recoveryCode: recovery };
    const response = await fetch("/api/security/reauth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error("Bestätigung fehlgeschlagen.");
    }
    const verifiedAt = data?.verifiedAt || new Date().toISOString();
    sessionStorage.setItem("2fa_verified_at", verifiedAt);
    if (authState.user?.id) {
      sessionStorage.setItem("2fa_user_id", authState.user.id);
    }
    securityState.lastVerifiedAt = verifiedAt;
    if (Number.isFinite(data?.recoveryCodesRemaining)) {
      securityState.recoveryCodesRemaining = data.recoveryCodesRemaining;
    }
    closeReauthModal(true);
    if (typeof reauthState.onSuccess === "function") {
      const handler = reauthState.onSuccess;
      reauthState.onSuccess = null;
      await handler();
    }
  } catch (error) {
    setReauthStatus(error?.message || "Bestätigung fehlgeschlagen.", true);
  }
};

const refreshUI = () => {
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  renderTasksPanel();
  renderActivityFeed();
  updateFloorButtons();
  updateFloorplanHint();
  updateInteriorControls();
  updateArchitectToolUI();
  renderMobileRoomSelect();
};

const updateMobileLayout = ({ force = false } = {}) => {
  const isMobile = MOBILE_MEDIA_QUERY.matches;
  if (!force && state.isMobileView === isMobile) return;
  state.isMobileView = isMobile;
  document.body.classList.toggle("is-mobile", isMobile);
  if (isMobile) {
    if (state.isArchitectMode) {
      setArchitectMode(false);
    }
    if (state.isExteriorMode) {
      setExteriorMode(false);
    }
    if (state.show3d) {
      state.show3d = false;
    }
    clearTaskSelection();
  }
  renderMobileRoomSelect();
  renderTasksPanel();
  renderRoomPanel();
};

const syncTaskRoomFilter = (roomId, { shouldRender = false } = {}) => {
  if (state.isArchitectMode || state.activeView !== "tasks") return;
  const nextRoomId = roomId || "all";
  if (state.taskFilters.roomId === nextRoomId) return;
  state.taskFilters.roomId = nextRoomId;
  clearTaskSelection();
  if (shouldRender) {
    renderTasksPanel();
  }
};

const setActiveView = (viewId) => {
  const normalized = String(viewId || "").trim();
  state.activeView = APP_VIEWS.includes(normalized) ? normalized : APP_VIEWS[0];
  if (state.activeView === "tasks" && state.activeRoomId) {
    syncTaskRoomFilter(state.activeRoomId);
  }
  if (state.activeView === "tasks" && state.isArchitectMode) {
    setArchitectMode(false);
    return;
  }
  updateViewUI();
};

const setActiveRoomTab = (tabId) => {
  if (!ROOM_TABS.includes(tabId)) {
    state.activeRoomTab = ROOM_TABS[0];
  } else {
    state.activeRoomTab = tabId;
  }
  updateRoomTabs();
};

const updateRoomTabs = () => {
  if (!ROOM_TABS.includes(state.activeRoomTab)) {
    state.activeRoomTab = ROOM_TABS[0];
  }
  const hasRoom = Boolean(state.activeRoomId);
  if (elements.roomTabButtons?.length) {
    elements.roomTabButtons.forEach((button) => {
      const tab = button.dataset.roomTab;
      const isActive = tab === state.activeRoomTab;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.disabled = !hasRoom;
    });
  }
  if (elements.roomTabPanels?.length) {
    elements.roomTabPanels.forEach((panel) => {
      const tab = panel.dataset.roomPanel;
      panel.hidden = !hasRoom || tab !== state.activeRoomTab;
    });
  }
};

const updateViewUI = () => {
  const isArchitect = state.isArchitectMode;
  const activeView = APP_VIEWS.includes(state.activeView)
    ? state.activeView
    : APP_VIEWS[0];
  const hideArchitectToggle = activeView === "tasks";
  if (elements.architectToggleLabel) {
    elements.architectToggleLabel.hidden = hideArchitectToggle;
    elements.architectToggleLabel.setAttribute(
      "aria-hidden",
      String(hideArchitectToggle),
    );
  }
  if (elements.toggleArchitect) {
    elements.toggleArchitect.disabled = hideArchitectToggle;
    elements.toggleArchitect.setAttribute(
      "aria-disabled",
      String(hideArchitectToggle),
    );
  }
  document.body.classList.toggle(
    "tasks-view-active",
    !isArchitect && activeView === "tasks",
  );
  if (elements.architectView) {
    elements.architectView.hidden = !isArchitect;
    elements.architectView.setAttribute("aria-hidden", String(!isArchitect));
  }
  if (elements.architectHiddenPanels?.length) {
    elements.architectHiddenPanels.forEach((panel) => {
      panel.hidden = isArchitect;
      panel.setAttribute("aria-hidden", String(isArchitect));
    });
  }
  if (isArchitect) {
    return;
  }
  state.activeView = activeView;
  const isRoomView = activeView === "room";
  if (elements.roomView) {
    elements.roomView.hidden = !isRoomView;
    elements.roomView.classList.toggle("is-active", isRoomView);
    elements.roomView.setAttribute("aria-hidden", String(!isRoomView));
  }
  if (elements.tasksView) {
    const isTasksView = activeView === "tasks";
    elements.tasksView.hidden = !isTasksView;
    elements.tasksView.classList.toggle("is-active", isTasksView);
    elements.tasksView.setAttribute("aria-hidden", String(!isTasksView));
  }
  if (elements.viewButtons?.length) {
    elements.viewButtons.forEach((button) => {
      const view = button.dataset.appView;
      const isActive = view === activeView;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
  }
};

const getInitialPayload = () =>
  loadStateLocal() || {
    roomData: {},
    floorPlans: buildDefaultFloorPlans(),
    tasks: [],
    activityEvents: [],
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
        const updatedTimestamp = updatedAt ? new Date(updatedAt).getTime() : 0;
        if (
          updatedTimestamp &&
          updatedTimestamp <= syncState.lastSavedAt + 1500
        )
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
  authState.displayName = authState.user ? getDisplayName(authState.user) : "";
  updateAuthUI();
  if (authState.user) {
    setAuthMessage("", false);
  }

  if (!authState.user) {
    resetActivityNotificationState();
    resetEmailState();
    securityState.totpEnabled = false;
    securityState.recoveryCodesRemaining = 0;
    securityState.lastVerifiedAt = null;
    securityState.setup = null;
    securityState.recoveryCodes = [];
    sessionStorage.removeItem("2fa_verified_at");
    sessionStorage.removeItem("2fa_user_id");
    closeReauthModal(true);
    clearStateSubscription();
    return;
  }

  await completePendingEmailOAuth();
  await loadEmailAccounts();
  await loadSecuritySettings();
  if (
    !authState.isRecovery &&
    securityState.totpEnabled &&
    !isLocalReauthFresh()
  ) {
    openReauthModal({ context: "login", method: "totp" });
  }

  if (authState.user.id !== previousUserId) {
    resetActivityNotificationState();
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
  authState.isRecovery = hasRecoveryParam();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("Supabase Sessionfehler:", error);
    setAuthMessage("Anmeldung fehlgeschlagen. Bitte erneut versuchen.");
  }
  if (authState.isRecovery && !data?.session) {
    authState.isRecovery = false;
    setAuthMessage(
      "Passwort-Link ungültig oder abgelaufen. Bitte erneut anfordern.",
    );
  }
  await handleSessionChange(data?.session ?? null);
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      authState.isRecovery = true;
    } else if (event === "SIGNED_OUT" || event === "SIGNED_IN") {
      authState.isRecovery = false;
    }
    void handleSessionChange(session);
  });
};

const getLoginEmail = () => {
  if (!elements.loginForm) return "";
  const input = elements.loginForm.querySelector('input[name="email"]');
  return String(input?.value || "").trim();
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

const handleMagicLink = async () => {
  if (!supabase) return;
  const email = getLoginEmail();
  if (!email) {
    setAuthMessage("Bitte E-Mail eingeben.");
    return;
  }
  setAuthFormsEnabled(false);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      shouldCreateUser: false,
    },
  });
  setAuthFormsEnabled(true);
  if (error) {
    setAuthMessage(formatAuthError(error));
    return;
  }
  setAuthMessage("Magic Link ist unterwegs. Bitte Postfach prüfen.", false);
};

const handlePasswordResetRequest = async () => {
  if (!supabase) return;
  const email = getLoginEmail();
  if (!email) {
    setAuthMessage("Bitte E-Mail eingeben.");
    return;
  }
  setAuthFormsEnabled(false);
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });
  setAuthFormsEnabled(true);
  if (error) {
    setAuthMessage(formatAuthError(error));
    return;
  }
  setAuthMessage(
    "E-Mail zum Zurücksetzen ist unterwegs. Bitte Postfach prüfen.",
    false,
  );
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

const handlePasswordUpdate = async (event) => {
  event.preventDefault();
  if (!supabase) return;
  if (!authState.user) {
    authState.isRecovery = false;
    updateAuthUI();
    setAuthMessage(
      "Passwort-Link ungültig oder abgelaufen. Bitte erneut anfordern.",
    );
    return;
  }
  const formData = new FormData(event.target);
  const password = String(formData.get("password") || "").trim();
  const passwordConfirm = String(formData.get("passwordConfirm") || "").trim();
  if (!password || !passwordConfirm) {
    setAuthMessage("Bitte neues Passwort eingeben.");
    return;
  }
  if (password !== passwordConfirm) {
    setAuthMessage("Passwörter stimmen nicht überein.");
    return;
  }
  setAuthFormsEnabled(false);
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    setAuthFormsEnabled(true);
    setAuthMessage(formatAuthError(error));
    return;
  }
  authState.isRecovery = false;
  setAuthMessage("Passwort geändert. Bitte neu anmelden.", false);
  event.target.reset();
  await supabase.auth.signOut();
  setAuthFormsEnabled(true);
};

const handleSignOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

const createSvgElement = (tag) => document.createElementNS(SVG_NS, tag);

const createSvgLine = ({ x1, y1, x2, y2 }, className) => {
  const line = createSvgElement("line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  if (className) {
    line.setAttribute("class", className);
  }
  return line;
};

const createSvgPath = (d, className) => {
  const path = createSvgElement("path");
  path.setAttribute("d", d);
  if (className) {
    path.setAttribute("class", className);
  }
  return path;
};

const createSvgCircle = (cx, cy, r, className) => {
  const circle = createSvgElement("circle");
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  if (className) {
    circle.setAttribute("class", className);
  }
  return circle;
};

const getRoomDraftRect = (draft) => {
  if (!draft) return null;
  const start = {
    x: clamp(draft.startX, floorBounds.x, floorBounds.x + floorBounds.width),
    y: clamp(draft.startY, floorBounds.y, floorBounds.y + floorBounds.height),
  };
  const current = {
    x: clamp(draft.currentX, floorBounds.x, floorBounds.x + floorBounds.width),
    y: clamp(draft.currentY, floorBounds.y, floorBounds.y + floorBounds.height),
  };
  let x = Math.min(start.x, current.x);
  let y = Math.min(start.y, current.y);
  let width = Math.abs(current.x - start.x);
  let height = Math.abs(current.y - start.y);

  width = Math.max(width, MIN_ROOM_SIZE_PX);
  height = Math.max(height, MIN_ROOM_SIZE_PX);

  x = clamp(x, floorBounds.x, floorBounds.x + floorBounds.width - width);
  y = clamp(y, floorBounds.y, floorBounds.y + floorBounds.height - height);
  width = Math.min(width, floorBounds.x + floorBounds.width - x);
  height = Math.min(height, floorBounds.y + floorBounds.height - y);
  return { x, y, width, height };
};

const getOpeningRenderData = (opening, room) => {
  const meta = getOpeningMeta(opening);
  const wallSide = resolveOpeningWallSide(opening, room, meta);
  const wallData = wallSide ? getWallDataForSide(room, wallSide) : null;
  const axis = meta.axis;
  const start =
    axis === "x"
      ? Math.min(opening.x1, opening.x2)
      : Math.min(opening.y1, opening.y2);
  const end =
    axis === "x"
      ? Math.max(opening.x1, opening.x2)
      : Math.max(opening.y1, opening.y2);
  const position = axis === "x" ? opening.y1 : opening.x1;
  const normal =
    wallData?.normal || (axis === "x" ? { x: 0, y: 1 } : { x: 1, y: 0 });
  const wallDir = axis === "x" ? { x: 1, y: 0 } : { x: 0, y: 1 };
  const length = Math.max(meta.length, 1);
  return { axis, start, end, position, normal, wallDir, length };
};

const getOffsetLineCoords = (data, offset) => {
  const offsetX = data.normal.x * offset;
  const offsetY = data.normal.y * offset;
  if (data.axis === "x") {
    return {
      x1: data.start + offsetX,
      y1: data.position + offsetY,
      x2: data.end + offsetX,
      y2: data.position + offsetY,
    };
  }
  return {
    x1: data.position + offsetX,
    y1: data.start + offsetY,
    x2: data.position + offsetX,
    y2: data.end + offsetY,
  };
};

const appendDoorSymbol = (group, data, showSwing = true) => {
  const frameCoords = getOffsetLineCoords(data, OPENING_INSET_PX);
  group.appendChild(createSvgLine(frameCoords, "door-frame"));

  const hinge =
    data.axis === "x"
      ? { x: data.start, y: data.position }
      : { x: data.position, y: data.start };
  const leafEnd = {
    x: hinge.x + data.normal.x * data.length,
    y: hinge.y + data.normal.y * data.length,
  };
  const wallEnd = {
    x: hinge.x + data.wallDir.x * data.length,
    y: hinge.y + data.wallDir.y * data.length,
  };
  const sweep =
    data.wallDir.x * data.normal.y - data.wallDir.y * data.normal.x > 0 ? 1 : 0;

  const arcPath = `M ${wallEnd.x} ${wallEnd.y} A ${data.length} ${data.length} 0 0 ${sweep} ${leafEnd.x} ${leafEnd.y}`;
  if (showSwing) {
    group.appendChild(createSvgPath(arcPath, "door-arc"));
  }
  group.appendChild(
    createSvgLine(
      { x1: hinge.x, y1: hinge.y, x2: leafEnd.x, y2: leafEnd.y },
      "door-leaf",
    ),
  );
  group.appendChild(createSvgCircle(hinge.x, hinge.y, 2.2, "door-hinge"));
};

const appendWindowSymbol = (group, data) => {
  const outerCoords = getOffsetLineCoords(data, OPENING_INSET_PX);
  const innerCoords = getOffsetLineCoords(
    data,
    OPENING_INSET_PX + WINDOW_GAP_PX,
  );
  group.appendChild(createSvgLine(outerCoords, "window-line"));
  group.appendChild(createSvgLine(innerCoords, "window-line"));

  const center = (data.start + data.end) / 2;
  if (data.axis === "x") {
    const y1 = data.position + data.normal.y * OPENING_INSET_PX;
    const y2 =
      data.position + data.normal.y * (OPENING_INSET_PX + WINDOW_GAP_PX);
    group.appendChild(
      createSvgLine({ x1: center, y1, x2: center, y2 }, "window-cross"),
    );
  } else {
    const x1 = data.position + data.normal.x * OPENING_INSET_PX;
    const x2 =
      data.position + data.normal.x * (OPENING_INSET_PX + WINDOW_GAP_PX);
    group.appendChild(
      createSvgLine({ x1, y1: center, x2, y2: center }, "window-cross"),
    );
  }
};

const createOpeningGroup = (opening, room, floorId, isSelected) => {
  const group = createSvgElement("g");
  group.setAttribute(
    "class",
    `opening-group ${opening.type}-opening architect-hit${
      isSelected ? " selected" : ""
    }`,
  );
  group.dataset.roomId = opening.roomId;
  group.dataset.floorId = floorId;
  group.dataset.elementType = opening.type;
  group.dataset.elementLabel = opening.label;
  group.dataset.openingId = opening.id;

  group.appendChild(
    createSvgLine(
      { x1: opening.x1, y1: opening.y1, x2: opening.x2, y2: opening.y2 },
      "opening-hit",
    ),
  );

  const renderData = getOpeningRenderData(opening, room);
  if (opening.type === "door") {
    const showSwing = opening.showSwing === true;
    appendDoorSymbol(group, renderData, showSwing);
  } else {
    appendWindowSymbol(group, renderData);
  }
  return group;
};

const renderFloorplan = () => {
  elements.floorplan.innerHTML = "";
  hideCommentTooltip();
  updateFloorplanViewBox();
  const floor = getActiveFloor();
  if (!floor) return;
  const interiorRooms = getInteriorRooms(floor);
  const exteriorRooms = getExteriorRooms(floor);
  const visibleExteriorRooms = state.isExteriorMode ? exteriorRooms : [];

  visibleExteriorRooms.forEach((room) => {
    const rect = createSvgElement("rect");
    rect.setAttribute("x", room.x);
    rect.setAttribute("y", room.y);
    rect.setAttribute("width", room.width);
    rect.setAttribute("height", room.height);
    const isActive = state.activeRoomId === room.id;
    rect.setAttribute(
      "class",
      `room-hit exterior-room exterior-area exterior-${room.exteriorType}${
        isActive ? " active" : ""
      }`,
    );
    rect.dataset.roomId = room.id;
    rect.dataset.floorId = floor.id;
    rect.dataset.elementType = "room";
    rect.dataset.exterior = "true";
    elements.floorplan.appendChild(rect);
  });

  const outline = createSvgElement("rect");
  outline.setAttribute("x", OUTER_WALL_BOUNDS.x);
  outline.setAttribute("y", OUTER_WALL_BOUNDS.y);
  outline.setAttribute("width", OUTER_WALL_BOUNDS.width);
  outline.setAttribute("height", OUTER_WALL_BOUNDS.height);
  outline.setAttribute("class", "outer-wall");
  elements.floorplan.appendChild(outline);

  buildWallSegments(interiorRooms).forEach((wall) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", wall.x1);
    line.setAttribute("y1", wall.y1);
    line.setAttribute("x2", wall.x2);
    line.setAttribute("y2", wall.y2);
    line.setAttribute("class", "interior-wall");
    elements.floorplan.appendChild(line);
  });

  interiorRooms.forEach((room) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", room.x);
    rect.setAttribute("y", room.y);
    rect.setAttribute("width", room.width);
    rect.setAttribute("height", room.height);
    const isRoomSelected =
      state.selectedElement?.elementType === "room" &&
      state.selectedElement?.roomId === room.id &&
      state.selectedElement?.floorId === floor.id;
    rect.setAttribute(
      "class",
      `room-hit architect-hit${
        state.activeRoomId === room.id ? " active" : ""
      }${isRoomSelected ? " selected" : ""}`,
    );
    rect.dataset.roomId = room.id;
    rect.dataset.floorId = floor.id;
    rect.dataset.elementType = "room";
    rect.dataset.elementLabel = `${room.name} – Raum`;
    rect.dataset.exterior = "false";

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

  visibleExteriorRooms.forEach((room) => {
    const label = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text",
    );
    label.setAttribute("x", room.x + 12);
    label.setAttribute("y", room.y + 28);
    label.setAttribute("class", "room-label");
    label.textContent = room.name;
    elements.floorplan.appendChild(label);
  });

  interiorRooms.forEach((room) => {
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
      const isSelected =
        state.selectedElement?.elementType === "wall" &&
        state.selectedElement?.roomId === room.id &&
        state.selectedElement?.wallSide === wall.side &&
        state.selectedElement?.floorId === floor.id;
      line.setAttribute(
        "class",
        `wall-line architect-hit${isSelected ? " selected" : ""}`,
      );
      line.dataset.roomId = room.id;
      line.dataset.floorId = floor.id;
      line.dataset.elementType = "wall";
      line.dataset.wallSide = wall.side;
      line.dataset.elementLabel = `${room.name} – Wand ${wall.position}`;
      elements.floorplan.appendChild(line);
    });
  });

  floor.openings.forEach((opening) => {
    const isSelected =
      state.selectedElement?.openingId === opening.id &&
      state.selectedElement?.floorId === floor.id;
    const room =
      interiorRooms.find((item) => item.id === opening.roomId) || null;
    elements.floorplan.appendChild(
      createOpeningGroup(opening, room, floor.id, isSelected),
    );
  });

  if (state.roomDraft) {
    const draftRect = getRoomDraftRect(state.roomDraft);
    if (draftRect) {
      const preview = createSvgElement("rect");
      preview.setAttribute("x", draftRect.x);
      preview.setAttribute("y", draftRect.y);
      preview.setAttribute("width", draftRect.width);
      preview.setAttribute("height", draftRect.height);
      preview.setAttribute("class", "room-draft");
      elements.floorplan.appendChild(preview);
    }
  }

  const commentRooms = state.isExteriorMode ? exteriorRooms : interiorRooms;
  commentRooms.forEach((room) => {
    const roomData = ensureRoomData(room.id);
    roomData.comments.forEach((comment) => {
      if (comment.resolved) return;
      const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      marker.setAttribute("cx", comment.x);
      marker.setAttribute("cy", comment.y);
      marker.setAttribute("r", 6);
      marker.setAttribute("class", "comment-marker");
      marker.dataset.roomId = room.id;
      marker.dataset.commentId = comment.id;
      elements.floorplan.appendChild(marker);
    });
  });
};

const renderRoomPanel = () => {
  const room = state.activeRoomId ? findRoomById(state.activeRoomId) : null;
  if (!room) {
    elements.roomTitle.textContent = "Bitte wählen Sie einen Raum";
    elements.roomSubtitle.textContent =
      "Klicken Sie auf einen Raum im Grundriss, um Details zu sehen.";
    if (elements.roomChatTrigger) {
      elements.roomChatTrigger.disabled = true;
      elements.roomChatTrigger.setAttribute("aria-disabled", "true");
    }
    renderRoomTasks();
    if (elements.comments) {
      elements.comments.innerHTML = "";
    }
    if (elements.imageGallery) {
      elements.imageGallery.innerHTML = "";
    }
    if (elements.decisionList) {
      elements.decisionList.innerHTML = "";
      const empty = document.createElement("li");
      empty.className = "decision-card decision-empty";
      empty.textContent = "Bitte zuerst einen Raum auswählen.";
      elements.decisionList.appendChild(empty);
    }
    if (elements.decisionTasks) {
      elements.decisionTasks.innerHTML = "";
    }
    if (elements.decisionTasksEmpty) {
      elements.decisionTasksEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.decisionTasksEmpty.hidden = false;
    }
    if (elements.roomActivity) {
      elements.roomActivity.innerHTML = "";
    }
    if (elements.roomActivityEmpty) {
      elements.roomActivityEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.roomActivityEmpty.hidden = false;
    }
    if (elements.threeDPanel) {
      elements.threeDPanel.hidden = true;
    }
    updateRoomTabs();
    renderEvidenceUploadTargets();
    return;
  }
  const roomData = ensureRoomData(state.activeRoomId);

  elements.roomTitle.textContent = room.name;
  elements.roomSubtitle.textContent =
    "Aufgaben, Inspirationen und Entscheidungen für den Raum verwalten.";
  if (elements.roomChatTrigger) {
    elements.roomChatTrigger.disabled = false;
    elements.roomChatTrigger.setAttribute("aria-disabled", "false");
    elements.roomChatTrigger.setAttribute(
      "aria-label",
      `ChatGPT Chat zu ${room.name}`,
    );
    elements.roomChatTrigger.title = `ChatGPT Chat zu ${room.name}`;
  }
  elements.threeDLabel.textContent = `3D-Ansicht für ${room.name}`;
  const canShowThreeD =
    !state.isExteriorMode && !state.isMobileView && !isExteriorRoom(room);
  if (!canShowThreeD) {
    state.show3d = false;
  }
  if (elements.threeDPanel) {
    elements.threeDPanel.hidden = !canShowThreeD;
    elements.threeDPanel.classList.toggle(
      "open",
      canShowThreeD && state.show3d,
    );
  }
  if (elements.threeDButton) {
    elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";
    elements.threeDButton.disabled = !canShowThreeD;
  }
  if (canShowThreeD) {
    update3DScene(room.id);
  }

  renderRoomTasks();
  renderComments(roomData);
  renderImages(roomData);
  renderDecisions(roomData);
  renderDecisionTaskOptions();
  renderRoomActivity();
  updateRoomTabs();
  renderEvidenceUploadTargets();
};

const getCommentAuthorLabel = (comment) => {
  const userName =
    typeof comment?.userName === "string" ? comment.userName.trim() : "";
  if (userName) return userName;
  const email =
    typeof comment?.userEmail === "string" ? comment.userEmail.trim() : "";
  return email || "Unbekannt";
};

const getCommentText = (comment) => String(comment?.text ?? "Kommentar");

const isCommentAuthor = (comment) =>
  Boolean(authState.user?.id) && comment?.userId === authState.user.id;

const getCommentById = (roomId, commentId) => {
  if (!roomId || !commentId) return null;
  const roomData = ensureRoomData(roomId);
  return roomData.comments.find((comment) => comment.id === commentId) || null;
};

const getCommentDragData = (marker) => {
  if (!marker) return null;
  const commentId = marker.dataset.commentId;
  const roomId = marker.dataset.roomId;
  if (!commentId || !roomId) return null;
  const room = findRoomById(roomId);
  if (!room) return null;
  const comment = getCommentById(roomId, commentId);
  if (!comment || comment.resolved) return null;
  return { roomId, room, comment };
};

const getCommentTooltipPosition = (comment) => {
  if (!elements.floorplan || !elements.floorplanWrapper) return null;
  const floorRect = elements.floorplan.getBoundingClientRect();
  const wrapperRect = elements.floorplanWrapper.getBoundingClientRect();
  const viewBox = getFloorplanViewBox();
  const x =
    ((comment.x - viewBox.x) / viewBox.width) * floorRect.width +
    (floorRect.left - wrapperRect.left);
  const y =
    ((comment.y - viewBox.y) / viewBox.height) * floorRect.height +
    (floorRect.top - wrapperRect.top);
  return { x, y };
};

const showCommentTooltip = (comment, roomId) => {
  if (!elements.commentTooltip) return;
  const position = getCommentTooltipPosition(comment);
  if (!position) return;
  if (elements.commentTooltipAuthor) {
    const authorLabel = getCommentAuthorLabel(comment);
    elements.commentTooltipAuthor.textContent = authorLabel;
    applyUserColor(elements.commentTooltipAuthor, {
      id: comment.userId,
      email: comment.userEmail,
      name: authorLabel,
    });
  }
  if (elements.commentTooltipText) {
    elements.commentTooltipText.textContent = getCommentText(comment);
  }
  elements.commentTooltip.style.left = `${position.x}px`;
  elements.commentTooltip.style.top = `${position.y}px`;
  elements.commentTooltip.hidden = false;
  elements.commentTooltip.setAttribute("aria-hidden", "false");
  commentTooltipState.commentId = comment.id;
  commentTooltipState.roomId = roomId;
};

const hideCommentTooltip = () => {
  if (!elements.commentTooltip) return;
  elements.commentTooltip.hidden = true;
  elements.commentTooltip.setAttribute("aria-hidden", "true");
  commentTooltipState.commentId = null;
  commentTooltipState.roomId = null;
};

const showCommentTooltipForMarker = (marker) => {
  if (!marker) return;
  const commentId = marker.dataset.commentId;
  const roomId = marker.dataset.roomId;
  if (!commentId || !roomId) {
    hideCommentTooltip();
    return;
  }
  if (
    commentTooltipState.commentId === commentId &&
    commentTooltipState.roomId === roomId
  ) {
    return;
  }
  const comment = getCommentById(roomId, commentId);
  if (!comment) {
    hideCommentTooltip();
    return;
  }
  showCommentTooltip(comment, roomId);
};

const focusCommentInRoom = (roomId, commentId) => {
  if (!roomId || !commentId) return;
  selectRoom(roomId);
  setActiveView("room");
  setActiveRoomTab("overview");
  hideCommentTooltip();
  window.requestAnimationFrame(() => {
    if (elements.comments) {
      elements.comments
        .querySelectorAll(".is-focused")
        .forEach((item) => item.classList.remove("is-focused"));
    }
    const commentItem = elements.comments?.querySelector(
      `[data-comment-id="${commentId}"]`,
    );
    if (!commentItem) return;
    commentItem.scrollIntoView({ behavior: "smooth", block: "center" });
    commentItem.classList.add("is-focused");
    window.setTimeout(() => {
      commentItem.classList.remove("is-focused");
    }, 1600);
  });
};

const focusCommentFromMarker = (marker) => {
  if (!marker || state.isAddingComment || state.isArchitectMode) return false;
  const roomId = marker.dataset.roomId;
  const commentId = marker.dataset.commentId;
  if (!roomId || !commentId) return false;
  if (state.isExteriorMode) {
    const room = findRoomById(roomId);
    if (!room || !isExteriorRoom(room)) return false;
  }
  const comment = getCommentById(roomId, commentId);
  if (!comment) return false;
  focusCommentInRoom(roomId, commentId);
  return true;
};

const positionCommentContextMenu = (clientX, clientY) => {
  if (!elements.commentContextMenu) return;
  const menu = elements.commentContextMenu;
  menu.style.left = `${clientX}px`;
  menu.style.top = `${clientY}px`;
  const rect = menu.getBoundingClientRect();
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - rect.width - margin);
  const maxY = Math.max(margin, window.innerHeight - rect.height - margin);
  const x = clamp(clientX, margin, maxX);
  const y = clamp(clientY, margin, maxY);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
};

const updateCommentContextMenu = (comment) => {
  if (!elements.commentContextMenu) return;
  const menu = elements.commentContextMenu;
  const canEdit = isCommentAuthor(comment);
  const canDelete = isCommentAuthor(comment);
  const editBtn = menu.querySelector("button[data-action='edit']");
  const resolveBtn = menu.querySelector("button[data-action='resolve']");
  const deleteBtn = menu.querySelector("button[data-action='delete']");
  if (editBtn) {
    editBtn.disabled = !canEdit;
    editBtn.setAttribute("aria-disabled", String(!canEdit));
  }
  if (deleteBtn) {
    deleteBtn.disabled = !canDelete;
    deleteBtn.setAttribute("aria-disabled", String(!canDelete));
  }
  if (resolveBtn) {
    resolveBtn.textContent = comment.resolved
      ? "Als offen markieren"
      : "Als erledigt markieren";
  }
};

const openCommentContextMenu = (event, comment, roomId) => {
  if (!elements.commentContextMenu) return;
  updateCommentContextMenu(comment);
  elements.commentContextMenu.hidden = false;
  elements.commentContextMenu.setAttribute("aria-hidden", "false");
  commentContextState.commentId = comment.id;
  commentContextState.roomId = roomId;
  commentContextState.isOpen = true;
  positionCommentContextMenu(event.clientX, event.clientY);
};

const closeCommentContextMenu = () => {
  if (!elements.commentContextMenu || !commentContextState.isOpen) return;
  elements.commentContextMenu.hidden = true;
  elements.commentContextMenu.setAttribute("aria-hidden", "true");
  commentContextState.commentId = null;
  commentContextState.roomId = null;
  commentContextState.isOpen = false;
};

const handleCommentContextAction = (action) => {
  const roomId = commentContextState.roomId;
  const commentId = commentContextState.commentId;
  if (!roomId || !commentId) return;
  const roomData = ensureRoomData(roomId);
  const commentIndex = roomData.comments.findIndex(
    (item) => item.id === commentId,
  );
  if (commentIndex < 0) return;
  const comment = roomData.comments[commentIndex];
  if (!comment) return;

  if (action === "edit") {
    if (!isCommentAuthor(comment)) return;
    const nextText = window.prompt("Kommentar bearbeiten:", comment.text || "");
    if (nextText === null) return;
    const trimmed = nextText.trim();
    if (!trimmed) {
      window.alert("Kommentar darf nicht leer sein.");
      return;
    }
    comment.text = trimmed;
    comment.updatedAt = new Date().toISOString();
  } else if (action === "delete") {
    if (!isCommentAuthor(comment)) return;
    const confirmed = window.confirm("Kommentar wirklich löschen?");
    if (!confirmed) return;
    roomData.comments.splice(commentIndex, 1);
  } else if (action === "resolve") {
    const nextResolved = !comment.resolved;
    comment.resolved = nextResolved;
    comment.resolvedAt = nextResolved ? new Date().toISOString() : null;
    comment.resolvedBy = nextResolved ? authState.user?.id || null : null;
  }

  saveState();
  hideCommentTooltip();
  renderFloorplan();
  if (state.activeRoomId === roomId) {
    renderComments(roomData);
  }
};

const CHAT_SCOPE_LABELS = {
  room: "Raum",
  task: "Aufgabe",
  comment: "Kommentar",
};

const ensureChatThread = (target) => {
  if (!target) return { thread: null, created: false };
  const normalized = normalizeChatThread(target.chat);
  if (normalized) {
    target.chat = normalized;
    return { thread: normalized, created: false };
  }
  const thread = buildChatThread();
  target.chat = thread;
  return { thread, created: true };
};

const resolveChatTarget = ({ scope, roomId, taskId, commentId }) => {
  if (scope === "room") {
    if (!roomId) return null;
    const room = findRoomById(roomId);
    const roomData = ensureRoomData(roomId);
    const { thread, created } = ensureChatThread(roomData);
    const label = room?.name || roomId;
    return {
      scope,
      roomId,
      target: roomData,
      thread,
      created,
      label,
      contextLabel: `${CHAT_SCOPE_LABELS.room}: ${label}`,
    };
  }
  if (scope === "task") {
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task) return null;
    const { thread, created } = ensureChatThread(task);
    const label = task.title || task.id;
    return {
      scope,
      taskId,
      target: task,
      thread,
      created,
      label,
      contextLabel: `${CHAT_SCOPE_LABELS.task}: ${label}`,
    };
  }
  if (scope === "comment") {
    if (!roomId || !commentId) return null;
    const comment = getCommentById(roomId, commentId);
    if (!comment) return null;
    const { thread, created } = ensureChatThread(comment);
    const label = truncateText(getCommentText(comment), 80) || "Kommentar";
    return {
      scope,
      roomId,
      commentId,
      target: comment,
      thread,
      created,
      label,
      contextLabel: `${CHAT_SCOPE_LABELS.comment}: ${label}`,
    };
  }
  return null;
};

const buildChatIcon = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const bubble = document.createElementNS(SVG_NS, "path");
  bubble.setAttribute(
    "d",
    "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  );
  bubble.setAttribute("fill", "none");
  bubble.setAttribute("stroke", "currentColor");
  bubble.setAttribute("stroke-width", "1.5");
  bubble.setAttribute("stroke-linecap", "round");
  bubble.setAttribute("stroke-linejoin", "round");
  svg.appendChild(bubble);

  const line1 = document.createElementNS(SVG_NS, "line");
  line1.setAttribute("x1", "7.5");
  line1.setAttribute("x2", "15.5");
  line1.setAttribute("y1", "9");
  line1.setAttribute("y2", "9");
  line1.setAttribute("stroke", "currentColor");
  line1.setAttribute("stroke-width", "1.5");
  line1.setAttribute("stroke-linecap", "round");
  svg.appendChild(line1);

  const line2 = document.createElementNS(SVG_NS, "line");
  line2.setAttribute("x1", "7.5");
  line2.setAttribute("x2", "12.5");
  line2.setAttribute("y1", "12.5");
  line2.setAttribute("y2", "12.5");
  line2.setAttribute("stroke", "currentColor");
  line2.setAttribute("stroke-width", "1.5");
  line2.setAttribute("stroke-linecap", "round");
  svg.appendChild(line2);
  return svg;
};

const buildPlanIcon = () => {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");

  const outline = document.createElementNS(SVG_NS, "rect");
  outline.setAttribute("x", "3.5");
  outline.setAttribute("y", "4.5");
  outline.setAttribute("width", "17");
  outline.setAttribute("height", "15");
  outline.setAttribute("rx", "2");
  outline.setAttribute("fill", "none");
  outline.setAttribute("stroke", "currentColor");
  outline.setAttribute("stroke-width", "1.5");
  outline.setAttribute("stroke-linejoin", "round");
  svg.appendChild(outline);

  const header = document.createElementNS(SVG_NS, "line");
  header.setAttribute("x1", "3.5");
  header.setAttribute("x2", "20.5");
  header.setAttribute("y1", "8.5");
  header.setAttribute("y2", "8.5");
  header.setAttribute("stroke", "currentColor");
  header.setAttribute("stroke-width", "1.5");
  header.setAttribute("stroke-linecap", "round");
  svg.appendChild(header);

  const check = document.createElementNS(SVG_NS, "path");
  check.setAttribute("d", "M8.5 13.5l2 2 4.5-4.5");
  check.setAttribute("fill", "none");
  check.setAttribute("stroke", "currentColor");
  check.setAttribute("stroke-width", "1.5");
  check.setAttribute("stroke-linecap", "round");
  check.setAttribute("stroke-linejoin", "round");
  svg.appendChild(check);

  return svg;
};

const buildChatTrigger = ({ scope, roomId, taskId, commentId, label } = {}) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-trigger";
  button.setAttribute("aria-label", label || "ChatGPT Chat");
  button.title = label || "ChatGPT Chat";
  button.appendChild(buildChatIcon());
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openChatModal({ scope, roomId, taskId, commentId });
  });
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("dragstart", (event) => event.preventDefault());
  return button;
};

const positionTaskPlanMenu = (trigger) => {
  if (!elements.taskPlanMenu || !trigger) return;
  const menu = elements.taskPlanMenu;
  const rect = trigger.getBoundingClientRect();
  const offset = 8;
  menu.style.left = `${rect.right}px`;
  menu.style.top = `${rect.bottom + offset}px`;
  const menuRect = menu.getBoundingClientRect();
  const margin = 12;
  const maxX = Math.max(margin, window.innerWidth - menuRect.width - margin);
  let x = clamp(rect.right - menuRect.width, margin, maxX);
  let y = rect.bottom + offset;
  if (y + menuRect.height > window.innerHeight - margin) {
    y = rect.top - menuRect.height - offset;
  }
  const maxY = Math.max(margin, window.innerHeight - menuRect.height - margin);
  y = clamp(y, margin, maxY);
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
};

const openTaskPlanMenu = (trigger, taskId) => {
  if (!elements.taskPlanMenu || !trigger || !taskId) return;
  closeTaskPlanMenu();
  elements.taskPlanMenu.hidden = false;
  elements.taskPlanMenu.setAttribute("aria-hidden", "false");
  taskPlanMenuState.taskId = taskId;
  taskPlanMenuState.isOpen = true;
  taskPlanMenuState.trigger = trigger;
  trigger.setAttribute("aria-expanded", "true");
  positionTaskPlanMenu(trigger);
};

const closeTaskPlanMenu = () => {
  if (!elements.taskPlanMenu || !taskPlanMenuState.isOpen) return;
  elements.taskPlanMenu.hidden = true;
  elements.taskPlanMenu.setAttribute("aria-hidden", "true");
  taskPlanMenuState.trigger?.setAttribute("aria-expanded", "false");
  taskPlanMenuState.taskId = null;
  taskPlanMenuState.isOpen = false;
  taskPlanMenuState.trigger = null;
};

const handleTaskPlanMenuAction = (action, taskIdOverride) => {
  const taskId = taskIdOverride ?? taskPlanMenuState.taskId;
  if (!taskId || !action) return;
  if (action === "plan") {
    openTaskModal(taskId);
    return;
  }
  if (action === "chat") {
    openChatModal({ scope: "task", taskId });
  }
};

const toggleTaskPlanMenu = (trigger, taskId) => {
  if (taskPlanMenuState.isOpen && taskPlanMenuState.taskId === taskId) {
    closeTaskPlanMenu();
    return;
  }
  openTaskPlanMenu(trigger, taskId);
};

const buildTaskPlanTrigger = ({ taskId, label } = {}) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chat-trigger plan-trigger";
  button.setAttribute("aria-label", label || "Planen");
  button.title = label || "Planen";
  button.appendChild(buildPlanIcon());
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openTaskModal(taskId);
  });
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  button.addEventListener("dragstart", (event) => event.preventDefault());
  return button;
};

const renderChatThread = (thread) => {
  if (!elements.chatThread) return;
  elements.chatThread.innerHTML = "";
  if (!thread || !Array.isArray(thread.messages) || !thread.messages.length) {
    const empty = document.createElement("li");
    empty.className = "chat-empty helper";
    empty.textContent = "Noch keine Nachrichten.";
    elements.chatThread.appendChild(empty);
    return;
  }
  thread.messages.forEach((message) => {
    const item = document.createElement("li");
    item.className = "chat-message";
    item.classList.toggle("is-assistant", message.role === "assistant");

    const meta = document.createElement("div");
    meta.className = "chat-message-meta";
    if (message.role === "assistant") {
      const role = document.createElement("span");
      role.className = "chat-message-role";
      role.textContent = "ChatGPT";
      meta.appendChild(role);
    } else {
      const authorLabel = message.userName || message.userEmail || "Unbekannt";
      meta.appendChild(
        createUserSpan({
          label: authorLabel,
          id: message.userId,
          email: message.userEmail,
        }),
      );
    }
    const time = document.createElement("span");
    time.className = "chat-message-time";
    time.textContent = formatActivityTimestamp(message.createdAt);
    meta.appendChild(time);
    item.appendChild(meta);

    const text = document.createElement("div");
    text.className = "chat-message-text";
    text.textContent = message.text;
    item.appendChild(text);

    elements.chatThread.appendChild(item);
  });
  elements.chatThread.scrollTop = elements.chatThread.scrollHeight;
};

const setChatStatus = (text, isError = false) => {
  if (!elements.chatStatus) return;
  elements.chatStatus.textContent = text || "";
  elements.chatStatus.classList.toggle("status-line", Boolean(text));
  elements.chatStatus.classList.toggle("error", Boolean(text) && isError);
};

const setChatFormEnabled = (isEnabled) => {
  if (elements.chatInput) {
    elements.chatInput.disabled = !isEnabled;
  }
  const submit = elements.chatForm?.querySelector("button[type='submit']");
  if (submit) {
    submit.disabled = !isEnabled;
  }
};

const formatChatEffortLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (!normalized || normalized === "auto") return "Auto";
  if (normalized === "low") return "Niedrig";
  if (normalized === "medium") return "Mittel";
  if (normalized === "high") return "Hoch";
  return value || "Auto";
};

const updateChatConfigDisplay = () => {
  const model = chatConfigState.model || "";
  const effort =
    chatConfigState.reasoningEffort || DEFAULT_CHAT_CONFIG.reasoningEffort;
  if (elements.chatConfigModel) {
    elements.chatConfigModel.textContent = model
      ? `Modell: ${model}`
      : "Modell: OpenAI-Standard";
  }
  if (elements.chatConfigEffort) {
    elements.chatConfigEffort.textContent = `Reasoning-Aufwand: ${formatChatEffortLabel(
      effort,
    )}`;
  }
};

const normalizeChatConfig = (payload) => {
  const model = typeof payload?.model === "string" ? payload.model.trim() : "";
  const reasoningEffort =
    typeof payload?.reasoningEffort === "string"
      ? payload.reasoningEffort.trim()
      : "";
  return {
    model,
    reasoningEffort: reasoningEffort || DEFAULT_CHAT_CONFIG.reasoningEffort,
  };
};

const fetchChatConfig = async ({ force = false } = {}) => {
  if (!force && chatConfigState.loaded) {
    return {
      model: chatConfigState.model,
      reasoningEffort: chatConfigState.reasoningEffort,
    };
  }
  if (chatConfigState.loading) {
    return chatConfigState.loading;
  }
  chatConfigState.loading = (async () => {
    try {
      const response = await fetch("/api/chat-config");
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      if (response.ok) {
        const normalized = normalizeChatConfig(data);
        chatConfigState.model = normalized.model;
        chatConfigState.reasoningEffort = normalized.reasoningEffort;
      }
    } catch {
      // Use fallback config on network errors.
    }
    chatConfigState.loaded = true;
    chatConfigState.loading = null;
    updateChatConfigDisplay();
    return {
      model: chatConfigState.model,
      reasoningEffort: chatConfigState.reasoningEffort,
    };
  })();
  return chatConfigState.loading;
};

const buildChatRequestPayload = ({ thread, contextLabel }) => {
  const trimmed = Array.isArray(thread?.messages)
    ? thread.messages.slice(-CHAT_MESSAGE_LIMIT)
    : [];
  const messages = trimmed
    .map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: message.text,
    }))
    .filter((message) => message.content);
  return {
    messages,
    context: contextLabel || "",
  };
};

const requestChatResponse = async ({ thread, contextLabel }) => {
  const payload = buildChatRequestPayload({ thread, contextLabel });
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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

  const message = String(data?.message || "").trim();
  if (!message) {
    const error = new Error("Keine Antwort erhalten.");
    error.code = "missing_response";
    throw error;
  }
  return {
    message,
    model: String(data?.model || "").trim(),
    reasoningEffort: String(data?.reasoningEffort || "").trim(),
  };
};

const openChatModal = ({ scope, roomId, taskId, commentId } = {}) => {
  if (!elements.chatModal) return;
  const resolved = resolveChatTarget({
    scope,
    roomId,
    taskId,
    commentId,
  });
  if (!resolved || !resolved.thread) return;

  chatModalState.scope = resolved.scope;
  chatModalState.roomId = roomId || null;
  chatModalState.taskId = taskId || null;
  chatModalState.commentId = commentId || null;
  chatModalState.isOpen = true;

  if (elements.chatModalTitle) {
    elements.chatModalTitle.textContent = "ChatGPT Chat";
  }
  if (elements.chatModalContext) {
    elements.chatModalContext.textContent = resolved.contextLabel;
  }
  if (resolved.created) {
    saveState();
  }
  if (elements.chatInput) {
    elements.chatInput.value = "";
  }
  setChatStatus("");
  setChatFormEnabled(true);
  renderChatThread(resolved.thread);
  elements.chatModal.hidden = false;
  updateModalScrollLock();
  elements.chatInput?.focus();
};

const closeChatModal = () => {
  if (!elements.chatModal) return;
  elements.chatModal.hidden = true;
  chatModalState.scope = null;
  chatModalState.roomId = null;
  chatModalState.taskId = null;
  chatModalState.commentId = null;
  chatModalState.isOpen = false;
  if (elements.chatInput) {
    elements.chatInput.value = "";
  }
  setChatStatus("");
  if (elements.chatThread) {
    elements.chatThread.innerHTML = "";
  }
  updateModalScrollLock();
};

const getActiveChatTarget = () => {
  if (!chatModalState.isOpen) return null;
  return resolveChatTarget(chatModalState);
};

const handleChatSubmit = async (event) => {
  event.preventDefault();
  if (chatRequestState.inFlight) return;
  const resolved = getActiveChatTarget();
  const thread = resolved?.thread;
  if (!thread || !elements.chatInput) return;
  const text = elements.chatInput.value.trim();
  if (!text) return;
  const timestamp = new Date().toISOString();
  thread.messages.push({
    id: createChatMessageId(),
    role: "user",
    text,
    createdAt: timestamp,
    userId: authState.user?.id || null,
    userName: getActivityActor(),
    userEmail: authState.user?.email || "",
  });
  thread.updatedAt = timestamp;
  elements.chatInput.value = "";
  saveState();
  renderChatThread(thread);
  setChatStatus("ChatGPT antwortet …");
  setChatFormEnabled(false);
  chatRequestState.inFlight = true;
  try {
    const config = await fetchChatConfig();
    const response = await requestChatResponse({
      thread,
      contextLabel: resolved?.contextLabel || "",
    });
    thread.messages.push({
      id: createChatMessageId(),
      role: "assistant",
      text: response.message,
      createdAt: new Date().toISOString(),
      userId: null,
      userName: "ChatGPT",
      userEmail: "",
    });
    thread.model = response.model || config.model || "";
    thread.effort =
      response.reasoningEffort || config.reasoningEffort || thread.effort;
    thread.updatedAt = new Date().toISOString();
    saveState();
    renderChatThread(thread);
    setChatStatus("");
  } catch (error) {
    console.error("ChatGPT Anfrage fehlgeschlagen:", error);
    const networkBlocked = isLikelyNetworkBlock(error);
    const message =
      error?.code === "missing_api_key"
        ? "Kein API-Schlüssel gefunden. OPENAI_API_KEY setzen."
        : error?.code === "openai_error"
          ? `OpenAI-Fehler: ${error.message}`
          : networkBlocked
            ? "ChatGPT ist nicht erreichbar. App über npm run serve starten."
            : "Antwort fehlgeschlagen. Bitte erneut versuchen.";
    setChatStatus(message, true);
  } finally {
    chatRequestState.inFlight = false;
    setChatFormEnabled(true);
    elements.chatInput?.focus();
  }
};

const initChatControls = () => {
  if (
    elements.roomChatTrigger &&
    !elements.roomChatTrigger.querySelector("svg")
  ) {
    elements.roomChatTrigger.appendChild(buildChatIcon());
  }
  updateChatConfigDisplay();
};

const renderComments = (roomData) => {
  elements.comments.innerHTML = "";
  roomData.comments.forEach((comment) => {
    const li = document.createElement("li");
    li.dataset.commentId = comment.id;
    if (state.activeRoomId) {
      li.dataset.roomId = state.activeRoomId;
    }
    li.classList.toggle("is-resolved", comment.resolved);
    const author = getCommentAuthorLabel(comment);
    const text = getCommentText(comment);
    const row = document.createElement("div");
    row.className = "comment-row";
    const message = document.createElement("div");
    message.className = "comment-message";
    appendActivityMessage(
      message,
      buildActivityMessageParts(
        {
          type: "comment_added",
          actor: author,
          actorId: comment.userId || null,
          actorEmail: comment.userEmail || null,
          metadata: { text },
        },
        { truncateDetail: false },
      ),
    );
    row.appendChild(message);
    row.appendChild(
      buildChatTrigger({
        scope: "comment",
        roomId: state.activeRoomId,
        commentId: comment.id,
        label: "ChatGPT Chat zum Kommentar",
      }),
    );
    li.appendChild(row);
    elements.comments.appendChild(li);
  });
};

const isEvidenceImage = (file) => {
  if (!file) return false;
  if (typeof file.type === "string" && file.type.startsWith("image/")) {
    return true;
  }
  const url = String(file.url || "");
  return (
    url.startsWith("data:image") || /\.(png|jpe?g|gif|webp|svg)$/i.test(url)
  );
};

const formatFileSize = (size) => {
  if (!Number.isFinite(size)) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatEvidenceDetails = (file) => {
  const details = [];
  if (file?.type) {
    const typeLabel = String(file.type).split("/").pop();
    if (typeLabel) {
      details.push(typeLabel.toUpperCase());
    }
  }
  const sizeLabel = formatFileSize(file?.size);
  if (sizeLabel) {
    details.push(sizeLabel);
  }
  return details.join(" · ");
};

const getEvidenceTaskLabel = (file, taskMap) => {
  const taskId =
    typeof file?.taskId === "string" && file.taskId.trim()
      ? file.taskId.trim()
      : "";
  if (taskId && taskMap?.has(taskId)) {
    return taskMap.get(taskId).title;
  }
  const fallback =
    typeof file?.taskTitle === "string" ? file.taskTitle.trim() : "";
  return fallback || "";
};

const getPinSurfaceLabel = (pin) => {
  if (!pin?.surface) return "";
  return IMAGE_PIN_SURFACE_LABELS[pin.surface] || "Wand";
};

const buildEvidenceCard = (
  file,
  { roomId = state.activeRoomId, taskMap = null, showTaskTag = false } = {},
) => {
  const card = document.createElement("div");
  card.className = "image-card";

  const label = file.label || file.name || "Datei";
  const isImage = Boolean(file.url && isEvidenceImage(file));
  const resolvedRoomId =
    typeof file.roomId === "string" && file.roomId.trim()
      ? file.roomId.trim()
      : roomId;
  let previewWrapper = null;
  if (isImage) {
    previewWrapper = document.createElement("button");
    previewWrapper.type = "button";
    previewWrapper.className = "image-preview";
    previewWrapper.addEventListener("click", () =>
      openImageModal(file.id, resolvedRoomId),
    );
  } else if (file.url) {
    previewWrapper = document.createElement("a");
    previewWrapper.href = file.url;
    previewWrapper.rel = "noreferrer";
    previewWrapper.className = "evidence-link";
  } else {
    previewWrapper = document.createElement("div");
  }

  if (isImage) {
    const img = document.createElement("img");
    img.src = file.url;
    img.alt = label;
    previewWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "evidence-placeholder";
    placeholder.textContent =
      String(file.type || "File")
        .split("/")
        .pop()
        ?.toUpperCase() || "FILE";
    previewWrapper.appendChild(placeholder);
  }
  card.appendChild(previewWrapper);

  const meta = document.createElement("div");
  meta.className = "evidence-meta";
  const caption = document.createElement("div");
  caption.textContent = label;
  meta.appendChild(caption);
  const detailsText = formatEvidenceDetails(file);
  if (detailsText) {
    const details = document.createElement("div");
    details.className = "evidence-details";
    details.textContent = detailsText;
    meta.appendChild(details);
  }
  if (showTaskTag) {
    const taskLabel = getEvidenceTaskLabel(file, taskMap);
    if (taskLabel) {
      const taskTag = document.createElement("div");
      taskTag.className = "evidence-task";
      taskTag.textContent = `Aufgabe: ${taskLabel}`;
      meta.appendChild(taskTag);
    }
  }
  const pinLabel = getPinSurfaceLabel(file.pin);
  if (pinLabel) {
    const pin = document.createElement("div");
    pin.className = "image-pin-chip";
    pin.textContent = `📌 ${pinLabel}`;
    meta.appendChild(pin);
  }
  card.appendChild(meta);

  const actions = document.createElement("div");
  actions.className = "image-actions";
  if (isImage) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.textContent = "Bearbeiten";
    editButton.addEventListener("click", () =>
      openImageModal(file.id, resolvedRoomId),
    );
    actions.appendChild(editButton);

    const pinButton = document.createElement("button");
    pinButton.type = "button";
    pinButton.textContent = file.pin ? "Pin ändern" : "Pin setzen";
    pinButton.addEventListener("click", () =>
      openImageModal(file.id, resolvedRoomId),
    );
    actions.appendChild(pinButton);
  }

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "Löschen";
  deleteButton.className = "image-delete";
  deleteButton.addEventListener("click", () =>
    removeImage(file.id, resolvedRoomId),
  );
  actions.appendChild(deleteButton);
  card.appendChild(actions);

  return card;
};

const renderImages = (roomData) => {
  elements.imageGallery.innerHTML = "";
  const taskMap = buildTaskMap();
  roomData.images.forEach((file) => {
    elements.imageGallery.appendChild(
      buildEvidenceCard(file, {
        roomId: state.activeRoomId,
        taskMap,
        showTaskTag: true,
      }),
    );
  });
};

const renderDecisions = (roomData) => {
  if (!elements.decisionList) return;
  elements.decisionList.innerHTML = "";
  const decisions = Array.isArray(roomData.decisions) ? roomData.decisions : [];
  if (!decisions.length) {
    const empty = document.createElement("li");
    empty.className = "decision-card decision-empty";
    empty.textContent = "Noch keine Entscheidungen für diesen Raum.";
    elements.decisionList.appendChild(empty);
    return;
  }

  const taskMap = buildTaskMap();
  decisions.forEach((decision) => {
    const item = document.createElement("li");
    item.className = "decision-card";

    const title = document.createElement("div");
    title.className = "decision-title";
    title.textContent = decision.title || decision.text || "Entscheidung";
    item.appendChild(title);

    const bodyText = decision.body || decision.text || "";
    if (bodyText) {
      const body = document.createElement("div");
      body.className = "decision-body";
      body.textContent = bodyText;
      item.appendChild(body);
    }

    const meta = document.createElement("div");
    meta.className = "decision-meta";
    const actor =
      decision.actor || decision.userName || decision.userEmail || "Unbekannt";
    const time = formatActivityTimestamp(decision.createdAt);
    meta.appendChild(
      createUserSpan({
        label: actor,
        id: decision.userId,
        email: decision.userEmail,
      }),
    );
    if (time) {
      const separator = document.createElement("span");
      separator.textContent = " · ";
      const timeLabel = document.createElement("span");
      timeLabel.textContent = time;
      meta.appendChild(separator);
      meta.appendChild(timeLabel);
    }
    item.appendChild(meta);

    const taskIds = Array.isArray(decision.taskIds) ? decision.taskIds : [];
    const taskLinks = Array.isArray(decision.taskLinks)
      ? decision.taskLinks
      : [];
    if (taskIds.length || taskLinks.length) {
      const tags = document.createElement("div");
      tags.className = "decision-tags";
      taskIds
        .map((taskId) => taskMap.get(taskId))
        .filter(Boolean)
        .forEach((task) => {
          const tag = document.createElement("span");
          tag.className = "decision-tag";
          tag.textContent = task.title;
          tags.appendChild(tag);
        });
      if (!tags.childNodes.length && taskLinks.length) {
        taskLinks.forEach((task) => {
          const tag = document.createElement("span");
          tag.className = "decision-tag";
          tag.textContent = task;
          tags.appendChild(tag);
        });
      }
      if (tags.childNodes.length) {
        item.appendChild(tags);
      }
    }

    elements.decisionList.appendChild(item);
  });
};

const renderDecisionTaskOptions = () => {
  if (!elements.decisionTasks) return;
  if (!state.activeRoomId) {
    elements.decisionTasks.innerHTML = "";
    if (elements.decisionTasksEmpty) {
      elements.decisionTasksEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.decisionTasksEmpty.hidden = false;
    }
    return;
  }
  const selected = new Set(
    Array.from(
      elements.decisionTasks.querySelectorAll("input[type='checkbox']:checked"),
    ).map((input) => input.value),
  );
  elements.decisionTasks.innerHTML = "";

  if (!state.activeRoomId) {
    if (elements.decisionTasksEmpty) {
      elements.decisionTasksEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.decisionTasksEmpty.hidden = false;
    }
    return;
  }

  const tasks = state.tasks.filter(
    (task) => task.roomId === state.activeRoomId,
  );
  if (!tasks.length) {
    if (elements.decisionTasksEmpty) {
      elements.decisionTasksEmpty.textContent =
        "Keine Aufgaben zum Verknüpfen.";
      elements.decisionTasksEmpty.hidden = false;
    }
    return;
  }

  if (elements.decisionTasksEmpty) {
    elements.decisionTasksEmpty.hidden = true;
  }

  tasks.forEach((task) => {
    const label = document.createElement("label");
    label.className = "decision-task-item";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = task.id;
    checkbox.checked = selected.has(task.id);
    const text = document.createElement("span");
    text.textContent = task.title;
    label.appendChild(checkbox);
    label.appendChild(text);
    elements.decisionTasks.appendChild(label);
  });
};

const truncateText = (value, max = 90) => {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 3))}...`;
};

const USER_COLOR_PALETTE = [
  "#0ea5e9",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ec4899",
  "#14b8a6",
  "#eab308",
  "#6366f1",
];

const userColorCache = new Map();

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const normalizeUserToken = (value) =>
  typeof value === "string" ? value.trim() : "";

const getUserColorKey = ({ id, email, name } = {}) =>
  normalizeUserToken(email) ||
  normalizeUserToken(id) ||
  normalizeUserToken(name) ||
  "";

const isCurrentUser = ({ id, email, name } = {}) => {
  const currentId = authState.user?.id;
  const currentEmail = authState.user?.email;
  const currentName = authState.displayName;
  return Boolean(
    (id && currentId && id === currentId) ||
    (email && currentEmail && email === currentEmail) ||
    (name && currentName && name === currentName),
  );
};

const getUserColor = ({ id, email, name } = {}) => {
  const key = getUserColorKey({ id, email, name });
  if (!key) return USER_COLOR_PALETTE[0];
  if (isCurrentUser({ id, email, name })) {
    return USER_COLOR_PALETTE[0];
  }
  if (userColorCache.has(key)) {
    return userColorCache.get(key);
  }
  const palette =
    USER_COLOR_PALETTE.length > 1
      ? USER_COLOR_PALETTE.slice(1)
      : USER_COLOR_PALETTE;
  const color =
    palette[hashString(key) % palette.length] || USER_COLOR_PALETTE[0];
  userColorCache.set(key, color);
  return color;
};

const applyUserColor = (element, { id, email, name } = {}) => {
  if (!element) return;
  const color = getUserColor({ id, email, name });
  element.style.setProperty("--user-color", color);
};

const createUserSpan = ({ label, id, email } = {}) => {
  const span = document.createElement("span");
  span.className = "user-name";
  span.textContent = label || "Unbekannt";
  applyUserColor(span, { id, email, name: label });
  return span;
};

const appendActivityMessage = (container, parts) => {
  if (!container) return;
  container.textContent = "";
  parts.forEach((part) => {
    if (!part) return;
    if (part.type === "user") {
      container.appendChild(
        createUserSpan({
          label: part.label,
          id: part.id || null,
          email: part.email || null,
        }),
      );
      return;
    }
    const span = document.createElement("span");
    span.className =
      part.type === "detail" ? "activity-detail" : "activity-verb";
    span.textContent = part.text || "";
    container.appendChild(span);
  });
};

const resolveActivityDetail = (value, fallback, truncateDetail) => {
  const raw = String(value ?? fallback ?? "").trim();
  if (!raw) return fallback || "";
  return truncateDetail ? truncateText(raw, 90) : raw;
};

const buildActivityMessageParts = (event, { truncateDetail = true } = {}) => {
  const actor = event.actor || "Jemand";
  const actorId = event.actorId || null;
  const actorEmail = event.actorEmail || null;
  const metadata = event.metadata || {};
  const parts = [
    {
      type: "user",
      label: actor,
      id: actorId,
      email: actorEmail,
    },
  ];

  switch (event.type) {
    case "task_created": {
      const title = resolveActivityDetail(
        metadata.title || metadata.text,
        "Aufgabe",
        truncateDetail,
      );
      parts.push(
        { type: "text", text: " hat eine Aufgabe erstellt: " },
        { type: "detail", text: title },
      );
      return parts;
    }
    case "task_updated": {
      const title = resolveActivityDetail(
        metadata.title || metadata.text,
        "Aufgabe",
        truncateDetail,
      );
      parts.push(
        { type: "text", text: " hat eine Aufgabe aktualisiert: " },
        { type: "detail", text: title },
      );
      return parts;
    }
    case "task_status_changed": {
      const fromStatus = formatTaskStatus(metadata.fromStatus);
      const toStatus = formatTaskStatus(metadata.toStatus);
      const title = resolveActivityDetail(
        metadata.title || metadata.text,
        "Aufgabe",
        truncateDetail,
      );
      parts.push(
        {
          type: "text",
          text: ` hat den Status geändert (${fromStatus} -> ${toStatus}): `,
        },
        { type: "detail", text: title },
      );
      return parts;
    }
    case "task_assigned": {
      const title = resolveActivityDetail(
        metadata.title || metadata.text,
        "Aufgabe",
        truncateDetail,
      );
      const assignee = metadata.assignee;
      if (assignee) {
        parts.push(
          { type: "text", text: " hat " },
          { type: "detail", text: title },
          { type: "text", text: " an " },
          {
            type: "user",
            label: formatAssigneeLabel(assignee),
            id: assignee,
          },
          { type: "text", text: " zugewiesen." },
        );
        return parts;
      }
      parts.push(
        { type: "text", text: " hat die Zuweisung entfernt: " },
        { type: "detail", text: title },
      );
      return parts;
    }
    case "comment_added": {
      const text = resolveActivityDetail(
        metadata.text,
        "Kommentar",
        truncateDetail,
      );
      parts.push(
        { type: "text", text: " hat einen Kommentar hinzugefügt: " },
        { type: "detail", text },
      );
      return parts;
    }
    case "file_uploaded": {
      const label = resolveActivityDetail(
        metadata.filename || metadata.label,
        "Datei",
        truncateDetail,
      );
      parts.push(
        { type: "text", text: " hat eine Datei hochgeladen: " },
        { type: "detail", text: label },
      );
      return parts;
    }
    case "decision_created": {
      const text = resolveActivityDetail(
        metadata.title || metadata.text,
        "Entscheidung",
        truncateDetail,
      );
      parts.push(
        { type: "text", text: " hat eine Entscheidung festgehalten: " },
        { type: "detail", text },
      );
      return parts;
    }
    default:
      parts.push({ type: "text", text: " hat ein Update erfasst." });
      return parts;
  }
};

const formatTaskStatus = (status) => {
  const normalized = normalizeTaskStatus(status);
  return TASK_STATUS_LABELS[normalized] || "Offen";
};

const ACTIVITY_CATEGORY_BY_TYPE = {
  task_created: "task",
  task_updated: "task",
  task_status_changed: "task",
  task_assigned: "task",
  comment_added: "comment",
  file_uploaded: "file",
  decision_created: "decision",
};

const ACTIVITY_LABELS = {
  task: "Aufgabe",
  comment: "Kommentar",
  file: "Datei",
  decision: "Entscheidung",
  activity: "Aktivität",
};

const getActivityCategory = (type) =>
  ACTIVITY_CATEGORY_BY_TYPE[type] || "activity";

const getActivityLabel = (category) =>
  ACTIVITY_LABELS[category] || ACTIVITY_LABELS.activity;

const formatActivityTimestamp = (value) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const getActivityRoomLabel = (roomId) => {
  if (!roomId) return "Allgemein";
  const room = findRoomById(roomId);
  return room ? room.name : "Unbekannter Raum";
};

const parseTimestamp = (value) => {
  if (value === null || value === undefined) return 0;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getActivityEventTimestamp = (event) => parseTimestamp(event?.createdAt);

const getLatestActivityTimestamp = (events) => {
  let latest = 0;
  (Array.isArray(events) ? events : []).forEach((event) => {
    const timestamp = getActivityEventTimestamp(event);
    if (timestamp > latest) latest = timestamp;
  });
  return latest;
};

const getActivityNotificationUserKey = () => {
  if (authState.user?.id) return `user:${authState.user.id}`;
  if (authState.user?.email) return `email:${authState.user.email}`;
  if (authState.displayName) return `name:${authState.displayName}`;
  return "anonymous";
};

const getActivityNotificationStorageKey = () =>
  `${ACTIVITY_NOTIFICATION_STORAGE_KEY}:${getActivityNotificationUserKey()}`;

const resetActivityNotificationState = () => {
  if (activityNotificationState.clearTimer) {
    window.clearTimeout(activityNotificationState.clearTimer);
  }
  activityNotificationState.clearTimer = null;
  activityNotificationState.pendingViewedAt = null;
  activityNotificationState.lastViewedAt = null;
  activityNotificationState.newEventIds = new Set();
  activityNotificationState.userKey = "";
  if (elements.activityNotification) {
    elements.activityNotification.hidden = true;
  }
  if (elements.activityNotificationCount) {
    elements.activityNotificationCount.textContent = "0";
  }
};

const ensureActivityNotificationState = () => {
  if (!authState.user) return false;
  const userKey = getActivityNotificationUserKey();
  if (activityNotificationState.userKey !== userKey) {
    if (activityNotificationState.clearTimer) {
      window.clearTimeout(activityNotificationState.clearTimer);
    }
    activityNotificationState.clearTimer = null;
    activityNotificationState.pendingViewedAt = null;
    activityNotificationState.lastViewedAt = null;
    activityNotificationState.userKey = userKey;
  }
  if (activityNotificationState.lastViewedAt === null) {
    const stored = parseTimestamp(
      localStorage.getItem(getActivityNotificationStorageKey()),
    );
    if (stored) {
      activityNotificationState.lastViewedAt = stored;
      return true;
    }
    const baseline = Date.now();
    activityNotificationState.lastViewedAt = baseline;
    localStorage.setItem(getActivityNotificationStorageKey(), String(baseline));
  }
  return true;
};

const isActivityEventFromCurrentUser = (event) =>
  isCurrentUser({
    id: event?.actorId || null,
    email: event?.actorEmail || null,
    name: event?.actor || "",
  });

const getNewActivityEvents = () => {
  if (!ensureActivityNotificationState()) return [];
  const events = Array.isArray(state.activityEvents)
    ? state.activityEvents
    : [];
  const lastViewedAt = activityNotificationState.lastViewedAt || 0;
  return events.filter((event) => {
    if (!event) return false;
    if (isActivityEventFromCurrentUser(event)) return false;
    const timestamp = getActivityEventTimestamp(event);
    if (!timestamp) return false;
    return timestamp > lastViewedAt;
  });
};

const updateActivityNotificationBadge = (count) => {
  if (!elements.activityNotification || !elements.activityNotificationCount) {
    return;
  }
  if (!count) {
    elements.activityNotification.hidden = true;
    elements.activityNotificationCount.textContent = "0";
    return;
  }
  elements.activityNotification.hidden = false;
  elements.activityNotificationCount.textContent = String(count);
  const label = `${count} neue Aktivität${count === 1 ? "" : "en"} anzeigen`;
  elements.activityNotification.setAttribute("aria-label", label);
  elements.activityNotification.title = label;
};

const syncActivityNotifications = () => {
  if (!authState.user) {
    activityNotificationState.newEventIds = new Set();
    updateActivityNotificationBadge(0);
    return activityNotificationState.newEventIds;
  }
  const newEvents = getNewActivityEvents();
  activityNotificationState.newEventIds = new Set(
    newEvents.map((event) => event.id),
  );
  updateActivityNotificationBadge(newEvents.length);
  return activityNotificationState.newEventIds;
};

const scrollToActivityFeed = () => {
  const target = elements.activityPage || elements.activityFeed;
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
};

const scheduleActivityNotificationClear = (viewedAt) => {
  if (!viewedAt) return;
  if (activityNotificationState.clearTimer) {
    window.clearTimeout(activityNotificationState.clearTimer);
  }
  activityNotificationState.pendingViewedAt = viewedAt;
  activityNotificationState.clearTimer = window.setTimeout(() => {
    const timestamp = activityNotificationState.pendingViewedAt;
    if (timestamp) {
      activityNotificationState.lastViewedAt = timestamp;
      localStorage.setItem(
        getActivityNotificationStorageKey(),
        String(timestamp),
      );
    }
    activityNotificationState.pendingViewedAt = null;
    activityNotificationState.clearTimer = null;
    renderActivityFeed();
    renderRoomActivity();
  }, ACTIVITY_NOTIFICATION_CLEAR_DELAY_MS);
};

const handleActivityNotificationClick = () => {
  scrollToActivityFeed();
  const newEvents = getNewActivityEvents();
  if (!newEvents.length) return;
  const latest = getLatestActivityTimestamp(newEvents);
  if (!latest) return;
  scheduleActivityNotificationClear(latest);
};

const buildActivityItem = (event, { showRoom = true, isNew = false } = {}) => {
  const item = document.createElement("li");
  item.className = "activity-item";
  if (isNew) {
    item.classList.add("is-new");
  }
  const category = getActivityCategory(event.type);
  item.dataset.category = category;

  const main = document.createElement("div");
  main.className = "activity-main";
  const chip = document.createElement("span");
  chip.className = "activity-chip";
  chip.textContent = getActivityLabel(category);
  const summary = document.createElement("span");
  summary.className = "activity-summary";
  appendActivityMessage(summary, buildActivityMessageParts(event));
  main.appendChild(chip);
  main.appendChild(summary);
  item.appendChild(main);

  const meta = document.createElement("div");
  meta.className = "activity-meta";
  if (showRoom) {
    const room = document.createElement("span");
    room.className = "activity-room";
    room.textContent = getActivityRoomLabel(event.roomId);
    meta.appendChild(room);
  }
  const time = document.createElement("span");
  time.className = "activity-time";
  time.textContent = formatActivityTimestamp(event.createdAt);
  meta.appendChild(time);
  item.appendChild(meta);
  return item;
};

const getSortedActivityEvents = () =>
  (Array.isArray(state.activityEvents) ? state.activityEvents : [])
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

const renderActivityFeed = () => {
  if (!elements.activityFeed) return;
  const newEventIds = syncActivityNotifications();
  elements.activityFeed.innerHTML = "";
  const events = getSortedActivityEvents().slice(0, ACTIVITY_FEED_LIMIT);
  if (!events.length) {
    if (elements.activityEmpty) {
      elements.activityEmpty.hidden = false;
    }
    return;
  }
  if (elements.activityEmpty) {
    elements.activityEmpty.hidden = true;
  }
  events.forEach((event) => {
    const isNew = newEventIds.has(event.id);
    elements.activityFeed.appendChild(buildActivityItem(event, { isNew }));
  });
};

const renderRoomActivity = () => {
  if (!elements.roomActivity) return;
  const newEventIds = syncActivityNotifications();
  elements.roomActivity.innerHTML = "";
  if (!state.activeRoomId) {
    if (elements.roomActivityEmpty) {
      elements.roomActivityEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.roomActivityEmpty.hidden = false;
    }
    return;
  }

  const events = getSortedActivityEvents()
    .filter((event) => event.roomId === state.activeRoomId)
    .slice(0, ROOM_ACTIVITY_LIMIT);
  if (!events.length) {
    if (elements.roomActivityEmpty) {
      elements.roomActivityEmpty.textContent =
        "Noch keine Aktivität in diesem Raum.";
      elements.roomActivityEmpty.hidden = false;
    }
    return;
  }

  if (elements.roomActivityEmpty) {
    elements.roomActivityEmpty.hidden = true;
  }
  events.forEach((event) => {
    const isNew = newEventIds.has(event.id);
    elements.roomActivity.appendChild(
      buildActivityItem(event, { showRoom: false, isNew }),
    );
  });
};

const getRoomHintLabel = (roomId) => {
  if (!roomId) return "";
  const normalized = roomId.toLowerCase();
  if (normalized.includes("left")) return "links";
  if (normalized.includes("right")) return "rechts";
  return "";
};

const getRoomSelectLabel = (room, floor) => {
  const base = room?.name ? room.name : "Raum";
  const hint = getRoomHintLabel(room?.id);
  if (hint) return `${base} (${hint})`;
  const rooms = floor?.rooms || [];
  const duplicates = rooms.filter((item) => item.name === room?.name);
  if (duplicates.length > 1) {
    const index = duplicates.findIndex((item) => item.id === room?.id) + 1;
    if (index > 0) {
      return `${base} ${index}`;
    }
  }
  return base;
};

const getFloorIdForRoom = (roomId) => {
  if (!roomId) return null;
  for (const [floorId, floor] of Object.entries(state.floorPlans)) {
    if (floor.rooms.some((room) => room.id === roomId)) {
      return floorId;
    }
  }
  return null;
};

const renderMobileRoomSelect = () => {
  if (!elements.mobileRoomSelect) return;
  const select = elements.mobileRoomSelect;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Raum auswählen";
  select.appendChild(placeholder);

  const roomValues = new Set();
  Object.values(state.floorPlans).forEach((floor) => {
    const group = document.createElement("optgroup");
    group.label = floor.name || "Etage";
    floor.rooms.forEach((room) => {
      const option = document.createElement("option");
      option.value = room.id;
      option.textContent = getRoomSelectLabel(room, floor);
      group.appendChild(option);
      roomValues.add(room.id);
    });
    select.appendChild(group);
  });

  const nextValue = roomValues.has(state.activeRoomId)
    ? state.activeRoomId
    : "";
  select.value = nextValue;
};

const getRoomLabel = (roomId) => {
  if (!roomId) return "Ohne Raum";
  let info = null;
  Object.values(state.floorPlans).some((floor) => {
    const room = floor.rooms.find((item) => item.id === roomId);
    if (!room) return false;
    info = { room, floor };
    return true;
  });
  if (!info) return "Unbekannter Raum";
  const floorLabel = info.floor?.name ? ` (${info.floor.name})` : "";
  return `${info.room.name}${floorLabel}`;
};

const formatAssigneeLabel = (assignee) => {
  if (!assignee) return "Unzugewiesen";
  if (authState.user?.id && assignee === authState.user.id) {
    return authState.displayName ? `Ich (${authState.displayName})` : "Ich";
  }
  if (assignee === "me") return "Ich";
  if (assignee === "dad") return "Dad";
  return assignee;
};

const buildAssigneeOptions = () => {
  const options = new Map();
  options.set("", "Unzugewiesen");
  if (authState.user?.id) {
    options.set(
      authState.user.id,
      authState.displayName ? `Ich (${authState.displayName})` : "Ich (Login)",
    );
  }
  options.set("me", "Ich (me)");
  options.set("dad", "Dad");
  state.tasks.forEach((task) => {
    if (!task.assignee) return;
    options.set(task.assignee, formatAssigneeLabel(task.assignee));
  });
  return Array.from(options, ([value, label]) => ({ value, label }));
};

const setSelectOptions = (select, options, selectedValue) => {
  if (!select) return selectedValue;
  select.innerHTML = "";
  options.forEach((option) => {
    const entry = document.createElement("option");
    entry.value = option.value;
    entry.textContent = option.label;
    select.appendChild(entry);
  });
  const values = options.map((option) => option.value);
  const nextValue = values.includes(selectedValue)
    ? selectedValue
    : options[0]?.value;
  if (nextValue !== undefined) {
    select.value = nextValue;
  }
  return nextValue;
};

const buildRoomFilterOptions = () => {
  const options = [
    { value: "all", label: "Alle Räume" },
    { value: "none", label: "Ohne Raum" },
  ];
  Object.values(state.floorPlans).forEach((floor) => {
    floor.rooms.forEach((room) => {
      options.push({
        value: room.id,
        label: `${room.name} (${floor.name})`,
      });
    });
  });
  return options;
};

const buildTaskCreateRoomOptions = () =>
  buildRoomFilterOptions().filter((option) => option.value !== "all");

const buildEvidenceRoomOptions = () => {
  const options = [{ value: EVIDENCE_ROOM_ACTIVE, label: "Aktiver Raum" }];
  buildRoomFilterOptions()
    .filter((option) => option.value !== "all" && option.value !== "none")
    .forEach((option) => {
      options.push(option);
    });
  return options;
};

const resolveEvidenceRoomSelection = (value) => {
  if (!value || value === EVIDENCE_ROOM_ACTIVE) {
    return state.activeRoomId;
  }
  if (value === EVIDENCE_ROOM_NONE) return null;
  return value;
};

const buildEvidenceTaskOptions = (roomId) => {
  const options = [{ value: EVIDENCE_TASK_NONE, label: "Keine Aufgabe" }];
  if (!roomId) return options;
  state.tasks.forEach((task) => {
    if (task.roomId !== roomId) return;
    options.push({ value: task.id, label: task.title });
  });
  return options;
};

const renderEvidenceUploadTargets = () => {
  if (!elements.evidenceRoomSelect || !elements.evidenceTaskSelect) return;
  const currentRoomValue =
    elements.evidenceRoomSelect.value || EVIDENCE_ROOM_ACTIVE;
  const roomValue = setSelectOptions(
    elements.evidenceRoomSelect,
    buildEvidenceRoomOptions(),
    currentRoomValue,
  );
  const resolvedRoomId = resolveEvidenceRoomSelection(roomValue);
  const currentTaskValue =
    elements.evidenceTaskSelect.value || EVIDENCE_TASK_NONE;
  const taskOptions = buildEvidenceTaskOptions(resolvedRoomId);
  setSelectOptions(elements.evidenceTaskSelect, taskOptions, currentTaskValue);
  elements.evidenceTaskSelect.disabled = taskOptions.length <= 1;
  return resolvedRoomId;
};

const resolveEvidenceUploadTarget = () => {
  const roomValue = elements.evidenceRoomSelect?.value || EVIDENCE_ROOM_ACTIVE;
  const resolvedRoomId = resolveEvidenceRoomSelection(roomValue);
  const taskValue = elements.evidenceTaskSelect?.value || EVIDENCE_TASK_NONE;
  const task =
    taskValue && taskValue !== EVIDENCE_TASK_NONE
      ? state.tasks.find((item) => item.id === taskValue)
      : null;
  const roomId = task?.roomId || resolvedRoomId || state.activeRoomId;
  if (!roomId) {
    window.alert(
      "Bitte einen Raum oder eine Aufgabe mit Raum auswählen, bevor Sie eine Datei hinzufügen.",
    );
    return null;
  }
  return {
    roomId,
    taskId: task?.id || null,
    taskTitle: task?.title || "",
  };
};

const buildStatusFilterOptions = () => [
  { value: "all", label: "Alle Stati" },
  ...TASK_STATUSES.map((status) => ({
    value: status,
    label: TASK_STATUS_LABELS[status] || status,
  })),
];

const buildTagFilterOptions = () => {
  const tags = new Set();
  state.tasks.forEach((task) => {
    (task.tags || []).forEach((tag) => tags.add(tag));
  });
  const options = [{ value: "all", label: "Alle Tags" }];
  Array.from(tags)
    .sort((a, b) => a.localeCompare(b))
    .forEach((tag) => {
      options.push({ value: tag, label: `#${tag}` });
    });
  return options;
};

const buildAssigneeFilterOptions = () => {
  const options = new Map();
  options.set("all", "Alle Zuständigen");
  options.set("unassigned", "Unzugewiesen");
  state.tasks.forEach((task) => {
    if (!task.assignee) return;
    options.set(task.assignee, formatAssigneeLabel(task.assignee));
  });
  return Array.from(options, ([value, label]) => ({ value, label }));
};

const buildBulkAssigneeOptions = () => [
  { value: "", label: "Zuweisen..." },
  ...buildAssigneeOptions().filter((option) => option.value),
];

const renderTaskBulkAssigneeOptions = () => {
  if (!elements.taskBulkAssignee) return;
  const currentValue = elements.taskBulkAssignee.value;
  setSelectOptions(
    elements.taskBulkAssignee,
    buildBulkAssigneeOptions(),
    currentValue,
  );
};

const updateTaskTagFilterVisibility = () => {
  const tagField = elements.taskFilterTag?.closest("label");
  if (!tagField) return;
  const isAllView = state.taskFilters.view === "all";
  tagField.hidden = !isAllView;
  if (elements.taskFilterTag) {
    elements.taskFilterTag.disabled = !isAllView;
  }
};

const renderTaskFilters = () => {
  state.taskFilters.view = TASK_VIEW_PRESETS[state.taskFilters.view]
    ? state.taskFilters.view
    : "all";
  state.taskFilters.roomId = setSelectOptions(
    elements.taskFilterRoom,
    buildRoomFilterOptions(),
    state.taskFilters.roomId,
  );
  state.taskFilters.status = setSelectOptions(
    elements.taskFilterStatus,
    buildStatusFilterOptions(),
    state.taskFilters.status,
  );
  state.taskFilters.assignee = setSelectOptions(
    elements.taskFilterAssignee,
    buildAssigneeFilterOptions(),
    state.taskFilters.assignee,
  );
  state.taskFilters.tag = setSelectOptions(
    elements.taskFilterTag,
    buildTagFilterOptions(),
    state.taskFilters.tag,
  );
  if (elements.taskFilterSearch) {
    elements.taskFilterSearch.value = state.taskFilters.query;
  }
  updateTaskTagFilterVisibility();
};

const renderTaskCreateForm = () => {
  if (!elements.taskCreateRoom) return;
  const currentValue = elements.taskCreateRoom.value;
  const preferredValue =
    currentValue ||
    (state.taskFilters.roomId && state.taskFilters.roomId !== "all"
      ? state.taskFilters.roomId
      : state.activeRoomId || "none");
  setSelectOptions(
    elements.taskCreateRoom,
    buildTaskCreateRoomOptions(),
    preferredValue,
  );
};

const applyTaskFilters = (tasks) => {
  const { view, roomId, status, assignee, tag, query } = state.taskFilters;
  const search = query.trim().toLowerCase();
  const preset = TASK_VIEW_PRESETS[view] || TASK_VIEW_PRESETS.all;
  return tasks.filter((task) => {
    const normalizedStatus = normalizeTaskStatus(task.status);
    if (preset?.filter && !preset.filter(task)) return false;
    if (roomId !== "all") {
      if (roomId === "none") {
        if (task.roomId) return false;
      } else if (task.roomId !== roomId) {
        return false;
      }
    }
    if (status !== "all" && normalizedStatus !== status) return false;
    if (assignee !== "all") {
      if (assignee === "unassigned") {
        if (task.assignee) return false;
      } else if (task.assignee !== assignee) {
        return false;
      }
    }
    if (view === "all" && tag !== "all" && !task.tags?.includes(tag)) {
      return false;
    }
    if (search) {
      const haystack =
        typeof task.searchIndex === "string"
          ? task.searchIndex
          : updateTaskSearchIndex(task);
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
};

const updateTaskViewButtons = () => {
  if (!elements.taskViewButtons?.length) return;
  const activeView = TASK_VIEW_PRESETS[state.taskFilters.view]
    ? state.taskFilters.view
    : "all";
  state.taskFilters.view = activeView;
  elements.taskViewButtons.forEach((button) => {
    const view = button.dataset.taskView;
    const isActive = view === activeView;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

const clearTaskSelection = () => {
  state.selectedTaskIds.clear();
};

const pruneTaskSelection = () => {
  const validIds = new Set(state.tasks.map((task) => task.id));
  state.selectedTaskIds.forEach((id) => {
    if (!validIds.has(id)) {
      state.selectedTaskIds.delete(id);
    }
  });
};

const updateTaskSelectionState = (
  visibleTasks = applyTaskFilters(state.tasks),
) => {
  const selectedCount = state.selectedTaskIds.size;
  const hasSelection = selectedCount > 0;
  if (elements.taskSelectionCount) {
    elements.taskSelectionCount.textContent = hasSelection
      ? `${selectedCount} ausgewählt`
      : "Keine Auswahl";
  }
  if (elements.taskBulkDone) {
    elements.taskBulkDone.disabled = !hasSelection;
  }
  if (elements.taskBulkAssign) {
    const hasAssignee = Boolean(elements.taskBulkAssignee?.value?.trim());
    elements.taskBulkAssign.disabled = !hasSelection || !hasAssignee;
  }
  if (elements.taskBulkDueApply) {
    const hasDate = Boolean(elements.taskBulkDueDate?.value);
    elements.taskBulkDueApply.disabled = !hasSelection || !hasDate;
  }
  if (elements.taskSelectAll) {
    const totalVisible = visibleTasks.length;
    const selectedVisible = visibleTasks.filter((task) =>
      state.selectedTaskIds.has(task.id),
    ).length;
    elements.taskSelectAll.checked =
      totalVisible > 0 && selectedVisible === totalVisible;
    elements.taskSelectAll.indeterminate =
      selectedVisible > 0 && selectedVisible < totalVisible;
  }
};

const updateTaskStatus = (
  task,
  nextStatus,
  timestamp = new Date().toISOString(),
) => {
  const previousStatus = task.status;
  const normalized = normalizeTaskStatus(nextStatus);
  if (previousStatus === normalized) return false;
  task.status = normalized;
  task.updatedAt = timestamp;
  updateTaskSearchIndex(task);
  logActivityEvent("task_status_changed", {
    taskId: task.id,
    roomId: task.roomId,
    metadata: {
      title: task.title,
      fromStatus: previousStatus,
      toStatus: normalized,
    },
  });
  return true;
};

const buildStatusSelect = (task) => {
  const select = document.createElement("select");
  select.className = "task-select";
  select.dataset.field = "status";
  TASK_STATUSES.forEach((status) => {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = TASK_STATUS_LABELS[status] || status;
    select.appendChild(option);
  });
  select.value = normalizeTaskStatus(task.status);
  select.addEventListener("change", (event) => {
    if (!updateTaskStatus(task, event.target.value)) return;
    saveState();
    renderTasksPanel();
  });
  return select;
};

const buildAssigneeSelect = (task) => {
  const select = document.createElement("select");
  select.className = "task-select";
  select.dataset.field = "assignee";
  buildAssigneeOptions().forEach((option) => {
    const entry = document.createElement("option");
    entry.value = option.value;
    entry.textContent = option.label;
    select.appendChild(entry);
  });
  select.value = task.assignee || "";
  select.addEventListener("change", (event) => {
    const previousAssignee = task.assignee || "";
    const nextAssignee = event.target.value;
    if (previousAssignee === nextAssignee) return;
    task.assignee = nextAssignee;
    task.updatedAt = new Date().toISOString();
    updateTaskSearchIndex(task);
    logActivityEvent("task_assigned", {
      taskId: task.id,
      roomId: task.roomId,
      metadata: {
        title: task.title,
        assignee: nextAssignee || null,
        previousAssignee: previousAssignee || null,
      },
    });
    saveState();
    renderTasksPanel();
  });
  return select;
};

const logTaskUpdate = (task, metadata = {}) => {
  logActivityEvent("task_updated", {
    taskId: task.id,
    roomId: task.roomId,
    metadata: {
      title: task.title,
      ...metadata,
    },
  });
};

const buildTaskField = (labelText, input) => {
  const label = document.createElement("label");
  label.className = "task-field";
  const text = document.createElement("span");
  text.textContent = labelText;
  label.appendChild(text);
  label.appendChild(input);
  return label;
};

const buildTagInput = (task) => {
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "material, geraete, genehmigung, handwerker";
  input.className = "task-text-input";
  input.value = Array.isArray(task.tags) ? task.tags.join(", ") : "";
  input.addEventListener("change", (event) => {
    const nextTags = normalizeTaskTags(event.target.value);
    const previousTags = (task.tags || []).join(",");
    if (previousTags === nextTags.join(",")) return;
    task.tags = nextTags;
    task.updatedAt = new Date().toISOString();
    updateTaskSearchIndex(task);
    logTaskUpdate(task, { tags: nextTags });
    saveState();
    renderTasksPanel();
  });
  return buildTaskField("Tags", input);
};

const buildDueDateInput = (task) => {
  const input = document.createElement("input");
  input.type = "date";
  input.className = "task-date-input";
  input.dataset.taskDue = "true";
  input.value = task.dueDate || "";
  input.addEventListener("change", (event) => {
    const nextDueDate = event.target.value || null;
    if (task.dueDate === nextDueDate) return;
    task.dueDate = nextDueDate;
    task.updatedAt = new Date().toISOString();
    logTaskUpdate(task, { dueDate: nextDueDate });
    saveState();
    renderTasksPanel();
  });
  return buildTaskField("Fällig bis", input);
};

const buildLinkInput = (task) => {
  const input = document.createElement("input");
  input.type = "url";
  input.placeholder = "https://...";
  input.className = "task-text-input";
  input.value = task.link || "";
  input.addEventListener("input", () => {
    if (input.validationMessage) {
      input.setCustomValidity("");
    }
  });
  input.addEventListener("change", (event) => {
    const raw = String(event.target.value || "").trim();
    if (!raw) {
      if (task.link) {
        task.link = "";
        task.updatedAt = new Date().toISOString();
        updateTaskSearchIndex(task);
        logTaskUpdate(task, { link: "" });
        saveState();
        renderTasksPanel();
      }
      event.target.setCustomValidity("");
      return;
    }
    const normalized = normalizeTaskLink(raw);
    if (!normalized) {
      event.target.setCustomValidity(
        "Bitte eine gültige URL mit http:// oder https:// eingeben.",
      );
      event.target.reportValidity();
      event.target.value = task.link || "";
      return;
    }
    event.target.setCustomValidity("");
    if (task.link === normalized) return;
    task.link = normalized;
    task.updatedAt = new Date().toISOString();
    updateTaskSearchIndex(task);
    logTaskUpdate(task, { link: normalized });
    saveState();
    renderTasksPanel();
  });
  return buildTaskField("Link", input);
};

const buildMaterialsFields = (task) => {
  if (!task.materials) {
    task.materials = normalizeTaskMaterials();
  }
  const wrapper = document.createElement("div");
  wrapper.className = "task-materials";
  const title = document.createElement("span");
  title.className = "task-materials-title";
  title.textContent = "Material-Workflow";
  wrapper.appendChild(title);

  const fields = document.createElement("div");
  fields.className = "task-materials-fields";

  const orderedLabel = document.createElement("label");
  orderedLabel.className = "task-field task-field-toggle";
  const orderedInput = document.createElement("input");
  orderedInput.type = "checkbox";
  orderedInput.className = "task-toggle-input";
  orderedInput.checked = Boolean(task.materials.ordered);
  const orderedText = document.createElement("span");
  orderedText.textContent = "Bestellt";
  orderedLabel.appendChild(orderedInput);
  orderedLabel.appendChild(orderedText);
  orderedInput.addEventListener("change", (event) => {
    const nextOrdered = Boolean(event.target.checked);
    if (task.materials.ordered === nextOrdered) return;
    task.materials.ordered = nextOrdered;
    task.updatedAt = new Date().toISOString();
    logTaskUpdate(task, { materials: { ordered: nextOrdered } });
    saveState();
  });

  const deliveryInput = document.createElement("input");
  deliveryInput.type = "date";
  deliveryInput.className = "task-date-input";
  deliveryInput.value = task.materials.deliveryDate || "";
  deliveryInput.addEventListener("change", (event) => {
    const nextDate = event.target.value || null;
    if (task.materials.deliveryDate === nextDate) return;
    task.materials.deliveryDate = nextDate;
    task.updatedAt = new Date().toISOString();
    logTaskUpdate(task, { materials: { deliveryDate: nextDate } });
    saveState();
  });

  const vendorInput = document.createElement("input");
  vendorInput.type = "text";
  vendorInput.placeholder = "Lieferant";
  vendorInput.className = "task-text-input";
  vendorInput.value = task.materials.vendor || "";
  vendorInput.addEventListener("change", (event) => {
    const nextVendor = event.target.value.trim();
    if (task.materials.vendor === nextVendor) return;
    task.materials.vendor = nextVendor;
    task.updatedAt = new Date().toISOString();
    updateTaskSearchIndex(task);
    logTaskUpdate(task, { materials: { vendor: nextVendor } });
    saveState();
  });

  fields.appendChild(orderedLabel);
  fields.appendChild(buildTaskField("Lieferung", deliveryInput));
  fields.appendChild(buildTaskField("Lieferant", vendorInput));
  wrapper.appendChild(fields);
  return wrapper;
};

const buildCostFields = (task) => {
  const entries = TASK_COST_FIELDS.filter((field) =>
    taskHasAnyTag(task, field.tags),
  );
  if (!entries.length) return null;
  if (!task.costs || typeof task.costs !== "object") {
    task.costs = normalizeTaskCosts(task.costs);
  }

  const wrapper = document.createElement("div");
  wrapper.className = "task-costs";
  const title = document.createElement("span");
  title.className = "task-costs-title";
  title.textContent = "Kostenschätzung";
  wrapper.appendChild(title);

  const fields = document.createElement("div");
  fields.className = "task-costs-fields";

  entries.forEach(({ key, label }) => {
    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "decimal";
    input.placeholder = "z. B. 1200";
    input.className = "task-text-input";
    const currentValue = normalizeCostValue(task.costs?.[key]);
    input.value = currentValue !== null ? String(currentValue) : "";
    input.addEventListener("change", (event) => {
      const nextValue = normalizeCostValue(event.target.value);
      if (Object.is(task.costs[key], nextValue)) return;
      task.costs[key] = nextValue;
      task.updatedAt = new Date().toISOString();
      logTaskUpdate(task, { costs: { [key]: nextValue } });
      saveState();
    });
    fields.appendChild(buildTaskField(label, input));
  });

  wrapper.appendChild(fields);
  return wrapper;
};

const buildTaskTags = (task, taskMap) => {
  const tags = document.createElement("div");
  tags.className = "task-tags";
  let hasTag = false;

  if (isTaskDone(task)) {
    const tag = document.createElement("span");
    tag.className = "task-tag done";
    tag.textContent = "Erledigt";
    tags.appendChild(tag);
    hasTag = true;
  }

  if (isTaskBlocked(task, taskMap)) {
    const tag = document.createElement("span");
    tag.className = "task-tag blocked";
    tag.textContent = "Blockiert";
    tags.appendChild(tag);
    hasTag = true;
  }

  return hasTag ? tags : null;
};

const getTaskMetaText = (task) => {
  const parts = [];
  if (task.startDate) {
    parts.push(`Start: ${formatShortDate(task.startDate)}`);
  }
  if (task.endDate) {
    parts.push(`Ende: ${formatShortDate(task.endDate)}`);
  }
  if (!task.startDate && task.dueDate) {
    parts.push(`Fällig: ${formatShortDate(task.dueDate)}`);
  }
  if (task.assignee) {
    parts.push(`Zuständig: ${formatAssigneeLabel(task.assignee)}`);
  }
  if (Array.isArray(task.dependencyIds) && task.dependencyIds.length) {
    parts.push(`${task.dependencyIds.length} Abhängigkeit(en)`);
  }
  return parts.join(" · ");
};

const getDeliveryMetaText = (task) => {
  const parts = [];
  const deliveryDate = getTaskDeliveryDate(task);
  if (deliveryDate) {
    parts.push(`Lieferung: ${formatShortDate(deliveryDate)}`);
  }
  if (task.materials?.vendor) {
    parts.push(`Lieferant: ${task.materials.vendor}`);
  }
  return parts.join(" · ");
};

const buildBlockingRow = (task, taskMap) => {
  const blockingTasks = getBlockingTasks(task, taskMap);
  if (!blockingTasks.length) return null;
  const row = document.createElement("div");
  row.className = "task-blocked";
  const label = document.createElement("span");
  label.textContent = "Blockiert durch:";
  row.appendChild(label);
  blockingTasks.forEach((blockingTask) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "task-link";
    button.textContent = blockingTask.title;
    button.addEventListener("click", () => openTaskModal(blockingTask.id));
    row.appendChild(button);
  });
  return row;
};

const handleTaskDragStart = (event) => {
  const card = event.currentTarget?.closest?.(".task-item");
  if (!card || !event.dataTransfer) return;
  const taskId = card.dataset.taskId;
  if (!taskId) return;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", taskId);
  card.classList.add("is-dragging");
};

const handleTaskDragEnd = (event) => {
  const card = event.currentTarget?.closest?.(".task-item");
  if (card) {
    card.classList.remove("is-dragging");
  }
};

const handleKanbanDragOver = (event) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
  const column = event.currentTarget;
  column.classList.add("is-dragover");
};

const handleKanbanDragLeave = (event) => {
  const column = event.currentTarget;
  if (!column.contains(event.relatedTarget)) {
    column.classList.remove("is-dragover");
  }
};

const handleKanbanDrop = (event) => {
  event.preventDefault();
  const column = event.currentTarget;
  column.classList.remove("is-dragover");
  const taskId = event.dataTransfer?.getData("text/plain");
  const status = column.dataset.status;
  if (!taskId || !status) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (!updateTaskStatus(task, status)) return;
  saveState();
  renderTasksPanel();
};

const DAY_MS = 24 * 60 * 60 * 1000;
const GANTT_DAY_WIDTH = 34;
const GANTT_LABEL_WIDTH = 220;
const GANTT_MIN_DAYS = 21;
const GANTT_BUFFER_DAYS = 7;

const ganttState = {
  body: null,
  links: null,
  dragging: null,
  previewPath: null,
  hoverHandle: null,
  tasks: [],
  range: null,
};

let ganttLinkFrame = null;

const getUtcDayValue = (date) =>
  Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getWeekEnd = (date) => addDays(getWeekStart(date), 6);

const getDayIndex = (date, startDate) =>
  Math.round((getUtcDayValue(date) - getUtcDayValue(startDate)) / DAY_MS);

const formatShortDateFromDate = (date) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
  }).format(date);

const formatGanttRangeLabel = (start, end) => {
  if (!start || !end) return "";
  const startLabel = formatShortDateFromDate(start);
  const endLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(end);
  return `${startLabel} – ${endLabel}`;
};

const getTaskDateRange = (task) => {
  const startValue = task.startDate || task.dueDate || task.endDate;
  const endValue = task.endDate || task.dueDate || task.startDate;
  const start = parseDateInput(startValue);
  const end = parseDateInput(endValue);
  if (!start && !end) return null;
  let startDate = start || end;
  let endDate = end || start;
  if (startDate > endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  return { startDate, endDate };
};

const buildGanttRange = (ranges) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let minDate = today;
  let maxDate = today;
  ranges.forEach(({ startDate, endDate }) => {
    if (startDate < minDate) minDate = startDate;
    if (endDate > maxDate) maxDate = endDate;
  });
  const bufferedStart = addDays(minDate, -GANTT_BUFFER_DAYS);
  const bufferedEnd = addDays(maxDate, GANTT_BUFFER_DAYS);
  let rangeStart = getWeekStart(bufferedStart);
  let rangeEnd = getWeekEnd(bufferedEnd);
  let dayCount = getDayIndex(rangeEnd, rangeStart) + 1;
  if (dayCount < GANTT_MIN_DAYS) {
    rangeEnd = addDays(rangeEnd, GANTT_MIN_DAYS - dayCount);
    dayCount = GANTT_MIN_DAYS;
  }
  return { start: rangeStart, end: rangeEnd, dayCount };
};

const buildGanttHeader = (range) => {
  const row = document.createElement("div");
  row.className = "gantt-row gantt-row-header";

  const label = document.createElement("div");
  label.className = "gantt-label gantt-label-header";
  label.textContent = "Aufgabe";
  row.appendChild(label);

  const track = document.createElement("div");
  track.className = "gantt-track gantt-track-header";

  const monthRow = document.createElement("div");
  monthRow.className = "gantt-month-row";
  let cursor = new Date(range.start);
  while (cursor <= range.end) {
    const monthStart = new Date(cursor);
    const month = cursor.getMonth();
    let span = 0;
    while (cursor <= range.end && cursor.getMonth() === month) {
      span += 1;
      cursor = addDays(cursor, 1);
    }
    const cell = document.createElement("div");
    cell.className = "gantt-month-cell";
    cell.style.width = `${span * GANTT_DAY_WIDTH}px`;
    cell.textContent = formatMonthLabel(monthStart);
    monthRow.appendChild(cell);
  }

  const dayRow = document.createElement("div");
  dayRow.className = "gantt-day-row";
  for (let i = 0; i < range.dayCount; i += 1) {
    const day = addDays(range.start, i);
    const cell = document.createElement("div");
    cell.className = "gantt-day-cell";
    cell.textContent = String(day.getDate()).padStart(2, "0");
    cell.title = new Intl.DateTimeFormat("de-DE", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(day);
    if ([0, 6].includes(day.getDay())) {
      cell.classList.add("is-weekend");
    }
    dayRow.appendChild(cell);
  }

  track.appendChild(monthRow);
  track.appendChild(dayRow);
  row.appendChild(track);
  return row;
};

const buildGanttRow = (task, range, chartRange, taskMap) => {
  const row = document.createElement("div");
  row.className = "gantt-row";

  const label = document.createElement("div");
  label.className = "gantt-label";
  const labelButton = document.createElement("button");
  labelButton.type = "button";
  labelButton.className = "gantt-label-button";
  labelButton.textContent = task.title;
  labelButton.addEventListener("click", () => openTaskModal(task.id));
  label.appendChild(labelButton);

  const meta = document.createElement("div");
  meta.className = "gantt-label-meta";
  const roomLabel = getRoomLabel(task.roomId);
  const rangeLabel = `${formatShortDateFromDate(
    range.startDate,
  )} – ${formatShortDateFromDate(range.endDate)}`;
  meta.textContent = `${roomLabel} · ${rangeLabel}`;
  label.appendChild(meta);

  row.appendChild(label);

  const track = document.createElement("div");
  track.className = "gantt-track";
  track.dataset.taskId = task.id;

  const bar = document.createElement("div");
  bar.className = "gantt-bar";
  if (isTaskDone(task)) {
    bar.classList.add("is-done");
  }
  if (isTaskBlocked(task, taskMap)) {
    bar.classList.add("is-blocked");
  }

  const startIndex = getDayIndex(range.startDate, chartRange.start);
  const endIndex = getDayIndex(range.endDate, chartRange.start);
  const left = Math.max(startIndex, 0) * GANTT_DAY_WIDTH;
  const width =
    (Math.max(endIndex, startIndex) - Math.min(endIndex, startIndex) + 1) *
    GANTT_DAY_WIDTH;
  bar.style.left = `${left}px`;
  bar.style.width = `${width}px`;
  bar.dataset.taskId = task.id;
  bar.title = `${task.title} (${rangeLabel})`;

  const barLabel = document.createElement("span");
  barLabel.className = "gantt-bar-label";
  barLabel.textContent = task.title;
  bar.appendChild(barLabel);

  const handleStart = document.createElement("button");
  handleStart.type = "button";
  handleStart.className = "gantt-handle";
  handleStart.dataset.taskId = task.id;
  handleStart.dataset.handle = "start";
  handleStart.setAttribute("aria-label", "Abhängigkeit starten");
  handleStart.addEventListener("click", (event) => event.stopPropagation());

  const handleEnd = document.createElement("button");
  handleEnd.type = "button";
  handleEnd.className = "gantt-handle";
  handleEnd.dataset.taskId = task.id;
  handleEnd.dataset.handle = "end";
  handleEnd.setAttribute("aria-label", "Abhängigkeit beenden");
  handleEnd.addEventListener("click", (event) => event.stopPropagation());

  bar.appendChild(handleStart);
  bar.appendChild(handleEnd);
  bar.addEventListener("click", (event) => {
    if (event.target.closest(".gantt-handle")) return;
    openTaskModal(task.id);
  });

  track.appendChild(bar);
  row.appendChild(track);
  return row;
};

const getGanttHandlePosition = (handle, container) => {
  const handleRect = handle.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    x: handleRect.left - containerRect.left + handleRect.width / 2,
    y: handleRect.top - containerRect.top + handleRect.height / 2,
  };
};

const getGanttPointerPosition = (event, container) => {
  const containerRect = container.getBoundingClientRect();
  return {
    x: event.clientX - containerRect.left,
    y: event.clientY - containerRect.top,
  };
};

const buildGanttLinkPath = (start, end) => {
  const delta = Math.max(36, Math.abs(end.x - start.x) / 2);
  const c1x = start.x + delta;
  const c2x = end.x - delta;
  return `M ${start.x} ${start.y} C ${c1x} ${start.y} ${c2x} ${end.y} ${end.x} ${end.y}`;
};

const updateGanttLinks = () => {
  if (!ganttState.body || !ganttState.links) return;
  const { body, links, tasks } = ganttState;
  if (!Array.isArray(tasks) || !tasks.length) {
    links.innerHTML = "";
    return;
  }
  links.innerHTML = "";
  const width = Math.max(body.scrollWidth, body.clientWidth);
  const height = Math.max(body.scrollHeight, body.clientHeight);
  links.setAttribute("width", String(width));
  links.setAttribute("height", String(height));
  links.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const svgNS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(svgNS, "defs");
  const marker = document.createElementNS(svgNS, "marker");
  marker.setAttribute("id", "gantt-arrow");
  marker.setAttribute("viewBox", "0 0 10 10");
  marker.setAttribute("refX", "8");
  marker.setAttribute("refY", "5");
  marker.setAttribute("markerWidth", "6");
  marker.setAttribute("markerHeight", "6");
  marker.setAttribute("orient", "auto-start-reverse");
  const arrow = document.createElementNS(svgNS, "path");
  arrow.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
  arrow.setAttribute("fill", "#c08457");
  marker.appendChild(arrow);
  defs.appendChild(marker);
  links.appendChild(defs);

  tasks.forEach((task) => {
    if (!Array.isArray(task.dependencyIds)) return;
    task.dependencyIds.forEach((dependencyId) => {
      const fromHandle = body.querySelector(
        `.gantt-handle[data-task-id="${dependencyId}"][data-handle="end"]`,
      );
      const toHandle = body.querySelector(
        `.gantt-handle[data-task-id="${task.id}"][data-handle="start"]`,
      );
      if (!fromHandle || !toHandle) return;
      const start = getGanttHandlePosition(fromHandle, body);
      const end = getGanttHandlePosition(toHandle, body);
      const path = document.createElementNS(svgNS, "path");
      path.classList.add("gantt-link-path");
      path.setAttribute("d", buildGanttLinkPath(start, end));
      path.setAttribute("marker-end", "url(#gantt-arrow)");
      links.appendChild(path);
    });
  });
};

const scheduleGanttLinksUpdate = () => {
  if (ganttLinkFrame) return;
  ganttLinkFrame = window.requestAnimationFrame(() => {
    ganttLinkFrame = null;
    updateGanttLinks();
  });
};

const clearGanttDragState = () => {
  if (ganttState.previewPath) {
    ganttState.previewPath.remove();
    ganttState.previewPath = null;
  }
  if (ganttState.hoverHandle) {
    ganttState.hoverHandle.classList.remove("is-target");
    ganttState.hoverHandle = null;
  }
  ganttState.dragging = null;
  document.removeEventListener("pointermove", handleGanttPointerMove);
  document.removeEventListener("pointerup", handleGanttPointerUp);
  document.removeEventListener("pointercancel", handleGanttPointerUp);
};

const handleGanttPointerMove = (event) => {
  if (!ganttState.dragging || !ganttState.body || !ganttState.previewPath)
    return;
  const point = getGanttPointerPosition(event, ganttState.body);
  const nextPath = buildGanttLinkPath(ganttState.dragging.startPos, point);
  ganttState.previewPath.setAttribute("d", nextPath);

  const hovered = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest?.(".gantt-handle");
  if (hovered === ganttState.hoverHandle) return;
  if (ganttState.hoverHandle) {
    ganttState.hoverHandle.classList.remove("is-target");
  }
  if (hovered && hovered.dataset.taskId !== ganttState.dragging.sourceTaskId) {
    hovered.classList.add("is-target");
    ganttState.hoverHandle = hovered;
  } else {
    ganttState.hoverHandle = null;
  }
};

const handleGanttPointerUp = (event) => {
  if (!ganttState.dragging) {
    clearGanttDragState();
    return;
  }
  const targetHandle = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest?.(".gantt-handle");
  const sourceTaskId = ganttState.dragging.sourceTaskId;
  let didUpdate = false;

  if (
    targetHandle &&
    targetHandle.dataset.taskId &&
    targetHandle.dataset.taskId !== sourceTaskId
  ) {
    const targetTaskId = targetHandle.dataset.taskId;
    const taskMap = buildTaskMap();
    const targetTask = taskMap.get(targetTaskId);
    if (targetTask) {
      const nextDependencies = Array.isArray(targetTask.dependencyIds)
        ? [...targetTask.dependencyIds]
        : [];
      if (!nextDependencies.includes(sourceTaskId)) {
        if (wouldCreateCycle(targetTaskId, sourceTaskId, taskMap)) {
          window.alert("Diese Abhängigkeit würde einen Zyklus erzeugen.");
        } else {
          nextDependencies.push(sourceTaskId);
          targetTask.dependencyIds = nextDependencies;
          targetTask.updatedAt = new Date().toISOString();
          logTaskUpdate(targetTask, { dependencies: nextDependencies });
          saveState();
          didUpdate = true;
        }
      }
    }
  }

  clearGanttDragState();
  if (didUpdate) {
    renderTasksPanel();
  } else {
    scheduleGanttLinksUpdate();
  }
};

const handleGanttPointerDown = (event) => {
  const handle = event.target?.closest?.(".gantt-handle");
  if (!handle || !ganttState.body || !ganttState.links) return;
  const taskId = handle.dataset.taskId;
  if (!taskId) return;
  event.preventDefault();
  event.stopPropagation();

  const startPos = getGanttHandlePosition(handle, ganttState.body);
  const svgNS = "http://www.w3.org/2000/svg";
  const preview = document.createElementNS(svgNS, "path");
  preview.classList.add("gantt-link-path", "is-preview");
  preview.setAttribute("d", buildGanttLinkPath(startPos, startPos));
  ganttState.links.appendChild(preview);

  ganttState.dragging = {
    sourceTaskId: taskId,
    startPos,
  };
  ganttState.previewPath = preview;

  handle.setPointerCapture(event.pointerId);
  document.addEventListener("pointermove", handleGanttPointerMove);
  document.addEventListener("pointerup", handleGanttPointerUp, { once: true });
  document.addEventListener("pointercancel", handleGanttPointerUp, {
    once: true,
  });
};

const renderGanttCalendar = (tasks = state.tasks) => {
  if (!elements.ganttChart) return;
  clearGanttDragState();
  elements.ganttChart.innerHTML = "";
  ganttState.body = null;
  ganttState.links = null;
  ganttState.tasks = [];
  ganttState.range = null;

  if (!tasks.length) {
    const empty = document.createElement("div");
    empty.className = "gantt-empty";
    empty.textContent = "Noch keine Aufgaben für den Kalender.";
    elements.ganttChart.appendChild(empty);
    if (elements.ganttRange) {
      elements.ganttRange.textContent = "";
    }
    return;
  }

  const taskMap = buildTaskMap();
  const scheduled = [];
  const unscheduled = [];

  tasks.forEach((task) => {
    const range = getTaskDateRange(task);
    if (!range) {
      unscheduled.push(task);
    } else {
      scheduled.push({ task, range });
    }
  });

  if (!scheduled.length) {
    const empty = document.createElement("div");
    empty.className = "gantt-empty";
    empty.textContent =
      "Keine Aufgaben mit Start-/Enddatum. Bitte Aufgaben planen.";
    elements.ganttChart.appendChild(empty);
    if (elements.ganttRange) {
      elements.ganttRange.textContent = "";
    }
  } else {
    const chartRange = buildGanttRange(scheduled.map((entry) => entry.range));
    ganttState.range = chartRange;

    const scroll = document.createElement("div");
    scroll.className = "gantt-scroll";
    const frame = document.createElement("div");
    frame.className = "gantt-frame";
    frame.style.setProperty("--gantt-day-width", `${GANTT_DAY_WIDTH}px`);
    frame.style.setProperty("--gantt-label-width", `${GANTT_LABEL_WIDTH}px`);
    frame.style.setProperty(
      "--gantt-grid-width",
      `${chartRange.dayCount * GANTT_DAY_WIDTH}px`,
    );
    scroll.appendChild(frame);
    elements.ganttChart.appendChild(scroll);

    frame.appendChild(buildGanttHeader(chartRange));

    const body = document.createElement("div");
    body.className = "gantt-body";
    frame.appendChild(body);
    ganttState.body = body;

    const todayIndex = getDayIndex(new Date(), chartRange.start);
    if (todayIndex >= 0 && todayIndex < chartRange.dayCount) {
      const todayLine = document.createElement("div");
      todayLine.className = "gantt-today-line";
      todayLine.style.left = `${todayIndex * GANTT_DAY_WIDTH}px`;
      body.appendChild(todayLine);
    }

    const sorted = scheduled.slice().sort((a, b) => {
      const startDiff = a.range.startDate - b.range.startDate;
      if (startDiff !== 0) return startDiff;
      return a.range.endDate - b.range.endDate;
    });

    sorted.forEach(({ task, range }) => {
      body.appendChild(buildGanttRow(task, range, chartRange, taskMap));
    });

    const links = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    links.classList.add("gantt-links");
    body.appendChild(links);
    ganttState.links = links;
    ganttState.tasks = sorted.map((entry) => entry.task);

    if (elements.ganttRange) {
      elements.ganttRange.textContent = formatGanttRangeLabel(
        chartRange.start,
        chartRange.end,
      );
    }

    scheduleGanttLinksUpdate();
  }

  if (unscheduled.length) {
    const unscheduledPanel = document.createElement("div");
    unscheduledPanel.className = "gantt-unscheduled";
    const title = document.createElement("h4");
    title.textContent = "Ohne Termin";
    unscheduledPanel.appendChild(title);

    const list = document.createElement("ul");
    list.className = "gantt-unscheduled-list";
    unscheduled.forEach((task) => {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = task.title;
      button.addEventListener("click", () => openTaskModal(task.id));
      item.appendChild(button);
      list.appendChild(item);
    });
    unscheduledPanel.appendChild(list);
    elements.ganttChart.appendChild(unscheduledPanel);
  }
};

const buildTaskItem = (
  task,
  {
    showRoom = false,
    taskMap = null,
    showSelection = false,
    showMaterials = false,
    showCosts = false,
    showFields = false,
    enableDrag = false,
  } = {},
) => {
  const item = document.createElement("li");
  item.className = "task-item";
  item.dataset.taskId = task.id;
  if (showSelection) {
    item.dataset.taskTitle = task.title;
  }
  if (isTaskDone(task)) {
    item.classList.add("is-done");
  }

  const header = document.createElement("div");
  header.className = "task-header";
  if (enableDrag) {
    header.classList.add("task-drag-handle");
    header.draggable = true;
    header.title = "Ziehen, um den Status zu ändern";
    header.addEventListener("dragstart", handleTaskDragStart);
    header.addEventListener("dragend", handleTaskDragEnd);
  }

  const headerMain = document.createElement("div");
  headerMain.className = "task-header-main";

  if (showSelection) {
    const selection = document.createElement("label");
    selection.className = "task-select-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.taskSelect = task.id;
    checkbox.checked = state.selectedTaskIds.has(task.id);
    checkbox.addEventListener("change", (event) => {
      if (event.target.checked) {
        state.selectedTaskIds.add(task.id);
      } else {
        state.selectedTaskIds.delete(task.id);
      }
      updateTaskSelectionState();
    });
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    selection.appendChild(checkbox);
    selection.appendChild(title);
    headerMain.appendChild(selection);
  } else {
    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;
    headerMain.appendChild(title);
  }

  if (showRoom) {
    const room = document.createElement("span");
    room.className = "task-room";
    room.textContent = getRoomLabel(task.roomId);
    headerMain.appendChild(room);
  }

  header.appendChild(headerMain);

  const headerActions = document.createElement("div");
  headerActions.className = "task-header-actions";
  headerActions.appendChild(
    buildTaskPlanTrigger({
      taskId: task.id,
      label: "Planen",
    }),
  );
  header.appendChild(headerActions);

  item.appendChild(header);

  if (task.tags?.length) {
    const tags = document.createElement("div");
    tags.className = "task-tags";
    task.tags.forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.className = "task-tag";
      tagEl.textContent = `#${tag}`;
      tags.appendChild(tagEl);
    });
    item.appendChild(tags);
  }

  const statusTags = taskMap ? buildTaskTags(task, taskMap) : null;
  if (statusTags) {
    item.appendChild(statusTags);
  }

  const meta = document.createElement("div");
  meta.className = "task-meta";
  if (task.priority) {
    const priority = document.createElement("span");
    priority.textContent = `Priorität: ${
      TASK_PRIORITY_LABELS[task.priority] || task.priority
    }`;
    meta.appendChild(priority);
  }
  if (task.startDate) {
    const start = document.createElement("span");
    start.textContent = `Start: ${formatShortDate(task.startDate)}`;
    meta.appendChild(start);
  }
  if (task.endDate) {
    const end = document.createElement("span");
    end.textContent = `Ende: ${formatShortDate(task.endDate)}`;
    meta.appendChild(end);
  }
  if (task.dueDate) {
    const due = document.createElement("span");
    due.textContent = `Fällig: ${formatShortDate(task.dueDate) || task.dueDate}`;
    meta.appendChild(due);
  }
  if (task.link) {
    const link = document.createElement("a");
    link.className = "task-external-link";
    link.href = task.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Link öffnen";
    meta.appendChild(link);
  }
  if (Array.isArray(task.dependencyIds) && task.dependencyIds.length) {
    const deps = document.createElement("span");
    deps.textContent = `Abhängigkeiten: ${task.dependencyIds.length}`;
    meta.appendChild(deps);
  }
  if (meta.childNodes.length) {
    item.appendChild(meta);
  }

  const blockingRow = taskMap ? buildBlockingRow(task, taskMap) : null;
  if (blockingRow) {
    item.appendChild(blockingRow);
  }

  if (showFields) {
    const fields = document.createElement("div");
    fields.className = "task-fields";
    fields.appendChild(buildLinkInput(task));
    fields.appendChild(buildTagInput(task));
    fields.appendChild(buildDueDateInput(task));
    item.appendChild(fields);
  }

  if (showMaterials && taskHasMaterialsTag(task)) {
    item.appendChild(buildMaterialsFields(task));
  }

  if (showCosts) {
    const costFields = buildCostFields(task);
    if (costFields) {
      item.appendChild(costFields);
    }
  }

  const controls = document.createElement("div");
  controls.className = "task-controls";
  controls.appendChild(buildStatusSelect(task));
  controls.appendChild(buildAssigneeSelect(task));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.textContent = "Entfernen";
  removeButton.addEventListener("click", () => removeTask(task.id));
  controls.appendChild(removeButton);

  item.appendChild(controls);
  return item;
};

const renderRoomTasks = () => {
  if (!elements.roomTasks) return;
  elements.roomTasks.innerHTML = "";
  if (!state.activeRoomId) {
    if (elements.roomTasksEmpty) {
      elements.roomTasksEmpty.textContent =
        "Bitte zuerst einen Raum auswählen.";
      elements.roomTasksEmpty.hidden = false;
    }
    return;
  }

  const tasks = state.tasks.filter(
    (task) => task.roomId === state.activeRoomId,
  );
  if (!tasks.length) {
    if (elements.roomTasksEmpty) {
      elements.roomTasksEmpty.textContent =
        "Noch keine Aufgaben für diesen Raum.";
      elements.roomTasksEmpty.hidden = false;
    }
    return;
  }

  if (elements.roomTasksEmpty) {
    elements.roomTasksEmpty.hidden = true;
  }
  const taskMap = buildTaskMap();
  tasks.forEach((task) => {
    elements.roomTasks.appendChild(buildTaskItem(task, { taskMap }));
  });
};

const buildTaskListGroup = (status, tasks, taskMap) => {
  const group = document.createElement("section");
  group.className = "task-list-group";
  group.dataset.status = status;

  const header = document.createElement("div");
  header.className = "task-list-group-header";
  const title = document.createElement("span");
  title.textContent = TASK_STATUS_LABELS[status] || status;
  const count = document.createElement("span");
  count.className = "task-list-group-count";
  count.textContent = String(tasks.length);
  header.appendChild(title);
  header.appendChild(count);
  group.appendChild(header);

  const list = document.createElement("ul");
  list.className = "task-list";
  tasks.forEach((task) => {
    list.appendChild(buildTaskItem(task, { showRoom: true, taskMap }));
  });
  group.appendChild(list);
  return group;
};

const buildKanbanColumn = (status, tasks, taskMap) => {
  const column = document.createElement("section");
  column.className = "kanban-column";
  column.dataset.status = status;
  column.addEventListener("dragover", handleKanbanDragOver);
  column.addEventListener("dragleave", handleKanbanDragLeave);
  column.addEventListener("drop", handleKanbanDrop);

  const header = document.createElement("div");
  header.className = "kanban-column-header";
  const title = document.createElement("span");
  title.className = "kanban-column-title";
  title.textContent = TASK_STATUS_LABELS[status] || status;
  const count = document.createElement("span");
  count.className = "kanban-column-count";
  count.textContent = String(tasks.length);
  header.appendChild(title);
  header.appendChild(count);
  column.appendChild(header);

  const list = document.createElement("ul");
  list.className = "kanban-list";
  if (!tasks.length) {
    const empty = document.createElement("li");
    empty.className = "task-empty";
    empty.textContent = "Keine Aufgaben";
    list.appendChild(empty);
  } else {
    tasks.forEach((task) => {
      list.appendChild(
        buildTaskItem(task, {
          showRoom: true,
          showSelection: true,
          showFields: true,
          showMaterials: true,
          showCosts: true,
          taskMap,
          enableDrag: true,
        }),
      );
    });
  }
  column.appendChild(list);
  return column;
};

const renderTaskList = () => {
  if (!elements.taskList) return;
  renderTaskFilters();
  renderTaskCreateForm();
  updateTaskViewButtons();
  renderTaskBulkAssigneeOptions();
  elements.taskList.innerHTML = "";

  const filtered = applyTaskFilters(state.tasks);
  const taskMap = buildTaskMap();
  const isMobile = state.isMobileView;
  elements.taskList.classList.toggle("task-board", !isMobile);
  elements.taskList.classList.toggle("task-list-mobile", isMobile);
  const statusFilter = state.taskFilters.status;
  const statuses =
    statusFilter === "all"
      ? TASK_STATUSES
      : TASK_STATUSES.includes(statusFilter)
        ? [statusFilter]
        : TASK_STATUSES;
  const tasksByStatus = new Map(statuses.map((status) => [status, []]));
  filtered.forEach((task) => {
    const normalized = normalizeTaskStatus(task.status);
    if (tasksByStatus.has(normalized)) {
      tasksByStatus.get(normalized).push(task);
    }
  });
  if (isMobile) {
    statuses.forEach((status) => {
      const tasksForStatus = tasksByStatus.get(status) || [];
      if (!tasksForStatus.length) return;
      elements.taskList.appendChild(
        buildTaskListGroup(status, tasksForStatus, taskMap),
      );
    });
  } else {
    statuses.forEach((status) => {
      elements.taskList.appendChild(
        buildKanbanColumn(status, tasksByStatus.get(status) || [], taskMap),
      );
    });
  }
  updateTaskSelectionState(filtered);

  if (elements.tasksEmpty) {
    elements.tasksEmpty.textContent = state.tasks.length
      ? "Keine Aufgaben für diese Filter."
      : "Noch keine Aufgaben vorhanden.";
    elements.tasksEmpty.hidden = filtered.length > 0;
  }
  if (elements.taskCount) {
    const total = state.tasks.length;
    const filteredCount = filtered.length;
    if (filteredCount === total) {
      elements.taskCount.textContent = `${filteredCount} ${
        filteredCount === 1 ? "Aufgabe" : "Aufgaben"
      }`;
    } else {
      elements.taskCount.textContent = `${filteredCount} von ${total} ${
        total === 1 ? "Aufgabe" : "Aufgaben"
      }`;
    }
  }
  return filtered;
};

const renderTasksPanel = () => {
  closeTaskPlanMenu();
  updateViewUI();
  renderRoomTasks();
  renderDecisionTaskOptions();
  const filtered = renderTaskList();
  if (!state.isMobileView) {
    renderGanttCalendar(Array.isArray(filtered) ? filtered : state.tasks);
  } else if (elements.ganttChart) {
    elements.ganttChart.innerHTML = "";
    if (elements.ganttRange) {
      elements.ganttRange.textContent = "";
    }
  }
  renderEvidenceUploadTargets();
};

const getTaskFromModal = () => {
  const taskId = taskModalState.taskId;
  if (!taskId) return null;
  return state.tasks.find((item) => item.id === taskId) || null;
};

const collectTaskEvidenceFiles = (taskId) => {
  if (!taskId) return [];
  const entries = [];
  Object.entries(state.roomData || {}).forEach(([roomId, roomData]) => {
    if (!roomData?.images) return;
    roomData.images.forEach((file) => {
      if (file?.taskId !== taskId) return;
      entries.push({ file, roomId });
    });
  });
  return entries.sort(
    (a, b) =>
      parseTimestamp(b.file?.createdAt) - parseTimestamp(a.file?.createdAt),
  );
};

const renderTaskFiles = (task) => {
  if (!elements.taskFileList || !elements.taskFileEmpty) return;
  elements.taskFileList.innerHTML = "";
  const entries = collectTaskEvidenceFiles(task?.id);
  if (!entries.length) {
    elements.taskFileEmpty.hidden = false;
    return;
  }
  elements.taskFileEmpty.hidden = true;
  const linkEntries = entries.filter(
    ({ file }) => file?.type === "link" || file?.source === "link",
  );
  const otherEntries = entries.filter(
    ({ file }) => file?.type !== "link" && file?.source !== "link",
  );

  if (linkEntries.length) {
    const linkList = document.createElement("div");
    linkList.className = "task-file-links";
    linkEntries.forEach(({ file, roomId }) => {
      const row = document.createElement("div");
      row.className = "task-link-row";
      const label = file?.label || file?.name || file?.url || "Link";
      const resolvedRoomId =
        typeof file?.roomId === "string" && file.roomId.trim()
          ? file.roomId.trim()
          : roomId;
      if (file?.url) {
        const link = document.createElement("a");
        link.className = "task-link-title";
        link.href = file.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        row.appendChild(link);
      } else {
        const labelText = document.createElement("span");
        labelText.className = "task-link-title";
        labelText.textContent = label;
        row.appendChild(labelText);
      }

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "task-link-remove image-delete";
      deleteButton.textContent = "Löschen";
      deleteButton.addEventListener("click", () =>
        removeImage(file.id, resolvedRoomId),
      );
      row.appendChild(deleteButton);
      linkList.appendChild(row);
    });
    elements.taskFileList.appendChild(linkList);
  }

  if (otherEntries.length) {
    const gallery = document.createElement("div");
    gallery.className = "image-gallery task-file-gallery";
    otherEntries.forEach(({ file, roomId }) => {
      gallery.appendChild(
        buildEvidenceCard(file, { roomId, showTaskTag: false }),
      );
    });
    elements.taskFileList.appendChild(gallery);
  }
};

const maybeUpdateTaskModalFiles = (taskId) => {
  if (!taskId || taskModalState.taskId !== taskId) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  renderTaskFiles(task);
};

const resolveTaskEvidenceTarget = () => {
  const task = getTaskFromModal();
  if (!task) return null;
  if (!task.roomId) {
    window.alert(
      "Bitte zuerst einen Raum für diese Aufgabe auswählen, bevor Dateien hinzugefügt werden.",
    );
    return null;
  }
  return {
    task,
    roomId: task.roomId,
    taskId: task.id,
    taskTitle: task.title,
  };
};

const setEmailThreadViewVisible = (isVisible) => {
  if (!elements.emailThreadView) return;
  elements.emailThreadView.hidden = !isVisible;
};

const clearEmailThreadView = () => {
  if (elements.emailThreadMeta) {
    elements.emailThreadMeta.innerHTML = "";
  }
  if (elements.emailThreadMessages) {
    elements.emailThreadMessages.innerHTML = "";
  }
  if (elements.emailReplyText) {
    elements.emailReplyText.disabled = true;
    elements.emailReplyText.value = "";
  }
  if (elements.emailReplyTextIt) {
    elements.emailReplyTextIt.disabled = true;
    elements.emailReplyTextIt.value = "";
  }
  if (elements.emailReplyTranslation) {
    elements.emailReplyTranslation.hidden = true;
  }
  if (elements.emailReplyTranslate) {
    elements.emailReplyTranslate.disabled = true;
  }
  if (elements.emailReplySend) {
    elements.emailReplySend.disabled = true;
  }
  setEmailReplyStatus("", false);
  setEmailReplyTranslateStatus("", false);
  setEmailThreadViewVisible(false);
};

const renderEmailThreadMeta = (link) => {
  if (!elements.emailThreadMeta) return;
  elements.emailThreadMeta.innerHTML = "";
  if (!link) return;

  const subject = link.subject || "E-Mail-Thread";
  const subjectEl = document.createElement("div");
  subjectEl.textContent = subject;
  elements.emailThreadMeta.appendChild(subjectEl);

  if (link.last_snippet) {
    const snippetEl = document.createElement("div");
    snippetEl.textContent = link.last_snippet;
    elements.emailThreadMeta.appendChild(snippetEl);
  }

  const metaLine = [];
  if (link.provider) {
    metaLine.push(getProviderLabel(link.provider));
  }
  if (link.last_message_at) {
    metaLine.push(formatActivityTimestamp(link.last_message_at));
  }
  if (metaLine.length) {
    const metaEl = document.createElement("div");
    metaEl.textContent = metaLine.join(" · ");
    elements.emailThreadMeta.appendChild(metaEl);
  }
};

const handleEmailMessageTranslate = async (message) => {
  const messageCacheId = message?.messageCacheId;
  if (!messageCacheId) return;
  if (emailState.translatingMessageIds.has(messageCacheId)) return;
  const token = getAuthToken();
  if (!token) return;
  if (message?.translations?.de?.bodyText) return;
  emailState.translatingMessageIds.add(messageCacheId);
  renderEmailThreadMessages();
  try {
    const response = await fetch("/api/translate/message", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageCacheId,
        targetLang: "de",
      }),
    });
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Übersetzung konnte nicht erstellt werden.",
        ),
      );
    }
    const translation = data?.translation;
    if (translation?.bodyText) {
      message.translations = {
        ...(message.translations || {}),
        de: translation,
      };
    }
    setEmailPanelStatus("", false);
  } catch (error) {
    setEmailPanelStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "Übersetzung konnte nicht erstellt werden.",
      ),
      true,
    );
  } finally {
    emailState.translatingMessageIds.delete(messageCacheId);
    renderEmailThreadMessages();
  }
};

const renderEmailThreadMessages = () => {
  if (!elements.emailThreadMessages) return;
  elements.emailThreadMessages.innerHTML = "";
  if (!emailState.threadMessages.length) {
    const empty = document.createElement("li");
    empty.className = "helper";
    empty.textContent = "Keine Nachrichten gefunden.";
    elements.emailThreadMessages.appendChild(empty);
    return;
  }
  emailState.threadMessages.forEach((message) => {
    const item = document.createElement("li");
    item.className = "email-message";

    const header = document.createElement("div");
    header.className = "email-message-header";
    const from = document.createElement("span");
    const fromText = message?.from?.email || message?.from?.name || "Unbekannt";
    from.textContent = fromText;
    const date = document.createElement("span");
    date.textContent = message?.sentAt
      ? formatActivityTimestamp(message.sentAt)
      : "";
    header.appendChild(from);
    header.appendChild(date);
    item.appendChild(header);

    if (message.subject) {
      const subjectEl = document.createElement("div");
      subjectEl.className = "email-message-subject";
      subjectEl.textContent = message.subject;
      item.appendChild(subjectEl);
    }

    const actions = document.createElement("div");
    actions.className = "email-message-actions";
    const translateButton = document.createElement("button");
    translateButton.type = "button";
    translateButton.className = "email-message-translate";
    const translationEntry =
      message?.translations && typeof message.translations === "object"
        ? message.translations.de
        : null;
    const hasTranslation = Boolean(translationEntry?.bodyText);
    const isTranslating =
      message?.messageCacheId &&
      emailState.translatingMessageIds.has(message.messageCacheId);
    translateButton.textContent = hasTranslation
      ? "🇩🇪 Übersetzt"
      : "🇩🇪 Übersetzen";
    translateButton.disabled =
      !message?.messageCacheId || isTranslating || hasTranslation;
    translateButton.addEventListener("click", () => {
      void handleEmailMessageTranslate(message);
    });
    actions.appendChild(translateButton);
    item.appendChild(actions);

    if (hasTranslation) {
      const translation = document.createElement("div");
      translation.className = "email-message-translation";
      const translationLabel = document.createElement("div");
      translationLabel.className = "email-message-translation-label";
      translationLabel.textContent = "Übersetzung (DE)";
      const translationBody = document.createElement("div");
      translationBody.className = "email-message-body";
      translationBody.textContent = translationEntry.bodyText;
      translation.appendChild(translationLabel);
      translation.appendChild(translationBody);
      item.appendChild(translation);
    }

    const body = document.createElement("div");
    body.className = "email-message-body";
    body.textContent =
      message.bodyText ||
      stripHtml(message.bodyHtml || "") ||
      message.snippet ||
      "";
    item.appendChild(body);

    elements.emailThreadMessages.appendChild(item);
  });
};

const renderEmailThreadView = () => {
  if (!emailState.activeThread) {
    clearEmailThreadView();
    return;
  }
  renderEmailThreadMeta(emailState.activeThread);
  renderEmailThreadMessages();
  if (elements.emailReplyText) {
    elements.emailReplyText.disabled = false;
  }
  if (elements.emailReplyTextIt) {
    elements.emailReplyTextIt.disabled = false;
  }
  if (elements.emailReplyTranslate) {
    elements.emailReplyTranslate.disabled = false;
  }
  if (elements.emailReplyTranslation) {
    const hasTranslation = Boolean(elements.emailReplyTextIt?.value?.trim());
    elements.emailReplyTranslation.hidden = !hasTranslation;
  }
  if (elements.emailReplySend) {
    elements.emailReplySend.disabled = false;
  }
  setEmailThreadViewVisible(true);
};

const renderUnlinkedThreads = (task) => {
  if (!elements.emailUnlinkedThreads) return;
  elements.emailUnlinkedThreads.innerHTML = "";
  if (!authState.user) {
    const note = document.createElement("li");
    note.className = "helper";
    note.textContent = "Bitte anmelden, um E-Mails zu sehen.";
    elements.emailUnlinkedThreads.appendChild(note);
    return;
  }
  if (!emailState.unlinkedThreads.length) {
    const empty = document.createElement("li");
    empty.className = "helper";
    empty.textContent = "Keine unverknüpften Threads gefunden.";
    elements.emailUnlinkedThreads.appendChild(empty);
    return;
  }

  emailState.unlinkedThreads.forEach((thread) => {
    const item = document.createElement("li");
    item.className = "email-thread-item";

    const body = document.createElement("div");
    body.className = "email-thread-body";
    const subject = document.createElement("div");
    subject.className = "email-thread-subject";
    subject.textContent = thread.subject || "E-Mail-Thread";
    body.appendChild(subject);
    if (thread.snippet) {
      const snippet = document.createElement("div");
      snippet.className = "email-thread-snippet";
      snippet.textContent = thread.snippet;
      body.appendChild(snippet);
    }
    const metaLine = [];
    if (thread.provider) {
      metaLine.push(getProviderLabel(thread.provider));
    }
    if (thread.lastMessageAt) {
      metaLine.push(formatActivityTimestamp(thread.lastMessageAt));
    }
    if (metaLine.length) {
      const meta = document.createElement("div");
      meta.className = "email-thread-meta-line";
      meta.textContent = metaLine.join(" · ");
      body.appendChild(meta);
    }
    item.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "email-thread-actions";
    const linkButton = document.createElement("button");
    linkButton.type = "button";
    linkButton.textContent = "Mit dieser Aufgabe verknüpfen";
    linkButton.addEventListener("click", () => {
      if (!task) return;
      void handleEmailLink(task.id, thread.provider, thread.id);
    });
    actions.appendChild(linkButton);
    item.appendChild(actions);

    elements.emailUnlinkedThreads.appendChild(item);
  });
};

const renderLinkedThreads = () => {
  if (!elements.emailLinkedThreads) return;
  elements.emailLinkedThreads.innerHTML = "";
  if (!authState.user) return;
  if (!emailState.linkedThreads.length) {
    const empty = document.createElement("li");
    empty.className = "helper";
    empty.textContent = "Noch keine Threads verknüpft.";
    elements.emailLinkedThreads.appendChild(empty);
    return;
  }
  emailState.linkedThreads.forEach((link) => {
    const item = document.createElement("li");
    item.className = "email-thread-item";
    if (emailState.activeThread?.id === link.id) {
      item.classList.add("is-active");
    }

    const body = document.createElement("div");
    body.className = "email-thread-body";
    const subject = document.createElement("div");
    subject.className = "email-thread-subject";
    subject.textContent = link.subject || "E-Mail-Thread";
    body.appendChild(subject);
    if (link.last_snippet) {
      const snippet = document.createElement("div");
      snippet.className = "email-thread-snippet";
      snippet.textContent = link.last_snippet;
      body.appendChild(snippet);
    }
    const metaLine = [];
    if (link.provider) {
      metaLine.push(getProviderLabel(link.provider));
    }
    if (link.last_message_at) {
      metaLine.push(formatActivityTimestamp(link.last_message_at));
    }
    if (metaLine.length) {
      const meta = document.createElement("div");
      meta.className = "email-thread-meta-line";
      meta.textContent = metaLine.join(" · ");
      body.appendChild(meta);
    }
    item.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "email-thread-actions";
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.textContent = "Öffnen";
    openButton.addEventListener("click", () => {
      void openEmailThread(link);
    });
    const unlinkButton = document.createElement("button");
    unlinkButton.type = "button";
    unlinkButton.textContent = "Lösen";
    unlinkButton.addEventListener("click", () => {
      void handleEmailUnlink(link.id);
    });
    actions.appendChild(openButton);
    actions.appendChild(unlinkButton);
    item.appendChild(actions);

    elements.emailLinkedThreads.appendChild(item);
  });
};

const loadLinkedThreads = async (taskId) => {
  const token = getAuthToken();
  if (!token) return;
  const response = await fetch(
    `/api/tasks/${encodeURIComponent(taskId)}/email-links`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await readJson(response);
  if (handleEmailReauthRequired(response, data)) {
    return;
  }
  if (!response.ok) {
    throw new Error(
      getEmailApiErrorMessage(
        response,
        data,
        "Verknüpfungen konnten nicht geladen werden.",
      ),
    );
  }
  emailState.linkedThreads = Array.isArray(data?.links) ? data.links : [];
  emailState.linkedThreads.sort((a, b) => {
    const aTime = a?.last_message_at
      ? new Date(a.last_message_at).getTime()
      : 0;
    const bTime = b?.last_message_at
      ? new Date(b.last_message_at).getTime()
      : 0;
    return bTime - aTime;
  });
  if (emailState.activeThread) {
    const updated = emailState.linkedThreads.find(
      (link) => link.id === emailState.activeThread.id,
    );
    if (updated) {
      emailState.activeThread = updated;
    }
  }
  if (
    emailState.activeThread &&
    !emailState.linkedThreads.some(
      (link) => link.id === emailState.activeThread.id,
    )
  ) {
    emailState.activeThread = null;
    emailState.threadMessages = [];
  }
  renderLinkedThreads();
  renderEmailThreadView();
};

const loadUnlinkedThreads = async (task) => {
  const token = getAuthToken();
  if (!token) return;
  const threads = [];
  for (const account of emailState.accounts) {
    if (account.isPaused) continue;
    const response = await fetch(
      `/api/email/${account.provider}/lugano/unlinked?limit=30`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Threads konnten nicht geladen werden.",
        ),
      );
    }
    (data?.threads || []).forEach((thread) => {
      threads.push({ ...thread, provider: account.provider });
    });
  }
  threads.sort((a, b) => {
    const aTime = a?.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
    const bTime = b?.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
    return bTime - aTime;
  });
  emailState.unlinkedThreads = threads;
  renderUnlinkedThreads(task);
};

const refreshEmailPanel = async (task, { force = false } = {}) => {
  if (!task) {
    clearEmailThreadView();
    return;
  }
  if (!authState.user) {
    setEmailPanelStatus("Bitte anmelden, um E-Mails zu sehen.", true);
    renderEmailAccounts();
    renderUnlinkedThreads(task);
    renderLinkedThreads();
    return;
  }
  if (force) {
    emailState.activeThread = null;
    emailState.threadMessages = [];
  }
  setEmailPanelStatus("", false);
  try {
    await loadEmailAccounts();
    await loadLinkedThreads(task.id);
    await loadUnlinkedThreads(task);
  } catch (error) {
    setEmailPanelStatus(
      error?.message || "E-Mail-Daten konnten nicht geladen werden.",
      true,
    );
  }
};

const openEmailThread = async (link) => {
  if (!link) return;
  emailState.activeThread = link;
  emailState.threadMessages = [];
  renderLinkedThreads();
  setEmailReplyStatus("", false);
  await loadEmailThreadMessages(link.id);
};

const loadEmailThreadMessages = async (linkId) => {
  const token = getAuthToken();
  if (!token) return;
  emailState.loadingMessages = true;
  setEmailPanelStatus("Thread wird geladen ...");
  try {
    const response = await fetch(
      `/api/email-links/${encodeURIComponent(linkId)}/messages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Thread konnte nicht geladen werden.",
        ),
      );
    }
    emailState.threadMessages = Array.isArray(data?.messages)
      ? data.messages
      : [];
    setEmailPanelStatus("", false);
    renderEmailThreadView();
  } catch (error) {
    setEmailPanelStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "Thread konnte nicht geladen werden.",
      ),
      true,
    );
    clearEmailThreadView();
  } finally {
    emailState.loadingMessages = false;
  }
};

const handleEmailLink = async (taskId, provider, threadId) => {
  const token = getAuthToken();
  if (!token) return;
  setEmailPanelStatus("Thread wird verknüpft ...");
  try {
    const response = await fetch(
      `/api/tasks/${encodeURIComponent(taskId)}/email-links`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          providerThreadId: threadId,
        }),
      },
    );
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Thread konnte nicht verknüpft werden.",
        ),
      );
    }
    const task = getTaskFromModal();
    if (task) {
      await refreshEmailPanel(task, { force: true });
    }
  } catch (error) {
    setEmailPanelStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "Thread konnte nicht verknüpft werden.",
      ),
      true,
    );
  }
};

const handleEmailUnlink = async (linkId) => {
  const token = getAuthToken();
  if (!token) return;
  const confirmRemove = window.confirm(
    "Thread wirklich von der Aufgabe lösen?",
  );
  if (!confirmRemove) return;
  try {
    const response = await fetch(
      `/api/email-links/${encodeURIComponent(linkId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Verknüpfung konnte nicht gelöst werden.",
        ),
      );
    }
    const task = getTaskFromModal();
    if (task) {
      await refreshEmailPanel(task, { force: true });
    }
  } catch (error) {
    setEmailPanelStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "Verknüpfung konnte nicht gelöst werden.",
      ),
      true,
    );
  }
};

const handleEmailReplyTranslate = async () => {
  const draftText = elements.emailReplyText?.value?.trim() || "";
  if (!draftText) {
    setEmailReplyTranslateStatus(
      "Bitte zuerst eine deutsche Antwort schreiben.",
      true,
    );
    return;
  }
  if (emailState.translatingDraft) return;
  const token = getAuthToken();
  if (!token) return;
  emailState.translatingDraft = true;
  if (elements.emailReplyTranslate) {
    elements.emailReplyTranslate.disabled = true;
  }
  setEmailReplyTranslateStatus("Übersetzung wird erstellt ...", false);
  try {
    const response = await fetch("/api/translate/text", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: draftText,
        targetLang: "it",
      }),
    });
    const data = await readJson(response);
    if (handleEmailReauthRequired(response, data)) {
      setEmailReplyTranslateStatus("", false);
      return;
    }
    if (!response.ok) {
      throw new Error(
        getEmailApiErrorMessage(
          response,
          data,
          "Übersetzung konnte nicht erstellt werden.",
        ),
      );
    }
    const translatedText = String(data?.translatedText || "").trim();
    if (!translatedText) {
      throw new Error("Übersetzung konnte nicht erstellt werden.");
    }
    if (elements.emailReplyTextIt) {
      elements.emailReplyTextIt.value = translatedText;
    }
    if (elements.emailReplyTranslation) {
      elements.emailReplyTranslation.hidden = false;
    }
    setEmailReplyTranslateStatus("Übersetzung erstellt.", false);
  } catch (error) {
    setEmailReplyTranslateStatus(
      getEmailFetchErrorMessage(
        error,
        error?.message || "Übersetzung konnte nicht erstellt werden.",
      ),
      true,
    );
  } finally {
    emailState.translatingDraft = false;
    if (elements.emailReplyTranslate) {
      elements.emailReplyTranslate.disabled = false;
    }
  }
};

const handleEmailReplySend = async () => {
  const link = emailState.activeThread;
  if (!link) return;
  const replyTextIt = elements.emailReplyTextIt?.value?.trim() || "";
  const replyTextDe = elements.emailReplyText?.value?.trim() || "";
  if (!replyTextIt && !replyTextDe) {
    setEmailReplyStatus("Bitte eine Antwort eingeben.", true);
    return;
  }
  if (!replyTextIt) {
    const confirmSend = window.confirm(
      "Keine italienische Übersetzung vorhanden. Antwort auf Deutsch senden?",
    );
    if (!confirmSend) return;
  }
  const replyText = replyTextIt || replyTextDe;
  const token = getAuthToken();
  if (!token) return;
  setEmailReplyStatus("Antwort wird gesendet ...");
  try {
    const response = await fetch(
      `/api/email-links/${encodeURIComponent(link.id)}/reply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bodyText: replyText }),
      },
    );
    const data = await readJson(response);
    if (response.status === 401 && data?.requiresReauth) {
      setEmailReplyStatus("", false);
      openReauthModal({
        context: "reply",
        method: data?.method || "totp",
        onSuccess: async () => {
          await handleEmailReplySend();
        },
      });
      return;
    }
    if (!response.ok) {
      throw new Error("Antwort konnte nicht gesendet werden.");
    }
    if (elements.emailReplyText) {
      elements.emailReplyText.value = "";
    }
    if (elements.emailReplyTextIt) {
      elements.emailReplyTextIt.value = "";
    }
    if (elements.emailReplyTranslation) {
      elements.emailReplyTranslation.hidden = true;
    }
    setEmailReplyTranslateStatus("", false);
    setEmailReplyStatus("Antwort gesendet.", false);
    await loadEmailThreadMessages(link.id);
  } catch (error) {
    setEmailReplyStatus(
      error?.message || "Antwort konnte nicht gesendet werden.",
      true,
    );
  }
};

const handleEmailPanelRefresh = async () => {
  const task = getTaskFromModal();
  if (!task) return;
  await refreshEmailPanel(task, { force: true });
};

const cleanupEmailLinksForTask = async (taskId) => {
  const token = getAuthToken();
  if (!token) return;
  try {
    const response = await fetch(
      `/api/tasks/${encodeURIComponent(taskId)}/email-links`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await readJson(response);
    if (!response.ok) return;
    const links = Array.isArray(data?.links) ? data.links : [];
    await Promise.all(
      links.map((link) =>
        fetch(`/api/email-links/${encodeURIComponent(link.id)}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => null),
      ),
    );
  } catch {
    // best effort
  }
};

const normalizeDependencyIds = (dependencyIds = []) =>
  Array.from(
    new Set(
      (Array.isArray(dependencyIds) ? dependencyIds : []).filter(
        (id) => typeof id === "string",
      ),
    ),
  );

const getDependencyDrafts = () => {
  if (!taskModalState.dependencyDrafts) {
    taskModalState.dependencyDrafts = new Map();
  }
  return taskModalState.dependencyDrafts;
};

const getDependencyDraft = (taskId) => {
  const drafts = getDependencyDrafts();
  if (drafts.has(taskId)) return drafts.get(taskId);
  const task = state.tasks.find((item) => item.id === taskId);
  const deps = normalizeDependencyIds(task?.dependencyIds);
  drafts.set(taskId, deps);
  return deps;
};

const buildDependencyDraftMap = () => {
  const taskMap = buildTaskMap();
  if (!taskModalState.dependencyDrafts) return taskMap;
  taskModalState.dependencyDrafts.forEach((deps, taskId) => {
    const task = taskMap.get(taskId);
    if (!task) return;
    taskMap.set(taskId, {
      ...task,
      dependencyIds: normalizeDependencyIds(deps),
    });
  });
  return taskMap;
};

const getDependencyState = (taskId, candidateId) => {
  const outgoing = getDependencyDraft(taskId).includes(candidateId);
  const incoming = getDependencyDraft(candidateId).includes(taskId);
  if (outgoing && incoming) return "both";
  if (outgoing) return "outgoing";
  if (incoming) return "incoming";
  return "none";
};

const getNextDependencyState = (state) => {
  if (state === "none") return "outgoing";
  if (state === "outgoing") return "incoming";
  return "none";
};

const applyDependencyState = (taskId, candidateId, nextState) => {
  const currentDeps = [...getDependencyDraft(taskId)];
  const candidateDeps = [...getDependencyDraft(candidateId)];
  const removeDependency = (list, id) => {
    const index = list.indexOf(id);
    if (index >= 0) {
      list.splice(index, 1);
    }
  };
  removeDependency(currentDeps, candidateId);
  removeDependency(candidateDeps, taskId);
  if (nextState === "outgoing") {
    currentDeps.push(candidateId);
  }
  if (nextState === "incoming") {
    candidateDeps.push(taskId);
  }

  const normalizedCurrent = normalizeDependencyIds(currentDeps);
  const normalizedCandidate = normalizeDependencyIds(candidateDeps);
  const taskMap = buildDependencyDraftMap();
  if (taskMap.has(taskId)) {
    taskMap.set(taskId, {
      ...taskMap.get(taskId),
      dependencyIds: normalizedCurrent,
    });
  }
  if (taskMap.has(candidateId)) {
    taskMap.set(candidateId, {
      ...taskMap.get(candidateId),
      dependencyIds: normalizedCandidate,
    });
  }

  if (
    nextState === "outgoing" &&
    wouldCreateCycle(taskId, candidateId, taskMap)
  ) {
    window.alert("Diese Abhängigkeit würde einen Zyklus erzeugen.");
    return false;
  }
  if (
    nextState === "incoming" &&
    wouldCreateCycle(candidateId, taskId, taskMap)
  ) {
    window.alert("Diese Abhängigkeit würde einen Zyklus erzeugen.");
    return false;
  }

  const drafts = getDependencyDrafts();
  drafts.set(taskId, normalizedCurrent);
  drafts.set(candidateId, normalizedCandidate);
  return true;
};

const updateDependencySummary = (taskId) => {
  if (!elements.taskDependencySummary) return;
  const outgoingCount = getDependencyDraft(taskId).length;
  const incomingCount = state.tasks.filter((item) =>
    getDependencyDraft(item.id).includes(taskId),
  ).length;
  if (!outgoingCount && !incomingCount) {
    elements.taskDependencySummary.textContent = "Keine Abhängigkeiten.";
    return;
  }
  const parts = [];
  if (outgoingCount) {
    parts.push(
      `Hängt von ${outgoingCount} Aufgabe${outgoingCount === 1 ? "" : "n"} ab`,
    );
  }
  if (incomingCount) {
    parts.push(
      `${incomingCount} Aufgabe${
        incomingCount === 1 ? "" : "n"
      } hängt von dieser Aufgabe ab`,
    );
  }
  elements.taskDependencySummary.textContent = parts.join(" · ");
};

const updateTaskDateSummary = (task) => {
  if (!elements.taskDateSummary) return;
  const start = task?.startDate ? formatShortDate(task.startDate) : "";
  const end = task?.endDate ? formatShortDate(task.endDate) : "";
  let text = "Termin hinzufügen";
  if (start && end && start !== end) {
    text = `Termin: ${start} - ${end}`;
  } else if (start || end) {
    text = `Termin: ${start || end}`;
  }
  elements.taskDateSummary.textContent = text;
};

const updateTaskDateSummaryFromInputs = () => {
  if (!elements.taskStartDate && !elements.taskEndDate) return;
  updateTaskDateSummary({
    startDate: elements.taskStartDate?.value || "",
    endDate: elements.taskEndDate?.value || "",
  });
};

const openDependencyPicker = () => {
  if (!elements.taskDependencyPicker) return;
  elements.taskDependencyPicker.hidden = false;
  taskModalState.dependencyPickerOpen = true;
  if (elements.taskDependencyToggle) {
    elements.taskDependencyToggle.setAttribute("aria-expanded", "true");
  }
};

const closeDependencyPicker = () => {
  if (!elements.taskDependencyPicker) return;
  elements.taskDependencyPicker.hidden = true;
  taskModalState.dependencyPickerOpen = false;
  if (elements.taskDependencyToggle) {
    elements.taskDependencyToggle.setAttribute("aria-expanded", "false");
  }
};

const toggleDependencyPicker = () => {
  if (taskModalState.dependencyPickerOpen) {
    closeDependencyPicker();
  } else {
    openDependencyPicker();
  }
};

const toggleEmailUnlinkedPanel = () => {
  if (!elements.emailUnlinkedPanel || !elements.emailUnlinkedToggle) return;
  const shouldOpen = elements.emailUnlinkedPanel.hidden;
  elements.emailUnlinkedPanel.hidden = !shouldOpen;
  elements.emailUnlinkedToggle.setAttribute(
    "aria-expanded",
    shouldOpen ? "true" : "false",
  );
  elements.emailUnlinkedToggle.textContent = shouldOpen
    ? "Schließen"
    : "+ Thread verknüpfen";
};

const openTaskModal = (taskId) => {
  if (!elements.taskModal) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  taskModalState.taskId = taskId;
  taskModalState.dependencyDrafts = new Map();
  getDependencyDraft(taskId);
  if (elements.taskModalTitle) {
    elements.taskModalTitle.textContent = `Aufgabe planen: ${task.title}`;
  }
  if (elements.taskStartDate) {
    elements.taskStartDate.value = task.startDate || "";
  }
  if (elements.taskEndDate) {
    elements.taskEndDate.value = task.endDate || "";
  }
  if (elements.taskDatePanel) {
    elements.taskDatePanel.open = Boolean(task.startDate || task.endDate);
  }
  updateTaskDateSummary(task);
  if (elements.taskModalChat && !elements.taskModalChat.hasChildNodes()) {
    elements.taskModalChat.appendChild(buildChatIcon());
  }
  if (elements.emailReplyText) {
    elements.emailReplyText.value = "";
  }
  if (elements.emailReplyTextIt) {
    elements.emailReplyTextIt.value = "";
  }
  if (elements.emailReplyTranslation) {
    elements.emailReplyTranslation.hidden = true;
  }
  setEmailReplyStatus("", false);
  setEmailReplyTranslateStatus("", false);
  setEmailPanelStatus("", false);
  closeDependencyPicker();
  if (elements.emailUnlinkedPanel) {
    elements.emailUnlinkedPanel.hidden = true;
  }
  if (elements.emailUnlinkedToggle) {
    elements.emailUnlinkedToggle.setAttribute("aria-expanded", "false");
    elements.emailUnlinkedToggle.textContent = "+ Thread verknüpfen";
  }
  renderDependencyOptions(task);
  renderTaskFiles(task);
  void refreshEmailPanel(task, { force: false });
  elements.taskModal.hidden = false;
  updateModalScrollLock();
};

const closeTaskModal = () => {
  if (!elements.taskModal) return;
  elements.taskModal.hidden = true;
  taskModalState.taskId = null;
  taskModalState.dependencyDrafts = null;
  closeDependencyPicker();
  if (elements.taskDatePanel) {
    elements.taskDatePanel.open = false;
  }
  if (elements.emailUnlinkedPanel) {
    elements.emailUnlinkedPanel.hidden = true;
  }
  if (elements.emailUnlinkedToggle) {
    elements.emailUnlinkedToggle.setAttribute("aria-expanded", "false");
    elements.emailUnlinkedToggle.textContent = "+ Thread verknüpfen";
  }
  setEmailPanelStatus("", false);
  setEmailReplyStatus("", false);
  clearEmailThreadView();
  updateModalScrollLock();
};

const openHelpModal = () => {
  if (!elements.helpModal) return;
  elements.helpModal.hidden = false;
  updateModalScrollLock();
  void fetchChatConfig({ force: true });
  elements.helpModalClose?.focus();
};

const closeHelpModal = () => {
  if (!elements.helpModal) return;
  elements.helpModal.hidden = true;
  updateModalScrollLock();
};

const renderDependencyOptions = (task) => {
  if (!elements.taskDependencyList) return;
  elements.taskDependencyList.innerHTML = "";
  if (!task) return;
  updateDependencySummary(task.id);
  const candidates = state.tasks.filter((item) => item.id !== task.id);
  if (!candidates.length) {
    const note = document.createElement("p");
    note.className = "helper";
    note.textContent = "Keine weiteren Aufgaben verfügbar.";
    elements.taskDependencyList.appendChild(note);
    return;
  }

  candidates.sort((a, b) =>
    String(a.title || "").localeCompare(String(b.title || ""), "de", {
      sensitivity: "base",
    }),
  );

  candidates.forEach((candidate) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "dependency-item";
    const state = getDependencyState(task.id, candidate.id);
    item.dataset.state = state;
    const name = document.createElement("span");
    name.className = "dependency-name";
    name.textContent = candidate.title;
    const stateLabel = document.createElement("span");
    stateLabel.className = "dependency-state";
    if (state === "outgoing") {
      stateLabel.textContent = "->";
    } else if (state === "incoming") {
      stateLabel.textContent = "<-";
    } else if (state === "both") {
      stateLabel.textContent = "beide";
    } else {
      stateLabel.textContent = "keine";
    }
    item.appendChild(name);
    item.appendChild(stateLabel);
    item.addEventListener("click", () => {
      const currentState = getDependencyState(task.id, candidate.id);
      const nextState = getNextDependencyState(currentState);
      if (!applyDependencyState(task.id, candidate.id, nextState)) {
        return;
      }
      renderDependencyOptions(task);
    });
    elements.taskDependencyList.appendChild(item);
  });
};

const handleTaskModalSubmit = (event) => {
  event.preventDefault();
  const taskId = taskModalState.taskId;
  if (!taskId) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) {
    closeTaskModal();
    return;
  }

  const nextStartValue = elements.taskStartDate?.value || "";
  const nextEndValue = elements.taskEndDate?.value || "";

  let nextStartDate = isValidDateInput(nextStartValue) ? nextStartValue : null;
  let nextEndDate = isValidDateInput(nextEndValue) ? nextEndValue : null;
  if (nextStartDate && !nextEndDate) {
    nextEndDate = nextStartDate;
  }
  if (nextEndDate && !nextStartDate) {
    nextStartDate = nextEndDate;
  }
  if (nextStartDate && nextEndDate) {
    const parsedStart = parseDateInput(nextStartDate);
    const parsedEnd = parseDateInput(nextEndDate);
    if (parsedStart && parsedEnd && parsedStart > parsedEnd) {
      [nextStartDate, nextEndDate] = [nextEndDate, nextStartDate];
    }
  }

  const taskMap = buildTaskMap();
  const dependencyDrafts = taskModalState.dependencyDrafts || new Map();
  const dependencyUpdates = [];
  dependencyDrafts.forEach((draftDeps, draftTaskId) => {
    const targetTask = taskMap.get(draftTaskId);
    if (!targetTask) return;
    const normalizedDraft = normalizeDependencyIds(draftDeps).filter(
      (id) => id !== draftTaskId && taskMap.has(id),
    );
    const previousDeps = Array.isArray(targetTask.dependencyIds)
      ? targetTask.dependencyIds
      : [];
    const changed =
      previousDeps.length !== normalizedDraft.length ||
      previousDeps.some((id) => !normalizedDraft.includes(id));
    if (changed) {
      dependencyUpdates.push({ task: targetTask, deps: normalizedDraft });
    }
  });

  const dateChanged =
    task.startDate !== nextStartDate || task.endDate !== nextEndDate;
  const currentDepsUpdate = dependencyUpdates.find(
    (entry) => entry.task.id === task.id,
  );

  if (!dateChanged && dependencyUpdates.length === 0) {
    closeTaskModal();
    return;
  }

  if (dateChanged || currentDepsUpdate) {
    if (dateChanged) {
      task.startDate = nextStartDate;
      task.endDate = nextEndDate;
    }
    if (currentDepsUpdate) {
      task.dependencyIds = currentDepsUpdate.deps;
    }
    task.updatedAt = new Date().toISOString();
    const metadata = {};
    if (dateChanged) {
      metadata.startDate = nextStartDate;
      metadata.endDate = nextEndDate;
    }
    if (currentDepsUpdate) {
      metadata.dependencies = currentDepsUpdate.deps;
    }
    if (Object.keys(metadata).length) {
      logTaskUpdate(task, metadata);
    }
  }

  dependencyUpdates.forEach(({ task: targetTask, deps }) => {
    if (targetTask.id === task.id) return;
    targetTask.dependencyIds = deps;
    targetTask.updatedAt = new Date().toISOString();
    logTaskUpdate(targetTask, { dependencies: deps });
  });
  saveState();
  renderTasksPanel();
  closeTaskModal();
};

const renderArchitectPanel = () => {
  if (!state.isArchitectMode) {
    return;
  }
  if (state.isExteriorMode) {
    elements.architectTitle.textContent = "Außenbereiche aktiv";
    if (elements.architectHelp) {
      elements.architectHelp.textContent =
        "Innenbereich ist gesperrt. Schalten Sie auf Innenansicht, um zu bearbeiten.";
    }
    elements.measurementForm.hidden = true;
    return;
  }
  if (!state.selectedElement) {
    elements.architectTitle.textContent =
      state.architectTool === "select"
        ? "Element wählen"
        : "Neues Element platzieren";
    if (elements.architectHelp) {
      elements.architectHelp.textContent =
        state.architectTool === "select"
          ? "Raum, Wand, Tür oder Fenster im Grundriss ziehen, um zu starten."
          : "Werkzeug aktiv. Zum Bearbeiten auf Auswahl wechseln.";
    }
    elements.measurementForm.hidden = true;
    return;
  }

  const { label, elementType } = state.selectedElement;
  elements.architectTitle.textContent = label;

  if (elementType === "wall") {
    const wallData = getWallSelectionData(state.selectedElement);
    if (!wallData) {
      elements.measurementForm.hidden = true;
      return;
    }

    const { room, wallMeta, constraints } = wallData;
    const positionPx = clamp(
      wallMeta.position,
      constraints.min,
      constraints.max,
    );

    const axisLabel =
      wallMeta.orientation === "vertical"
        ? "X-Position der Wand (mm)"
        : "Y-Position der Wand (mm)";
    const spanLabel =
      wallMeta.orientation === "vertical"
        ? "Y-Länge der Wand (mm)"
        : "X-Länge der Wand (mm)";

    const positionMinMm = toMm(constraints.min);
    const positionMaxMm = toMm(constraints.max);
    const positionMm = toMm(positionPx);

    const lengthMinMm = toMm(MIN_ROOM_SIZE_PX);
    const lengthMaxPx =
      wallMeta.orientation === "vertical"
        ? floorBounds.y + floorBounds.height - room.y
        : floorBounds.x + floorBounds.width - room.x;
    const lengthMaxMm = toMm(lengthMaxPx);
    const lengthMm = toMm(wallMeta.length);

    const positionEditable = constraints.min !== constraints.max;
    if (elements.measurementAxisLabel) {
      elements.measurementAxisLabel.textContent = axisLabel;
    }
    if (elements.measurementSpanLabel) {
      elements.measurementSpanLabel.textContent = spanLabel;
    }
    if (elements.measurementLock) {
      elements.measurementLock.checked = state.wallLinkLocked;
    }
    if (elements.measurementLockRow) {
      elements.measurementLockRow.hidden = false;
    }
    if (elements.measurementHeightRow) {
      elements.measurementHeightRow.hidden = true;
    }
    if (elements.measurementSwingRow) {
      elements.measurementSwingRow.hidden = true;
    }
    if (elements.measurementNote) {
      elements.measurementNote.hidden = false;
      elements.measurementNote.textContent = `Wandhöhe fix: ${WALL_HEIGHT_MM} mm.`;
    }
    if (elements.architectHelp) {
      elements.architectHelp.textContent = !positionEditable
        ? "Außenwände sind fixiert. Wählen Sie eine Innenwand für Änderungen."
        : state.wallLinkLocked
          ? "Wand gekoppelt: Bewegung passt angrenzende Räume an. Änderungen erscheinen sofort."
          : "Kopplung gelöst: Änderungen wirken nur auf diesen Raum. Änderungen erscheinen sofort.";
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
    return;
  }

  if (elementType === "room") {
    const floor =
      state.floorPlans[state.selectedElement.floorId] || getActiveFloor();
    const room = floor.rooms.find(
      (item) => item.id === state.selectedElement.roomId,
    );
    if (!room) {
      elements.measurementForm.hidden = true;
      return;
    }

    const widthMinMm = toMm(MIN_ROOM_SIZE_PX);
    const widthMaxPx = Math.max(
      MIN_ROOM_SIZE_PX,
      floorBounds.x + floorBounds.width - room.x,
      room.width,
    );
    const heightMaxPx = Math.max(
      MIN_ROOM_SIZE_PX,
      floorBounds.y + floorBounds.height - room.y,
      room.height,
    );
    const widthMaxMm = toMm(widthMaxPx);
    const heightMaxMm = toMm(heightMaxPx);
    const widthMm = toMm(room.width);
    const heightMm = toMm(room.height);

    if (elements.measurementAxisLabel) {
      elements.measurementAxisLabel.textContent = "Raumbreite (mm)";
    }
    if (elements.measurementSpanLabel) {
      elements.measurementSpanLabel.textContent = "Raumtiefe (mm)";
    }
    if (elements.measurementLockRow) {
      elements.measurementLockRow.hidden = true;
    }
    if (elements.measurementHeightRow) {
      elements.measurementHeightRow.hidden = true;
    }
    if (elements.measurementSwingRow) {
      elements.measurementSwingRow.hidden = true;
    }
    if (elements.measurementNote) {
      elements.measurementNote.hidden = true;
    }
    if (elements.architectHelp) {
      elements.architectHelp.textContent =
        "Raum ziehen, um ihn zu verschieben. Breite und Tiefe hier anpassen.";
    }

    elements.measurementAxis.min = widthMinMm;
    elements.measurementAxis.max = widthMaxMm;
    elements.measurementAxis.step = MM_PER_PX;
    elements.measurementAxis.value = widthMm;
    elements.measurementAxis.disabled = false;

    elements.measurementAxisNumber.min = widthMinMm;
    elements.measurementAxisNumber.max = widthMaxMm;
    elements.measurementAxisNumber.step = MM_PER_PX;
    elements.measurementAxisNumber.value = widthMm;
    elements.measurementAxisNumber.disabled = false;

    elements.measurementSpan.min = widthMinMm;
    elements.measurementSpan.max = heightMaxMm;
    elements.measurementSpan.step = MM_PER_PX;
    elements.measurementSpan.value = heightMm;
    elements.measurementSpan.disabled = false;

    elements.measurementSpanNumber.min = widthMinMm;
    elements.measurementSpanNumber.max = heightMaxMm;
    elements.measurementSpanNumber.step = MM_PER_PX;
    elements.measurementSpanNumber.value = heightMm;
    elements.measurementSpanNumber.disabled = false;

    elements.measurementForm.hidden = false;
    return;
  }

  const openingData = getOpeningSelectionData(state.selectedElement);
  if (!openingData) {
    elements.measurementForm.hidden = true;
    return;
  }

  const { meta, minLength, maxLength, positionBounds } = openingData;
  const axisLabel =
    meta.axis === "x"
      ? "Mitte der Öffnung (X, mm)"
      : "Mitte der Öffnung (Y, mm)";
  const spanLabel =
    elementType === "door" ? "Türbreite (mm)" : "Fensterbreite (mm)";
  const heightLabel =
    elementType === "door" ? "Türhöhe (mm)" : "Fensterhöhe (mm)";

  const positionMinMm = toMm(positionBounds.min);
  const positionMaxMm = toMm(positionBounds.max);
  const positionMm = toMm(
    clamp(meta.position, positionBounds.min, positionBounds.max),
  );

  const lengthMinMm = toMm(minLength);
  const lengthMaxMm = toMm(maxLength);
  const lengthMm = toMm(meta.length);
  const heightBounds = getOpeningHeightBoundsMm(elementType);
  const heightMm = clamp(
    openingData.opening.heightMm,
    heightBounds.min,
    heightBounds.max,
  );
  openingData.opening.heightMm = heightMm;
  if (
    elementType === "door" &&
    typeof openingData.opening.showSwing !== "boolean"
  ) {
    openingData.opening.showSwing = false;
  }

  if (elements.measurementAxisLabel) {
    elements.measurementAxisLabel.textContent = axisLabel;
  }
  if (elements.measurementSpanLabel) {
    elements.measurementSpanLabel.textContent = spanLabel;
  }
  if (elements.measurementHeightLabel) {
    elements.measurementHeightLabel.textContent = heightLabel;
  }
  if (elements.measurementLockRow) {
    elements.measurementLockRow.hidden = true;
  }
  if (elements.measurementHeightRow) {
    elements.measurementHeightRow.hidden = false;
  }
  if (elements.measurementSwingRow) {
    elements.measurementSwingRow.hidden = elementType !== "door";
  }
  if (elements.measurementNote) {
    elements.measurementNote.hidden = true;
  }
  if (elements.architectHelp) {
    elements.architectHelp.textContent =
      "Öffnung frei ziehen – sie rastet an der nächsten Wand ein. Werte direkt eingeben, Änderungen erscheinen sofort.";
  }

  elements.measurementAxis.min = positionMinMm;
  elements.measurementAxis.max = positionMaxMm;
  elements.measurementAxis.step = MM_PER_PX;
  elements.measurementAxis.value = positionMm;
  elements.measurementAxis.disabled = false;

  elements.measurementAxisNumber.min = positionMinMm;
  elements.measurementAxisNumber.max = positionMaxMm;
  elements.measurementAxisNumber.step = MM_PER_PX;
  elements.measurementAxisNumber.value = positionMm;
  elements.measurementAxisNumber.disabled = false;

  elements.measurementSpan.min = lengthMinMm;
  elements.measurementSpan.max = lengthMaxMm;
  elements.measurementSpan.step = MM_PER_PX;
  elements.measurementSpan.value = lengthMm;
  elements.measurementSpan.disabled = false;

  elements.measurementSpanNumber.min = lengthMinMm;
  elements.measurementSpanNumber.max = lengthMaxMm;
  elements.measurementSpanNumber.step = MM_PER_PX;
  elements.measurementSpanNumber.value = lengthMm;
  elements.measurementSpanNumber.disabled = false;

  if (elements.measurementHeight) {
    elements.measurementHeight.min = heightBounds.min;
    elements.measurementHeight.max = heightBounds.max;
    elements.measurementHeight.step = OPENING_HEIGHT_STEP_MM;
    elements.measurementHeight.value = heightMm;
    elements.measurementHeight.disabled = false;
  }

  if (elements.measurementHeightNumber) {
    elements.measurementHeightNumber.min = heightBounds.min;
    elements.measurementHeightNumber.max = heightBounds.max;
    elements.measurementHeightNumber.step = OPENING_HEIGHT_STEP_MM;
    elements.measurementHeightNumber.value = heightMm;
    elements.measurementHeightNumber.disabled = false;
  }

  if (elements.measurementSwing) {
    elements.measurementSwing.checked = openingData.opening.showSwing === true;
    elements.measurementSwing.disabled = elementType !== "door";
  }

  elements.measurementForm.hidden = false;
};

const updateArchitectToolUI = () => {
  if (elements.architectToolButtons?.length) {
    elements.architectToolButtons.forEach((button) => {
      const tool = button.dataset.architectTool;
      const isActive = tool === state.architectTool;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
      button.disabled = state.isExteriorMode;
      button.setAttribute("aria-disabled", String(state.isExteriorMode));
    });
  }
  if (elements.architectToolHint) {
    let hint = "";
    if (state.isExteriorMode) {
      hint = "Außenansicht aktiv. Innenbereich ist gesperrt.";
    } else if (state.architectTool === "door") {
      hint = "Tür platzieren: Im Grundriss an eine Wand klicken.";
    } else if (state.architectTool === "window") {
      hint = "Fenster platzieren: Im Grundriss an eine Wand klicken.";
    } else if (state.architectTool === "room") {
      hint = state.roomDraft
        ? "Zweite Ecke klicken, um den Raum abzuschließen."
        : "Erste Ecke klicken, dann Maus ziehen und erneut klicken.";
    } else {
      hint = "Auswahl aktiv: Element anklicken, dann Maße rechts anpassen.";
    }
    elements.architectToolHint.textContent = hint;
  }
};

const setArchitectTool = (tool) => {
  const normalized = ["select", "door", "window", "room"].includes(tool)
    ? tool
    : "select";
  if (state.architectTool === normalized) return;
  state.architectTool = normalized;
  state.isAddingComment = false;
  if (normalized !== "room") {
    state.roomDraft = null;
  }
  if (normalized !== "select") {
    state.selectedElement = null;
  }
  resetDragState();
  clearHoverState();
  renderFloorplan();
  renderArchitectPanel();
  updateArchitectToolUI();
};

const getRoomCategory = (room) => {
  const name = room?.name?.toLowerCase() || "";
  if (name.includes("wohn")) return "living";
  if (name.includes("schlaf")) return "bedroom";
  if (name.includes("küche") || name.includes("kueche")) return "kitchen";
  if (name.includes("bad")) return "bathroom";
  if (name.includes("arbeits")) return "office";
  if (name.includes("flur") || name.includes("treppe") || name.includes("gang"))
    return "hallway";
  return "default";
};

const buildDefaultScene = () => ({ ...THREE_D_DEFAULT_SCENE });

const ensureRoomScene = (roomData, room) => {
  if (!roomData.scene || typeof roomData.scene !== "object") {
    roomData.scene = buildDefaultScene(room);
  }
  const scene = roomData.scene;
  const normalizedView = scene.view === "dollhouse" ? "model" : scene.view;
  scene.view = THREE_D_VIEW_PRESETS[normalizedView]
    ? normalizedView
    : THREE_D_DEFAULT_SCENE.view;
  return scene;
};

const syncThreeDControls = (scene) => {
  if (elements.threeDViewButtons?.length) {
    elements.threeDViewButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === scene.view);
    });
  }
};

const createRoomSurface = (className) => {
  const surface = document.createElement("div");
  surface.className = `room-surface ${className}`;
  return surface;
};

const buildThreeDRoomShell = () => {
  if (!elements.threeDRoom) return null;
  elements.threeDRoom.innerHTML = "";

  const floor = createRoomSurface("floor");
  const floorFurniture = document.createElement("div");
  floorFurniture.className = "floor-furniture";
  floor.appendChild(floorFurniture);

  const ceiling = createRoomSurface("ceiling");
  const wallNorth = createRoomSurface("wall wall-north");
  const wallSouth = createRoomSurface("wall wall-south");
  const wallEast = createRoomSurface("wall wall-east");
  const wallWest = createRoomSurface("wall wall-west");

  elements.threeDRoom.appendChild(floor);
  elements.threeDRoom.appendChild(ceiling);
  elements.threeDRoom.appendChild(wallNorth);
  elements.threeDRoom.appendChild(wallSouth);
  elements.threeDRoom.appendChild(wallEast);
  elements.threeDRoom.appendChild(wallWest);

  return {
    floorFurniture,
    surfaces: {
      floor,
      ceiling,
      "wall-north": wallNorth,
      "wall-south": wallSouth,
      "wall-east": wallEast,
      "wall-west": wallWest,
    },
    walls: {
      top: wallNorth,
      bottom: wallSouth,
      left: wallWest,
      right: wallEast,
    },
  };
};

const getWindowSillHeightMm = (opening, roomHeightMm) => {
  if (opening.type !== "window") return 0;
  const defaultSill = 900;
  const maxSill = Math.max(0, roomHeightMm - opening.heightMm - 200);
  return clamp(defaultSill, 0, maxSill);
};

const renderThreeDOpenings = (room, measurement, roomSize, walls) => {
  const floor = getActiveFloor();
  if (!floor) return;
  floor.openings
    .filter((opening) => opening.roomId === room.id)
    .forEach((opening) => {
      const meta = getOpeningMeta(opening);
      const wallSide = resolveOpeningWallSide(opening, room, meta);
      const wallEl = walls[wallSide];
      if (!wallEl) return;

      const wallSpan =
        wallSide === "left" || wallSide === "right" ? room.height : room.width;
      const wallSpanPx =
        wallSide === "left" || wallSide === "right"
          ? roomSize.depth
          : roomSize.width;
      const openingStart =
        wallSide === "left" || wallSide === "right"
          ? Math.min(opening.y1, opening.y2) - room.y
          : Math.min(opening.x1, opening.x2) - room.x;
      const openingWidth = Math.max(
        18,
        (meta.length / Math.max(wallSpan, 1)) * wallSpanPx,
      );
      const openingLeft = clamp(
        (openingStart / Math.max(wallSpan, 1)) * wallSpanPx,
        6,
        wallSpanPx - openingWidth - 6,
      );
      const openingHeight = Math.max(
        40,
        (opening.heightMm / measurement.height) * roomSize.height,
      );
      const bottomMm = getWindowSillHeightMm(opening, measurement.height);
      const openingBottom = (bottomMm / measurement.height) * roomSize.height;

      const openingEl = document.createElement("div");
      openingEl.className = `opening ${opening.type}`;
      openingEl.style.setProperty("--opening-left", `${openingLeft}px`);
      openingEl.style.setProperty("--opening-width", `${openingWidth}px`);
      openingEl.style.setProperty("--opening-height", `${openingHeight}px`);
      openingEl.style.setProperty("--opening-bottom", `${openingBottom}px`);
      openingEl.title = opening.label;
      wallEl.appendChild(openingEl);
    });
};

const renderThreeDFurniture = (room, roomSize, floorFurniture) => {
  if (!floorFurniture) return;
  const category = getRoomCategory(room);
  const layout =
    THREE_D_FURNITURE_PRESETS[category] || THREE_D_FURNITURE_PRESETS.default;
  const pad = 6;
  layout.forEach((item) => {
    const width = Math.max(20, item.width * roomSize.width);
    const depth = Math.max(20, item.depth * roomSize.depth);
    const left = clamp(
      item.x * roomSize.width,
      pad,
      roomSize.width - width - pad,
    );
    const top = clamp(
      item.z * roomSize.depth,
      pad,
      roomSize.depth - depth - pad,
    );
    const block = document.createElement("div");
    block.className = `furniture-block${item.soft ? " is-soft" : ""}`;
    block.style.width = `${width}px`;
    block.style.height = `${depth}px`;
    block.style.left = `${left}px`;
    block.style.top = `${top}px`;
    floorFurniture.appendChild(block);
  });
};

const clearPinnedImages = (surfaces) => {
  if (!surfaces) return;
  Object.values(surfaces).forEach((surface) => {
    surface.querySelectorAll(".pinned-image").forEach((el) => el.remove());
  });
};

const renderPinnedImages = (roomData, surfaces) => {
  if (!roomData || !surfaces) return;
  clearPinnedImages(surfaces);
  const images = Array.isArray(roomData.images) ? roomData.images : [];
  images.forEach((file) => {
    if (!file?.pin?.surface) return;
    if (!file.url || !isEvidenceImage(file)) return;
    const surface = surfaces[file.pin.surface];
    if (!surface) return;
    const pinEl = document.createElement("button");
    pinEl.type = "button";
    pinEl.className = "pinned-image";
    const x = Number.isFinite(file.pin.x) ? file.pin.x : 0.5;
    const y = Number.isFinite(file.pin.y) ? file.pin.y : 0.5;
    const scale = Number.isFinite(file.pin.scale)
      ? file.pin.scale
      : file.pin.surface === "floor" || file.pin.surface === "ceiling"
        ? 0.4
        : 0.35;
    pinEl.style.setProperty("--pin-x", `${x * 100}%`);
    pinEl.style.setProperty("--pin-y", `${y * 100}%`);
    pinEl.style.setProperty("--pin-size", `${scale * 100}%`);
    const img = document.createElement("img");
    img.src = file.url;
    img.alt = file.label || file.name || "Bild";
    pinEl.appendChild(img);
    pinEl.title = file.label || file.name || "Bild";
    pinEl.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageModal(file.id, state.activeRoomId);
    });
    pinEl.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
    });
    surface.appendChild(pinEl);
  });
};

const updateThreeDReadout = (measurement) => {
  if (!elements.threeDReadout) return;
  const meters = (mm) => (mm / 1000).toFixed(1);
  elements.threeDReadout.textContent = `${meters(
    measurement.width,
  )}m × ${meters(measurement.length)}m × ${meters(measurement.height)}m`;
};

const updateThreeDCamera = () => {
  if (!elements.threeDStage) return;
  elements.threeDStage.style.setProperty(
    "--camera-rotate",
    `${threeDState.camera.yaw}deg`,
  );
  elements.threeDStage.style.setProperty(
    "--camera-tilt",
    `${threeDState.camera.pitch}deg`,
  );
  elements.threeDStage.style.setProperty(
    "--camera-distance",
    `${threeDState.camera.distance}px`,
  );
};

const resetThreeDCamera = (view, roomSize) => {
  const preset = THREE_D_VIEW_PRESETS[view] || THREE_D_VIEW_PRESETS.walkthrough;
  const baseDistance = Math.max(roomSize.width, roomSize.depth) * 2.2;
  threeDState.camera.yaw = preset.yaw;
  threeDState.camera.pitch = preset.pitch;
  threeDState.camera.distance = -baseDistance * preset.distanceFactor;
  threeDState.bounds.minDistance = -baseDistance * 2.4;
  threeDState.bounds.maxDistance = -baseDistance * 0.6;
};

const update3DScene = (roomId, { resetCamera = false } = {}) => {
  const room = findRoomById(roomId);
  if (!room || !elements.threeDStage || !elements.threeDRoom) return;
  const roomData = ensureRoomData(roomId);
  const scene = ensureRoomScene(roomData, room);
  syncThreeDControls(scene);
  elements.threeDStage.dataset.view = scene.view;

  const measurement = getRoomMeasurements(room);
  const maxWidth = 340;
  const maxDepth = 260;
  const scale = clamp(
    Math.min(maxWidth / measurement.width, maxDepth / measurement.length),
    0.045,
    0.11,
  );
  const roomSize = {
    width: Math.round(measurement.width * scale),
    depth: Math.round(measurement.length * scale),
    height: Math.round(measurement.height * scale),
  };

  elements.threeDStage.style.setProperty("--room-width", `${roomSize.width}px`);
  elements.threeDStage.style.setProperty("--room-depth", `${roomSize.depth}px`);
  elements.threeDStage.style.setProperty(
    "--room-height",
    `${roomSize.height}px`,
  );

  const shell = buildThreeDRoomShell();
  if (shell) {
    renderThreeDOpenings(room, measurement, roomSize, shell.walls);
    renderThreeDFurniture(room, roomSize, shell.floorFurniture);
    renderPinnedImages(roomData, shell.surfaces);
  }
  updateThreeDReadout(measurement);

  const shouldReset =
    resetCamera ||
    threeDState.activeRoomId !== roomId ||
    threeDState.activeView !== scene.view;
  if (shouldReset) {
    resetThreeDCamera(scene.view, roomSize);
  }
  updateThreeDCamera();
  threeDState.activeRoomId = roomId;
  threeDState.activeView = scene.view;
};

const updateActiveRoomScene = (updates, { resetCamera = false } = {}) => {
  if (!state.activeRoomId) return;
  const room = findRoomById(state.activeRoomId);
  if (!room) return;
  const roomData = ensureRoomData(state.activeRoomId);
  const scene = ensureRoomScene(roomData, room);
  Object.assign(scene, updates);
  ensureRoomScene(roomData, room);
  saveState();
  update3DScene(state.activeRoomId, { resetCamera });
};

const startThreeDDrag = (event) => {
  if (!elements.threeDStage) return;
  event.preventDefault();
  threeDState.drag.active = true;
  threeDState.drag.pointerId = event.pointerId;
  threeDState.drag.lastX = event.clientX;
  threeDState.drag.lastY = event.clientY;
  elements.threeDStage.classList.add("is-dragging");
  try {
    elements.threeDStage.setPointerCapture(event.pointerId);
  } catch {
    // Ignore pointer capture failures.
  }
};

const moveThreeDDrag = (event) => {
  if (!threeDState.drag.active) return;
  const deltaX = event.clientX - threeDState.drag.lastX;
  const deltaY = event.clientY - threeDState.drag.lastY;
  threeDState.drag.lastX = event.clientX;
  threeDState.drag.lastY = event.clientY;
  threeDState.camera.yaw += deltaX * 0.25;
  threeDState.camera.pitch = clamp(
    threeDState.camera.pitch + deltaY * 0.25,
    -8,
    45,
  );
  updateThreeDCamera();
};

const endThreeDDrag = () => {
  if (!threeDState.drag.active) return;
  if (threeDState.drag.pointerId !== null) {
    try {
      elements.threeDStage?.releasePointerCapture(threeDState.drag.pointerId);
    } catch {
      // Ignore pointer capture failures.
    }
  }
  threeDState.drag.active = false;
  threeDState.drag.pointerId = null;
  elements.threeDStage?.classList.remove("is-dragging");
};

const handleThreeDWheel = (event) => {
  if (!state.show3d) return;
  event.preventDefault();
  const step = Math.sign(event.deltaY) * 40;
  threeDState.camera.distance = clamp(
    threeDState.camera.distance - step,
    threeDState.bounds.minDistance,
    threeDState.bounds.maxDistance,
  );
  updateThreeDCamera();
};

const clearHoverState = () => {
  elements.floorplan
    .querySelectorAll(".architect-hit.hovered")
    .forEach((el) => el.classList.remove("hovered"));
};

const setArchitectDragging = (isDragging) => {
  document.body.classList.toggle("architect-dragging", isDragging);
};

const updateFloorplanHint = () => {
  if (!elements.floorplanHint) return;
  if (state.isExteriorMode) {
    elements.floorplanHint.textContent =
      "Außenbereiche aktiv: Innenbereich ist gesperrt.";
    return;
  }
  elements.floorplanHint.textContent = state.isArchitectMode
    ? "Architekt-Ansicht: Räume, Wände, Türen und Fenster im Grundriss ziehen."
    : DEFAULT_FLOORPLAN_HINT;
};

const updateInteriorControls = () => {
  const activeRoom = state.activeRoomId
    ? findRoomById(state.activeRoomId)
    : null;
  const isLocked = state.isExteriorMode && !isExteriorRoom(activeRoom);
  if (elements.addCommentBtn) {
    elements.addCommentBtn.disabled = isLocked;
    elements.addCommentBtn.setAttribute("aria-disabled", String(isLocked));
  }
  if (elements.clearSelectionBtn) {
    elements.clearSelectionBtn.disabled = isLocked;
    elements.clearSelectionBtn.setAttribute("aria-disabled", String(isLocked));
  }
};

const resetDragState = ({ keepSuppressClick = false } = {}) => {
  if (dragState.pointerId !== null) {
    try {
      elements.floorplan.releasePointerCapture(dragState.pointerId);
    } catch {
      // Ignore release failures when pointer capture is already cleared.
    }
  }
  dragState.active = false;
  dragState.didMove = false;
  if (!keepSuppressClick) {
    dragState.suppressClick = false;
  }
  dragState.pointerId = null;
  dragState.type = null;
  dragState.axis = null;
  dragState.startPointerAxis = 0;
  dragState.startPointerX = 0;
  dragState.startPointerY = 0;
  dragState.startPosition = 0;
  dragState.lastPosition = 0;
  dragState.context = null;
  dragState.startClientX = 0;
  dragState.startClientY = 0;
  setArchitectDragging(false);
};

const setArchitectMode = (isOn) => {
  state.isArchitectMode = isOn;
  if (elements.toggleArchitect) {
    elements.toggleArchitect.checked = isOn;
  }
  state.selectedElement = null;
  state.isAddingComment = false;
  state.roomDraft = null;
  state.architectTool = "select";
  updateViewUI();
  document.body.classList.toggle("architect-mode", isOn);
  resetDragState();
  clearHoverState();
  renderFloorplan();
  updateFloorplanHint();
  updateArchitectToolUI();
  updateInteriorControls();
  renderArchitectPanel();
};

const setExteriorMode = (isOn) => {
  state.isExteriorMode = Boolean(isOn);
  document.body.classList.toggle("exterior-mode", state.isExteriorMode);
  if (elements.exteriorToggle) {
    elements.exteriorToggle.checked = state.isExteriorMode;
  }
  if (state.isExteriorMode) {
    state.isAddingComment = false;
    state.selectedElement = null;
    state.roomDraft = null;
    state.show3d = false;
    const activeRoom = state.activeRoomId
      ? findRoomById(state.activeRoomId)
      : null;
    if (activeRoom && !isExteriorRoom(activeRoom)) {
      state.activeRoomId = null;
    }
    resetDragState();
    clearHoverState();
    hideCommentTooltip();
  }
  updateFloorplanViewBox();
  updateFloorplanHint();
  updateArchitectToolUI();
  updateInteriorControls();
  renderFloorplan();
  renderArchitectPanel();
  renderRoomPanel();
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
  state.roomDraft = null;
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  updateFloorButtons();
  updateFloorplanHint();
  renderMobileRoomSelect();
};

const selectRoom = (roomId) => {
  if (state.isExteriorMode && roomId) {
    const room = findRoomById(roomId);
    if (room && !isExteriorRoom(room)) {
      return;
    }
  }
  state.activeRoomId = roomId;
  state.isAddingComment = false;
  state.show3d = false;
  if (!roomId) {
    state.selectedElement = null;
  }
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  syncTaskRoomFilter(roomId, { shouldRender: true });
  renderMobileRoomSelect();
  updateInteriorControls();
};

const selectArchitectElement = (target) => {
  if (state.isExteriorMode) return;
  const hitTarget = target?.closest?.(".architect-hit") || target;
  if (!hitTarget) return;
  const roomId = hitTarget.dataset.roomId;
  const label = hitTarget.dataset.elementLabel || "Element";
  const elementType = hitTarget.dataset.elementType || "element";
  const wallSide = hitTarget.dataset.wallSide || null;
  const floorId = hitTarget.dataset.floorId || state.activeFloorId;
  const openingId = hitTarget.dataset.openingId || null;
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
  state.selectedElement = {
    roomId,
    label,
    elementType,
    wallSide,
    floorId,
    openingId,
  };
  renderArchitectPanel();
  return state.selectedElement;
};

const handleAddComment = (event) => {
  if (!state.activeRoomId || !state.isAddingComment) {
    return;
  }

  const room = findRoomById(state.activeRoomId);
  if (!room) {
    return;
  }
  if (state.isExteriorMode && !isExteriorRoom(room)) {
    return;
  }

  const { x, y } = getFloorplanPoint(event);
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
    id: createCommentId(),
    userId: authState.user.id,
    userName,
    userEmail: authState.user.email || "",
    text: commentText,
    x,
    y,
    resolved: false,
    chat: null,
  });

  state.isAddingComment = false;
  logActivityEvent("comment_added", {
    roomId: state.activeRoomId,
    metadata: { text: commentText },
  });
  saveState();
  renderFloorplan();
  renderComments(roomData);
};

const requireActiveRoom = (message) => {
  if (state.activeRoomId) return true;
  window.alert(message || "Bitte zuerst einen Raum auswählen.");
  return false;
};

const showTaskInputError = (input, message) => {
  if (!input) return;
  input.setCustomValidity(message);
  if (typeof input.reportValidity === "function") {
    input.reportValidity();
  } else {
    window.alert(message);
  }
  input.setCustomValidity("");
  input.focus();
};

const ensureTaskVisibleInFilters = (task) => {
  if (!task) return;
  if (applyTaskFilters([task]).length > 0) return;

  const nextFilters = { ...state.taskFilters };
  const normalizedStatus = normalizeTaskStatus(task.status);
  const tagSet = new Set(task.tags || []);
  const viewPreset =
    TASK_VIEW_PRESETS[nextFilters.view] || TASK_VIEW_PRESETS.all;
  if (
    nextFilters.view !== "all" &&
    viewPreset?.filter &&
    !viewPreset.filter(task)
  ) {
    nextFilters.view = "all";
  }
  if (nextFilters.roomId !== "all") {
    if (nextFilters.roomId === "none") {
      if (task.roomId) {
        nextFilters.roomId = "all";
      }
    } else if (task.roomId !== nextFilters.roomId) {
      nextFilters.roomId = "all";
    }
  }
  if (nextFilters.status !== "all" && normalizedStatus !== nextFilters.status) {
    nextFilters.status = "all";
  }
  if (nextFilters.assignee !== "all") {
    if (nextFilters.assignee === "unassigned") {
      if (task.assignee) {
        nextFilters.assignee = "all";
      }
    } else if (task.assignee !== nextFilters.assignee) {
      nextFilters.assignee = "all";
    }
  }
  if (nextFilters.tag !== "all" && !tagSet.has(nextFilters.tag)) {
    nextFilters.tag = "all";
  }
  if (nextFilters.query) {
    const search = nextFilters.query.trim().toLowerCase();
    const haystack =
      typeof task.searchIndex === "string"
        ? task.searchIndex
        : updateTaskSearchIndex(task);
    if (search && !haystack.includes(search)) {
      nextFilters.query = "";
    }
  }

  const didChange = Object.keys(nextFilters).some(
    (key) => nextFilters[key] !== state.taskFilters[key],
  );
  if (didChange) {
    state.taskFilters = nextFilters;
    clearTaskSelection();
  }
};

const handleTaskCreateSubmit = (event) => {
  event.preventDefault();
  if (!elements.taskCreateInput) return;
  const rawValue = elements.taskCreateInput.value.trim();
  if (!rawValue) {
    showTaskInputError(
      elements.taskCreateInput,
      "Bitte eine Aufgabe eingeben.",
    );
    return;
  }
  const parsed = parseTaskInput(rawValue);
  if (!parsed.title) {
    showTaskInputError(
      elements.taskCreateInput,
      "Bitte einen Aufgabentitel eingeben.",
    );
    return;
  }
  const roomValue = elements.taskCreateRoom?.value || "none";
  const roomId = roomValue === "none" ? null : roomValue;
  const task = createTask({
    title: parsed.title,
    tags: parsed.tags || [],
    roomId,
  });
  state.tasks.unshift(task);
  ensureTaskVisibleInFilters(task);
  logActivityEvent("task_created", {
    taskId: task.id,
    roomId: task.roomId,
    metadata: { title: task.title },
  });
  elements.taskCreateInput.value = "";
  saveState();
  renderTasksPanel();
};

const handleTaskSubmit = (event) => {
  event.preventDefault();
  if (!elements.taskInput) return;
  if (!requireActiveRoom("Bitte zuerst einen Raum auswählen.")) {
    return;
  }
  const rawValue = elements.taskInput.value.trim();
  if (!rawValue) {
    return;
  }
  const parsed = parseTaskInput(rawValue);
  if (!parsed.title) {
    return;
  }
  const extraTags = normalizeTaskTags(elements.taskTagsInput?.value || "");
  const tags = Array.from(new Set([...(parsed.tags || []), ...extraTags]));
  const selectedStatus = elements.taskStatusInput?.value || DEFAULT_TASK_STATUS;
  const roomId = state.activeRoomId;
  const task = createTask({
    title: parsed.title,
    tags,
    status: normalizeTaskStatus(selectedStatus),
    roomId,
  });
  state.tasks.unshift(task);
  logActivityEvent("task_created", {
    taskId: task.id,
    roomId: task.roomId,
    metadata: { title: task.title },
  });
  elements.taskInput.value = "";
  if (elements.taskTagsInput) {
    elements.taskTagsInput.value = "";
  }
  if (elements.taskStatusInput) {
    elements.taskStatusInput.value = DEFAULT_TASK_STATUS;
  }
  saveState();
  renderTasksPanel();
};

const handleTaskFilterChange = () => {
  state.taskFilters.roomId = elements.taskFilterRoom?.value || "all";
  state.taskFilters.status = elements.taskFilterStatus?.value || "all";
  state.taskFilters.assignee = elements.taskFilterAssignee?.value || "all";
  state.taskFilters.tag = elements.taskFilterTag?.value || "all";
  state.taskFilters.query = elements.taskFilterSearch?.value || "";
  clearTaskSelection();
  renderTasksPanel();
};

const resetTaskFilters = () => {
  state.taskFilters = { ...DEFAULT_TASK_FILTERS };
  clearTaskSelection();
  renderTasksPanel();
};

const getSelectedTasks = () =>
  state.tasks.filter((task) => state.selectedTaskIds.has(task.id));

const handleTaskSelectAll = (event) => {
  const isChecked = event.target.checked;
  const visibleTasks = applyTaskFilters(state.tasks);
  visibleTasks.forEach((task) => {
    if (isChecked) {
      state.selectedTaskIds.add(task.id);
    } else {
      state.selectedTaskIds.delete(task.id);
    }
  });
  if (elements.taskList) {
    elements.taskList
      .querySelectorAll("input[data-task-select]")
      .forEach((input) => {
        input.checked = isChecked;
      });
  }
  updateTaskSelectionState(visibleTasks);
};

const handleTaskBulkDone = () => {
  const selected = getSelectedTasks();
  if (!selected.length) return;
  const timestamp = new Date().toISOString();
  let didUpdate = false;
  selected.forEach((task) => {
    if (updateTaskStatus(task, "Done", timestamp)) {
      didUpdate = true;
    }
  });
  clearTaskSelection();
  if (!didUpdate) {
    renderTasksPanel();
    return;
  }
  saveState();
  renderTasksPanel();
};

const handleTaskBulkAssign = () => {
  const assignee = elements.taskBulkAssignee?.value?.trim();
  if (!assignee) return;
  const selected = getSelectedTasks();
  if (!selected.length) return;
  const timestamp = new Date().toISOString();
  selected.forEach((task) => {
    const previousAssignee = task.assignee || "";
    if (previousAssignee === assignee) return;
    task.assignee = assignee;
    task.updatedAt = timestamp;
    updateTaskSearchIndex(task);
    logActivityEvent("task_assigned", {
      taskId: task.id,
      roomId: task.roomId,
      metadata: {
        title: task.title,
        assignee,
        previousAssignee: previousAssignee || null,
      },
    });
  });
  clearTaskSelection();
  saveState();
  renderTasksPanel();
};

const handleTaskBulkDueDate = () => {
  const dueDate = elements.taskBulkDueDate?.value || "";
  if (!dueDate) return;
  const selected = getSelectedTasks();
  if (!selected.length) return;
  const timestamp = new Date().toISOString();
  selected.forEach((task) => {
    if (task.dueDate === dueDate) return;
    task.dueDate = dueDate;
    task.updatedAt = timestamp;
    logTaskUpdate(task, { dueDate });
  });
  clearTaskSelection();
  saveState();
  renderTasksPanel();
};

const removeTask = (taskId) => {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  const confirmRemove = window.confirm(
    `Aufgabe "${task.title}" wirklich entfernen?`,
  );
  if (!confirmRemove) return;
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  state.selectedTaskIds.delete(taskId);
  state.tasks.forEach((item) => {
    if (!Array.isArray(item.dependencyIds)) return;
    item.dependencyIds = item.dependencyIds.filter((id) => id !== taskId);
  });
  saveState();
  void cleanupEmailLinksForTask(taskId);
  renderTasksPanel();
};

const handleDecisionSubmit = async (event) => {
  event.preventDefault();
  if (
    !requireActiveRoom(
      "Bitte zuerst einen Raum auswählen, bevor Sie Entscheidungen hinzufügen.",
    )
  )
    return;
  if (!elements.decisionTitleInput || !elements.decisionBodyInput) return;
  const title = elements.decisionTitleInput.value.trim();
  const body = elements.decisionBodyInput.value.trim();
  if (!title || !body) {
    window.alert("Bitte Titel und Begründung eingeben.");
    return;
  }

  const roomData = ensureRoomData(state.activeRoomId);
  const actor = getActivityActor();
  const taskIds = Array.from(
    elements.decisionTasks?.querySelectorAll(
      "input[type='checkbox']:checked",
    ) || [],
  ).map((input) => input.value);
  const decision = {
    id: createDecisionId(),
    title,
    body,
    actor,
    userId: authState.user?.id || null,
    userName: actor,
    userEmail: authState.user?.email || "",
    createdAt: new Date().toISOString(),
    taskIds,
  };
  roomData.decisions.unshift(decision);
  elements.decisionForm?.reset();
  renderDecisions(roomData);
  renderDecisionTaskOptions();
  logActivityEvent("decision_created", {
    roomId: state.activeRoomId,
    metadata: { title, body, taskCount: taskIds.length },
  });
  saveStateLocal();
  const apiSaved = await postEvidenceItem(
    state.activeRoomId,
    "decisions",
    decision,
  );
  if (!apiSaved) {
    saveState();
  }
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

const setImageEditStatus = (text, isError = false) => {
  if (!elements.imageEditStatus) return;
  elements.imageEditStatus.textContent = text || "";
  elements.imageEditStatus.classList.toggle("status-line", Boolean(text));
  elements.imageEditStatus.classList.toggle("error", isError);
};

const createImageVersionId = () =>
  `imgv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const buildImageHistoryEntry = ({
  prompt,
  url,
  createdAt,
  userId,
  userName,
  userEmail,
  source,
}) => ({
  id: createImageVersionId(),
  prompt: prompt || "Bild",
  url,
  createdAt: createdAt || new Date().toISOString(),
  userId: userId || authState.user?.id || null,
  userName: userName || getActivityActor(),
  userEmail: userEmail || authState.user?.email || "",
  source: source || "openai",
});

const buildInitialHistoryEntry = (file) =>
  buildImageHistoryEntry({
    prompt: file.prompt || file.label || file.name || "Original",
    url: file.url,
    createdAt: file.createdAt || new Date().toISOString(),
    userId: file.userId,
    userName: file.userName || "",
    userEmail: file.userEmail || "",
    source: file.source || "upload",
  });

const ensureImageHistory = (file) => {
  if (!file) return [];
  if (!Array.isArray(file.history) || !file.history.length) {
    file.history = file.url ? [buildInitialHistoryEntry(file)] : [];
  }
  return file.history;
};

const getImageHistory = (file) => {
  if (!file) return [];
  if (Array.isArray(file.history) && file.history.length) {
    return file.history;
  }
  return file.url ? [buildInitialHistoryEntry(file)] : [];
};

const canUseEvidenceApi = () =>
  window.location.protocol !== "file:" &&
  Boolean(authState.session?.access_token);

const postEvidenceItem = async (roomId, resource, item) => {
  if (!roomId || !resource || !canUseEvidenceApi()) return false;
  const token = authState.session?.access_token;
  try {
    const response = await fetch(
      `/api/rooms/${encodeURIComponent(roomId)}/${resource}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item,
          state: buildStatePayload(),
        }),
      },
    );

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    syncState.lastSavedAt = Date.now();
    return true;
  } catch (error) {
    console.error("Evidence speichern fehlgeschlagen:", error);
    return false;
  }
};

const renderImagesIfActive = (roomId, roomData) => {
  if (!roomId || roomId !== state.activeRoomId) return;
  renderImages(roomData);
};

const persistEvidenceFile = async (roomId, roomData, record) => {
  roomData.images.unshift(record);
  renderImagesIfActive(roomId, roomData);
  if (record?.taskId) {
    maybeUpdateTaskModalFiles(record.taskId);
  }
  saveStateLocal();
  const apiSaved = await postEvidenceItem(roomId, "files", record);
  if (!apiSaved) {
    saveState();
  }
};

const persistEvidenceUpdate = async (roomId, roomData, record) => {
  renderImagesIfActive(roomId, roomData);
  if (record?.taskId) {
    maybeUpdateTaskModalFiles(record.taskId);
  }
  saveStateLocal();
  const apiSaved = await postEvidenceItem(roomId, "files", record);
  if (!apiSaved) {
    saveState();
  }
};

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error("Bild konnte nicht gelesen werden."));
    reader.readAsDataURL(blob);
  });

const resolveImageDataUrl = async (url) => {
  if (!url) return "";
  if (url.startsWith("data:")) return url;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Bild konnte nicht geladen werden (${response.status}).`);
  }
  const blob = await response.blob();
  return blobToDataUrl(blob);
};

const requestImageFromOpenAI = async ({ prompt, baseImage, mask }) => {
  const apiKey = readApiKey();
  const cleanPrompt = String(prompt || "").trim();
  const requestBody = { prompt: cleanPrompt };
  if (baseImage) {
    requestBody.image = baseImage;
  }
  if (mask) {
    requestBody.mask = mask;
  }
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

  return imageUrl;
};

const buildImageRecord = ({ url, prompt, source = "openai" }) => {
  const timestamp = new Date().toISOString();
  const id = `img-${Date.now()}`;
  const prefix = source === "edit" ? "ChatGPT-Änderung" : "ChatGPT-Anfrage";
  const label = prompt ? `${prefix}: ${prompt}` : "Bild";
  const record = {
    id,
    label,
    name: label,
    url,
    type: "image/png",
    size: null,
    createdAt: timestamp,
    userId: authState.user?.id || null,
    userName: getActivityActor(),
    userEmail: authState.user?.email || "",
    prompt,
    source,
    pin: null,
  };
  record.history = [
    {
      id: `${id}-v1`,
      prompt: prompt || label,
      url,
      createdAt: timestamp,
      userId: record.userId,
      userName: record.userName,
      userEmail: record.userEmail,
      source,
    },
  ];
  return record;
};

const buildEvidenceRecord = ({
  label,
  url,
  type = "",
  size = null,
  source = "upload",
  roomId = null,
  taskId = null,
  taskTitle = "",
} = {}) => {
  const timestamp = new Date().toISOString();
  const trimmedLabel = String(label || "").trim() || "Datei";
  const record = {
    id: `file-${Date.now()}`,
    label: trimmedLabel,
    name: trimmedLabel,
    url: url || "",
    type: type || "",
    size: Number.isFinite(size) ? size : null,
    createdAt: timestamp,
    userId: authState.user?.id || null,
    userName: getActivityActor(),
    userEmail: authState.user?.email || "",
    source: source || "upload",
    roomId,
    taskId,
    taskTitle,
    pin: null,
  };
  if (isEvidenceImage(record)) {
    record.history = [
      buildImageHistoryEntry({
        prompt: trimmedLabel,
        url: record.url,
        createdAt: record.createdAt,
        userId: record.userId,
        userName: record.userName,
        userEmail: record.userEmail,
        source: record.source,
      }),
    ];
  }
  return record;
};

const getActiveImageRecord = () => {
  if (!imageModalState.roomId || !imageModalState.imageId) return null;
  const roomData = ensureRoomData(imageModalState.roomId);
  return (
    roomData.images.find((item) => item.id === imageModalState.imageId) || null
  );
};

const getImageVersionById = (file, versionId) => {
  const history = getImageHistory(file);
  if (!history.length) return null;
  return history.find((entry) => entry.id === versionId) || history[0];
};

const setImageModalControlsEnabled = (isEnabled) => {
  [
    elements.imageEditPrompt,
    elements.imageMaskToggle,
    elements.imageMaskClear,
    elements.imageMaskSize,
    elements.imagePinSurface,
    elements.imagePinApply,
    elements.imagePinClear,
    elements.imageDeleteBtn,
  ].forEach((el) => {
    if (el) {
      el.disabled = !isEnabled;
    }
  });
  const submit = elements.imageEditForm?.querySelector("button[type='submit']");
  if (submit) {
    submit.disabled = !isEnabled;
  }
};

const updateImageModalMeta = (file) => {
  if (!elements.imageModalMeta || !file) return;
  if (elements.imageModalTitle) {
    elements.imageModalTitle.textContent = file.label || file.name || "Bild";
  }
  elements.imageModalMeta.innerHTML = "";
  const title = document.createElement("div");
  title.textContent = file.label || file.name || "Bild";
  elements.imageModalMeta.appendChild(title);

  const author = file.userName || file.userEmail || "";
  const created = formatActivityTimestamp(file.createdAt);
  if (author || created) {
    const meta = document.createElement("div");
    meta.appendChild(
      createUserSpan({
        label: author || "Unbekannt",
        id: file.userId,
        email: file.userEmail,
      }),
    );
    if (created) {
      const separator = document.createElement("span");
      separator.textContent = " · ";
      const timeLabel = document.createElement("span");
      timeLabel.textContent = created;
      meta.appendChild(separator);
      meta.appendChild(timeLabel);
    }
    elements.imageModalMeta.appendChild(meta);
  }

  const pinLabel = getPinSurfaceLabel(file.pin);
  if (pinLabel) {
    const pin = document.createElement("div");
    pin.textContent = `📌 ${pinLabel}`;
    elements.imageModalMeta.appendChild(pin);
  }
};

const updateImageModalPreview = (file, version) => {
  if (!elements.imageModalPreview || !file) return;
  const entry =
    version || getImageVersionById(file, imageModalState.baseVersionId);
  elements.imageModalPreview.src = entry?.url || file.url || "";
  elements.imageModalPreview.alt = file.label || file.name || "Bild";
};

const renderImageThread = (file) => {
  if (!elements.imageThreadList || !file) return;
  elements.imageThreadList.innerHTML = "";
  const history = getImageHistory(file);
  if (!history.length) {
    const empty = document.createElement("li");
    empty.className = "helper";
    empty.textContent = "Noch kein Verlauf.";
    elements.imageThreadList.appendChild(empty);
    return;
  }
  history.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "image-thread-item";
    if (entry.id === imageModalState.baseVersionId) {
      item.classList.add("is-active");
    }

    const thumb = document.createElement("div");
    thumb.className = "image-thread-thumb";
    if (entry.url) {
      const img = document.createElement("img");
      img.src = entry.url;
      img.alt = entry.prompt || "Version";
      thumb.appendChild(img);
    }
    item.appendChild(thumb);

    const body = document.createElement("div");
    const prompt = document.createElement("div");
    prompt.textContent = entry.prompt || "Version";
    body.appendChild(prompt);
    const meta = document.createElement("div");
    meta.className = "image-thread-meta";
    const author = entry.userName || entry.userEmail || "";
    const created = formatActivityTimestamp(entry.createdAt);
    if (author || created) {
      meta.appendChild(
        createUserSpan({
          label: author || "Unbekannt",
          id: entry.userId,
          email: entry.userEmail,
        }),
      );
      if (created) {
        const separator = document.createElement("span");
        separator.textContent = " · ";
        const timeLabel = document.createElement("span");
        timeLabel.textContent = created;
        meta.appendChild(separator);
        meta.appendChild(timeLabel);
      }
    }
    body.appendChild(meta);
    item.appendChild(body);

    item.addEventListener("click", () => selectImageVersion(entry.id));
    elements.imageThreadList.appendChild(item);
  });
};

const selectImageVersion = (versionId) => {
  const file = getActiveImageRecord();
  if (!file) return;
  const entry = getImageVersionById(file, versionId);
  if (!entry) return;
  imageModalState.baseVersionId = entry.id;
  updateImageModalPreview(file, entry);
  renderImageThread(file);
  if (imageMaskState.active) {
    resetImageMaskCanvas();
  }
};

const openImageModal = (imageId, roomId = state.activeRoomId) => {
  if (!elements.imageModal || !imageId || !roomId) return;
  const roomData = ensureRoomData(roomId);
  const file = roomData.images.find((item) => item.id === imageId);
  if (!file) return;

  imageModalState.roomId = roomId;
  imageModalState.imageId = imageId;
  imageModalState.isOpen = true;
  const history = getImageHistory(file);
  imageModalState.baseVersionId = history[0]?.id || null;

  elements.imageModalTitle.textContent = file.label || file.name || "Bild";
  elements.imageModal.hidden = false;
  updateModalScrollLock();
  if (elements.imageEditPrompt) {
    elements.imageEditPrompt.value = "";
  }
  setImageEditStatus("");
  updateImageModalMeta(file);
  updateImageModalPreview(file, history[0] || null);
  renderImageThread(file);

  if (elements.imagePinSurface) {
    elements.imagePinSurface.value = file.pin?.surface || "";
  }
  if (elements.imagePinClear) {
    elements.imagePinClear.disabled = !file.pin;
  }

  if (elements.imageMaskSize) {
    imageMaskState.brushSize =
      Number(elements.imageMaskSize.value) || imageMaskState.brushSize;
  }
  setImageMaskActive(false);
  setImageModalControlsEnabled(true);
};

const closeImageModal = () => {
  if (!elements.imageModal) return;
  elements.imageModal.hidden = true;
  imageModalState.roomId = null;
  imageModalState.imageId = null;
  imageModalState.baseVersionId = null;
  imageModalState.isOpen = false;
  updateModalScrollLock();
  if (elements.imageModalPreview) {
    elements.imageModalPreview.src = "";
  }
  if (elements.imageEditPrompt) {
    elements.imageEditPrompt.value = "";
  }
  setImageEditStatus("");
  setImageMaskActive(false);
};

const resizeImageMaskCanvas = () => {
  const canvas = elements.imageMaskCanvas;
  const preview = elements.imageModalPreview;
  if (!canvas || !preview) return false;
  const width = preview.clientWidth;
  const height = preview.clientHeight;
  if (!width || !height) return false;
  if (canvas.width === width && canvas.height === height) return true;
  canvas.width = width;
  canvas.height = height;
  return true;
};

const resetImageMaskCanvas = () => {
  const canvas = elements.imageMaskCanvas;
  if (!canvas) return;
  if (!resizeImageMaskCanvas()) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  imageMaskState.hasEdits = false;
  imageMaskState.lastPoint = null;
};

const setImageMaskActive = (isActive) => {
  imageMaskState.active = isActive;
  if (elements.imageMaskCanvas) {
    elements.imageMaskCanvas.hidden = !isActive;
  }
  if (elements.imageMaskToggle) {
    elements.imageMaskToggle.textContent = isActive
      ? "Maske ausblenden"
      : "Bereich markieren";
  }
  if (isActive) {
    resetImageMaskCanvas();
  } else {
    imageMaskState.drawing = false;
    imageMaskState.lastPoint = null;
  }
};

const getMaskCanvasPoint = (event) => {
  const canvas = elements.imageMaskCanvas;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
};

const drawMaskLine = (from, to) => {
  const canvas = elements.imageMaskCanvas;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = imageMaskState.brushSize;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
  imageMaskState.hasEdits = true;
};

const handleImageMaskPointerDown = (event) => {
  if (!imageMaskState.active || !elements.imageMaskCanvas) return;
  event.preventDefault();
  imageMaskState.drawing = true;
  elements.imageMaskCanvas.setPointerCapture?.(event.pointerId);
  const point = getMaskCanvasPoint(event);
  imageMaskState.lastPoint = point;
  drawMaskLine(point, point);
};

const handleImageMaskPointerMove = (event) => {
  if (!imageMaskState.drawing) return;
  const point = getMaskCanvasPoint(event);
  drawMaskLine(imageMaskState.lastPoint || point, point);
  imageMaskState.lastPoint = point;
};

const handleImageMaskPointerUp = (event) => {
  if (!imageMaskState.drawing) return;
  imageMaskState.drawing = false;
  imageMaskState.lastPoint = null;
  elements.imageMaskCanvas?.releasePointerCapture?.(event.pointerId);
};

const getMaskDataUrl = () => {
  if (!imageMaskState.active || !imageMaskState.hasEdits) return "";
  const canvas = elements.imageMaskCanvas;
  if (!canvas) return "";
  const preview = elements.imageModalPreview;
  const targetWidth = preview?.naturalWidth || canvas.width;
  const targetHeight = preview?.naturalHeight || canvas.height;
  if (!targetWidth || !targetHeight) {
    return canvas.toDataURL("image/png");
  }
  if (canvas.width === targetWidth && canvas.height === targetHeight) {
    return canvas.toDataURL("image/png");
  }
  const scaled = document.createElement("canvas");
  scaled.width = targetWidth;
  scaled.height = targetHeight;
  const ctx = scaled.getContext("2d");
  ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
  return scaled.toDataURL("image/png");
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

const handleImagePinApply = () => {
  const file = getActiveImageRecord();
  if (!file || !imageModalState.roomId) return;
  const surface = elements.imagePinSurface?.value || "";
  if (!surface) {
    file.pin = null;
  } else {
    const scale = surface === "floor" || surface === "ceiling" ? 0.4 : 0.35;
    file.pin = { surface, x: 0.5, y: 0.5, scale };
  }
  const roomData = ensureRoomData(imageModalState.roomId);
  renderImagesIfActive(imageModalState.roomId, roomData);
  updateImageModalMeta(file);
  if (elements.imagePinClear) {
    elements.imagePinClear.disabled = !file.pin;
  }
  saveState();
  if (state.show3d && imageModalState.roomId === state.activeRoomId) {
    update3DScene(imageModalState.roomId);
  }
};

const handleImagePinClear = () => {
  if (elements.imagePinSurface) {
    elements.imagePinSurface.value = "";
  }
  handleImagePinApply();
};

const removeImage = (imageId, roomId = state.activeRoomId) => {
  if (!roomId) return;
  const roomData = ensureRoomData(roomId);
  const index = roomData.images.findIndex((item) => item.id === imageId);
  if (index === -1) return;
  const file = roomData.images[index];
  const taskId = file.taskId;
  const label = file.label || file.name || "Bild";
  const confirmRemove = window.confirm(`Bild "${label}" wirklich löschen?`);
  if (!confirmRemove) return;
  roomData.images.splice(index, 1);
  renderImagesIfActive(roomId, roomData);
  saveState();
  if (taskId) {
    maybeUpdateTaskModalFiles(taskId);
  }
  if (imageModalState.imageId === imageId) {
    closeImageModal();
  }
  if (state.show3d && roomId === state.activeRoomId) {
    update3DScene(roomId);
  }
};

const handleImageEditSubmit = async (event) => {
  event.preventDefault();
  const file = getActiveImageRecord();
  if (!file || !imageModalState.roomId) return;
  const promptText = elements.imageEditPrompt?.value?.trim() || "";
  if (!promptText) {
    setImageEditStatus("Bitte eine Anweisung eingeben.", true);
    return;
  }

  const baseEntry = getImageVersionById(file, imageModalState.baseVersionId);
  if (!baseEntry?.url) {
    setImageEditStatus("Kein Basisbild verfügbar.", true);
    return;
  }

  try {
    setImageStatus("Bild wird bearbeitet …");
    setImageEditStatus("Bild wird bearbeitet …");
    setImageModalControlsEnabled(false);

    const baseImage = await resolveImageDataUrl(baseEntry.url);
    if (!baseImage) {
      throw new Error("Basisbild konnte nicht geladen werden.");
    }

    const maskDataUrl = getMaskDataUrl();
    const imageUrl = await requestImageFromOpenAI({
      prompt: promptText,
      baseImage,
      mask: maskDataUrl || undefined,
    });

    ensureImageHistory(file);
    const entry = buildImageHistoryEntry({
      prompt: promptText,
      url: imageUrl,
      source: "edit",
    });
    file.history.unshift(entry);
    file.url = imageUrl;
    file.label = `ChatGPT-Änderung: ${promptText}`;
    file.name = file.label;
    file.prompt = promptText;
    file.updatedAt = new Date().toISOString();

    const roomData = ensureRoomData(imageModalState.roomId);
    await persistEvidenceUpdate(imageModalState.roomId, roomData, file);

    imageModalState.baseVersionId = entry.id;
    updateImageModalMeta(file);
    updateImageModalPreview(file, entry);
    renderImageThread(file);
    if (imageMaskState.active) {
      resetImageMaskCanvas();
    }
    setImageStatus("Bild wurde aktualisiert.");
    setImageEditStatus("Bild wurde aktualisiert.");
    if (state.show3d && imageModalState.roomId === state.activeRoomId) {
      update3DScene(imageModalState.roomId);
    }
  } catch (error) {
    console.error("Bildbearbeitung fehlgeschlagen:", error);
    const networkBlocked = isLikelyNetworkBlock(error);
    const message =
      error?.code === "missing_api_key"
        ? "Kein API-Schlüssel gefunden – im Dialog speichern oder OPENAI_API_KEY am Server setzen."
        : error?.code === "invalid_image_data"
          ? "Basisbild ist ungültig. Bitte ein lokales Bild verwenden."
          : error?.code === "invalid_mask_data"
            ? "Maske ist ungültig. Bitte Maske löschen und erneut versuchen."
            : error?.code === "openai_network_error"
              ? "Netzwerk blockiert – HTTPS zu api.openai.com ist gesperrt."
              : networkBlocked
                ? "Lokaler Bilddienst nicht erreichbar. App über npm run serve starten."
                : error?.code === "openai_error"
                  ? `OpenAI-Fehler: ${error.message}`
                  : "Bildbearbeitung fehlgeschlagen. Bitte erneut versuchen.";
    setImageStatus(message, true);
    setImageEditStatus(message, true);
  } finally {
    setImageModalControlsEnabled(true);
  }
};

const generateImageWithOpenAI = async (promptText, roomId, roomData) => {
  const labelText = promptText || "Idee ohne Beschreibung";

  if (window.location.protocol === "file:") {
    await persistEvidenceFile(
      roomId,
      roomData,
      buildImageRecord({
        url: buildPlaceholderImage(labelText),
        prompt: labelText,
        source: "placeholder",
      }),
    );
    setImageStatus(
      "Bildgenerierung benötigt einen lokalen Server. Bitte über npm run serve öffnen.",
      true,
    );
    return;
  }

  try {
    setImageStatus("Bild wird erzeugt …");
    elements.generateImageBtn.disabled = true;
    const imageUrl = await requestImageFromOpenAI({ prompt: labelText });
    await persistEvidenceFile(
      roomId,
      roomData,
      buildImageRecord({ url: imageUrl, prompt: labelText, source: "openai" }),
    );
    setImageStatus("Bild wurde erzeugt.");
  } catch (error) {
    console.error("Bildgenerierung fehlgeschlagen:", error);
    await persistEvidenceFile(
      roomId,
      roomData,
      buildImageRecord({
        url: buildPlaceholderImage(labelText),
        prompt: labelText,
        source: "placeholder",
      }),
    );
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

  const roomId = state.activeRoomId;
  const roomData = ensureRoomData(roomId);
  const cleanedPrompt = promptText.trim();
  generateImageWithOpenAI(
    cleanedPrompt || "Idee ohne Beschreibung",
    roomId,
    roomData,
  );
};

const handleUploadImage = (event) => {
  const target = resolveEvidenceUploadTarget();
  if (!target) {
    event.target.value = "";
    return;
  }
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async (loadEvent) => {
    const roomData = ensureRoomData(target.roomId);
    const record = buildEvidenceRecord({
      label: file.name,
      url: loadEvent.target.result,
      type: file.type || "",
      size: file.size,
      source: "upload",
      roomId: target.roomId,
      taskId: target.taskId,
      taskTitle: target.taskTitle,
    });
    logActivityEvent("file_uploaded", {
      roomId: target.roomId,
      taskId: target.taskId,
      metadata: { filename: file.name },
    });
    await persistEvidenceFile(target.roomId, roomData, record);
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

const handleAddEvidenceLink = async () => {
  const target = resolveEvidenceUploadTarget();
  if (!target) return;
  const url = window.prompt("Link zur Datei oder Referenz einfügen:");
  if (!url) return;
  const label = window.prompt("Titel für den Link:", url.trim()) || url.trim();
  if (!label) return;

  const roomData = ensureRoomData(target.roomId);
  const record = buildEvidenceRecord({
    label,
    url: url.trim(),
    type: "link",
    size: null,
    source: "link",
    roomId: target.roomId,
    taskId: target.taskId,
    taskTitle: target.taskTitle,
  });
  logActivityEvent("file_uploaded", {
    roomId: target.roomId,
    taskId: target.taskId,
    metadata: { filename: label },
  });
  await persistEvidenceFile(target.roomId, roomData, record);
};

const handleTaskFileUpload = (event) => {
  const target = resolveTaskEvidenceTarget();
  if (!target) {
    event.target.value = "";
    return;
  }
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (loadEvent) => {
    const roomData = ensureRoomData(target.roomId);
    const record = buildEvidenceRecord({
      label: file.name,
      url: loadEvent.target.result,
      type: file.type || "",
      size: file.size,
      source: "upload",
      roomId: target.roomId,
      taskId: target.taskId,
      taskTitle: target.taskTitle,
    });
    logActivityEvent("file_uploaded", {
      roomId: target.roomId,
      taskId: target.taskId,
      metadata: { filename: file.name },
    });
    await persistEvidenceFile(target.roomId, roomData, record);
  };
  reader.readAsDataURL(file);
  event.target.value = "";
};

const handleTaskFileLink = async () => {
  const target = resolveTaskEvidenceTarget();
  if (!target) return;
  const url = window.prompt("Link zur Datei oder Referenz einfügen:");
  if (!url) return;
  const label = window.prompt("Titel für den Link:", url.trim()) || url.trim();
  if (!label) return;

  const roomData = ensureRoomData(target.roomId);
  const record = buildEvidenceRecord({
    label,
    url: url.trim(),
    type: "link",
    size: null,
    source: "link",
    roomId: target.roomId,
    taskId: target.taskId,
    taskTitle: target.taskTitle,
  });
  logActivityEvent("file_uploaded", {
    roomId: target.roomId,
    taskId: target.taskId,
    metadata: { filename: label },
  });
  await persistEvidenceFile(target.roomId, roomData, record);
};

const applyArchitectAdjustments = ({
  commit = false,
  refreshPanel = false,
} = {}) => {
  if (!state.selectedElement || state.isExteriorMode) return;

  if (state.selectedElement.elementType === "wall") {
    const wallData = getWallSelectionData(state.selectedElement);
    if (!wallData) return;

    const { floor, room, wallMeta, affectedRooms, constraints } = wallData;
    const oldPosition = wallMeta.position;
    const newPosition = clamp(
      toPx(
        getInputNumber(
          elements.measurementAxisNumber,
          elements.measurementAxis,
        ),
      ),
      constraints.min,
      constraints.max,
    );

    let changed = false;
    if (Math.abs(newPosition - oldPosition) > 0.01) {
      applyWallPosition(floor, wallMeta, affectedRooms, newPosition);
      updateOpeningsForWallMove(floor, wallMeta, oldPosition, newPosition);
      changed = true;
    }

    if (!state.wallLinkLocked) {
      const maxLengthPx =
        wallMeta.orientation === "vertical"
          ? floorBounds.y + floorBounds.height - room.y
          : floorBounds.x + floorBounds.width - room.x;
      const newLength = clamp(
        toPx(
          getInputNumber(
            elements.measurementSpanNumber,
            elements.measurementSpan,
          ),
        ),
        MIN_ROOM_SIZE_PX,
        maxLengthPx,
      );
      if (Math.abs(newLength - wallMeta.length) > 0.01) {
        applyWallLength(room, wallMeta, newLength);
        changed = true;
      }
    }

    if (changed) {
      renderFloorplan();
      renderRoomPanel();
      update3DScene(room.id);
    }
    if (refreshPanel) {
      renderArchitectPanel();
    }
    if (commit && changed) {
      saveState();
    }
    return;
  }

  if (state.selectedElement.elementType === "room") {
    const floor =
      state.floorPlans[state.selectedElement.floorId] || getActiveFloor();
    const room = floor.rooms.find(
      (item) => item.id === state.selectedElement.roomId,
    );
    if (!room) return;

    const widthMaxPx = Math.max(
      MIN_ROOM_SIZE_PX,
      floorBounds.x + floorBounds.width - room.x,
      room.width,
    );
    const heightMaxPx = Math.max(
      MIN_ROOM_SIZE_PX,
      floorBounds.y + floorBounds.height - room.y,
      room.height,
    );
    const newWidth = clamp(
      toPx(
        getInputNumber(
          elements.measurementAxisNumber,
          elements.measurementAxis,
        ),
      ),
      MIN_ROOM_SIZE_PX,
      widthMaxPx,
    );
    const newHeight = clamp(
      toPx(
        getInputNumber(
          elements.measurementSpanNumber,
          elements.measurementSpan,
        ),
      ),
      MIN_ROOM_SIZE_PX,
      heightMaxPx,
    );

    const widthChanged = Math.abs(newWidth - room.width) > 0.01;
    const heightChanged = Math.abs(newHeight - room.height) > 0.01;
    if (widthChanged || heightChanged) {
      room.width = newWidth;
      room.height = newHeight;
      updateOpeningsForRoomResize(floor, room);
      renderFloorplan();
      renderRoomPanel();
      update3DScene(room.id);
    }
    if (refreshPanel) {
      renderArchitectPanel();
    }
    if (commit && (widthChanged || heightChanged)) {
      saveState();
    }
    return;
  }

  const openingData = getOpeningSelectionData(state.selectedElement);
  if (!openingData) return;

  const { opening, meta, bounds, minLength, maxLength } = openingData;
  const newLength = clamp(
    toPx(
      getInputNumber(elements.measurementSpanNumber, elements.measurementSpan),
    ),
    minLength,
    maxLength,
  );
  const positionBounds = getOpeningPositionBounds(bounds, newLength);
  const newCenter = clamp(
    toPx(
      getInputNumber(elements.measurementAxisNumber, elements.measurementAxis),
    ),
    positionBounds.min,
    positionBounds.max,
  );
  const heightBounds = getOpeningHeightBoundsMm(opening.type);
  const newHeight = clamp(
    getInputNumber(
      elements.measurementHeightNumber,
      elements.measurementHeight,
    ),
    heightBounds.min,
    heightBounds.max,
  );

  const wantsSwing =
    opening.type === "door" && elements.measurementSwing
      ? elements.measurementSwing.checked
      : opening.showSwing === true;

  const geometryChanged =
    Math.abs(newCenter - meta.position) > 0.01 ||
    Math.abs(newLength - meta.length) > 0.01;
  const swingChanged =
    opening.type === "door" &&
    typeof wantsSwing === "boolean" &&
    wantsSwing !== (opening.showSwing === true);
  let needsRender = false;
  if (geometryChanged) {
    const wallPosition = meta.axis === "x" ? opening.y1 : opening.x1;
    setOpeningOnWall(opening, meta.axis, wallPosition, newCenter, newLength);
    needsRender = true;
  }
  if (swingChanged) {
    opening.showSwing = wantsSwing;
    needsRender = true;
  }
  if (needsRender) {
    renderFloorplan();
  }
  const heightChanged = Math.abs(newHeight - opening.heightMm) > 0.5;
  if (heightChanged) {
    opening.heightMm = newHeight;
    if (state.show3d && opening.roomId) {
      update3DScene(opening.roomId);
    }
  }
  if (refreshPanel) {
    renderArchitectPanel();
  }
  if (commit && (geometryChanged || heightChanged || swingChanged)) {
    saveState();
  }
};

const addOpeningAtPoint = (type, point) => {
  const floor = getActiveFloor();
  if (!floor) return;
  const defaultLength =
    type === "door" ? DEFAULT_DOOR_WIDTH_PX : DEFAULT_WINDOW_WIDTH_PX;
  const targetWall = getClosestWallForPointInFloor(floor, point, defaultLength);
  if (!targetWall) {
    window.alert(
      "Bitte näher an eine Wand klicken, um eine Öffnung zu setzen.",
    );
    return;
  }
  const bounds = getOpeningBoundsForWall(
    targetWall.room,
    targetWall.side,
    targetWall.axis,
  );
  const span = Math.max(0, bounds.end - bounds.start);
  const length = clamp(defaultLength, MIN_OPENING_SIZE_PX, span);
  const positionBounds = getOpeningPositionBounds(bounds, length);
  const axisValue = targetWall.axis === "x" ? point.x : point.y;
  const center = clamp(axisValue, positionBounds.min, positionBounds.max);
  const opening = {
    id: createOpeningId(),
    type,
    roomId: targetWall.room.id,
    label: type === "door" ? "Neue Tür" : "Neues Fenster",
    heightMm: getDefaultOpeningHeightMm(type),
  };
  if (type === "door") {
    opening.showSwing = false;
  }
  setOpeningOnWall(
    opening,
    targetWall.axis,
    targetWall.position,
    center,
    length,
  );
  floor.openings.push(opening);
  ensureRoomData(targetWall.room.id);
  state.activeRoomId = targetWall.room.id;
  state.selectedElement = {
    roomId: targetWall.room.id,
    floorId: floor.id,
    elementType: type,
    wallSide: targetWall.side,
    openingId: opening.id,
    label: opening.label,
  };
  renderFloorplan();
  renderArchitectPanel();
  renderRoomPanel();
  saveState();
};

const beginRoomDraft = (point) => {
  state.roomDraft = {
    startX: point.x,
    startY: point.y,
    currentX: point.x,
    currentY: point.y,
  };
  updateArchitectToolUI();
  renderFloorplan();
};

const updateRoomDraft = (point) => {
  if (!state.roomDraft) return;
  state.roomDraft.currentX = point.x;
  state.roomDraft.currentY = point.y;
  updateArchitectToolUI();
  renderFloorplan();
};

const commitRoomDraft = () => {
  const draftRect = getRoomDraftRect(state.roomDraft);
  const floor = getActiveFloor();
  if (!draftRect || !floor) {
    state.roomDraft = null;
    updateArchitectToolUI();
    renderFloorplan();
    return;
  }
  const room = {
    id: createRoomId(floor.id),
    name: getNextRoomName(floor),
    x: draftRect.x,
    y: draftRect.y,
    width: draftRect.width,
    height: draftRect.height,
  };
  floor.rooms.push(room);
  ensureRoomData(room.id);
  state.activeRoomId = room.id;
  state.selectedElement = {
    roomId: room.id,
    floorId: floor.id,
    elementType: "room",
    wallSide: null,
    openingId: null,
    label: `${room.name} – Raum`,
  };
  state.roomDraft = null;
  updateArchitectToolUI();
  renderFloorplan();
  renderArchitectPanel();
  renderRoomPanel();
  saveState();
};

const startArchitectDrag = (event, target) => {
  const hitTarget = target?.closest?.(".architect-hit") || target;
  if (
    !state.isArchitectMode ||
    state.isExteriorMode ||
    state.architectTool !== "select" ||
    !hitTarget?.classList?.contains("architect-hit")
  ) {
    return;
  }

  const selection = selectArchitectElement(hitTarget) || state.selectedElement;
  if (!selection) return;

  const pointer = getFloorplanPoint(event);

  if (selection.elementType === "wall") {
    const wallData = getWallSelectionData(selection);
    if (!wallData) return;
    if (wallData.constraints.min === wallData.constraints.max) {
      return;
    }
    dragState.active = true;
    dragState.type = "wall";
    dragState.axis = wallData.wallMeta.axis;
    dragState.startPointerAxis = dragState.axis === "x" ? pointer.x : pointer.y;
    dragState.startPosition = wallData.wallMeta.position;
    dragState.lastPosition = wallData.wallMeta.position;
    dragState.context = wallData;
  } else if (selection.elementType === "room") {
    const floor = state.floorPlans[selection.floorId] || getActiveFloor();
    const room = floor.rooms.find((item) => item.id === selection.roomId);
    if (!room) return;
    dragState.active = true;
    dragState.type = "room";
    dragState.axis = null;
    dragState.startPointerX = pointer.x;
    dragState.startPointerY = pointer.y;
    dragState.context = {
      floor,
      room,
      startX: room.x,
      startY: room.y,
    };
  } else {
    const openingData = getOpeningSelectionData(selection);
    if (!openingData) return;
    dragState.active = true;
    dragState.type = "opening";
    dragState.axis = openingData.meta.axis;
    dragState.startPointerAxis = dragState.axis === "x" ? pointer.x : pointer.y;
    dragState.startPosition = openingData.meta.position;
    dragState.lastPosition = openingData.meta.position;
    dragState.context = {
      opening: openingData.opening,
      room: openingData.room,
      floor: openingData.floor,
      startRoomId: openingData.opening.roomId,
      length: openingData.meta.length,
    };
  }

  dragState.startClientX = event.clientX;
  dragState.startClientY = event.clientY;
  dragState.didMove = false;
  dragState.pointerId = event.pointerId;
  dragState.suppressClick = false;
  elements.floorplan.setPointerCapture(event.pointerId);
  setArchitectDragging(true);
};

const startCommentDrag = (event, marker) => {
  if (!state.isArchitectMode) return;
  const data = getCommentDragData(marker);
  if (!data) return;
  const pointer = getFloorplanPoint(event);
  dragState.active = true;
  dragState.type = "comment";
  dragState.axis = null;
  dragState.startPointerX = pointer.x;
  dragState.startPointerY = pointer.y;
  dragState.context = {
    ...data,
    offsetX: pointer.x - data.comment.x,
    offsetY: pointer.y - data.comment.y,
  };
  dragState.startClientX = event.clientX;
  dragState.startClientY = event.clientY;
  dragState.didMove = false;
  dragState.pointerId = event.pointerId;
  dragState.suppressClick = false;
  elements.floorplan.setPointerCapture(event.pointerId);
  hideCommentTooltip();
  setArchitectDragging(true);
};

const handleArchitectPointerMove = (event) => {
  if (state.isExteriorMode) return;
  if (
    state.isArchitectMode &&
    state.architectTool === "room" &&
    state.roomDraft &&
    !dragState.active
  ) {
    updateRoomDraft(getFloorplanPoint(event));
    return;
  }
  if (!dragState.active || event.pointerId !== dragState.pointerId) return;

  const pointer = getFloorplanPoint(event);
  const axisValue = dragState.axis === "x" ? pointer.x : pointer.y;
  const delta = axisValue - dragState.startPointerAxis;
  const movedDistance = Math.hypot(
    event.clientX - dragState.startClientX,
    event.clientY - dragState.startClientY,
  );
  if (!dragState.didMove) {
    if (movedDistance < DRAG_THRESHOLD_PX) {
      return;
    }
    dragState.didMove = true;
  }

  if (dragState.type === "wall") {
    const { floor, wallMeta, affectedRooms, constraints } = dragState.context;
    const newPosition = clamp(
      dragState.startPosition + delta,
      constraints.min,
      constraints.max,
    );
    if (Math.abs(newPosition - dragState.lastPosition) < 0.1) return;
    applyWallPosition(floor, wallMeta, affectedRooms, newPosition);
    updateOpeningsForWallMove(
      floor,
      wallMeta,
      dragState.lastPosition,
      newPosition,
    );
    dragState.lastPosition = newPosition;
  } else if (dragState.type === "room") {
    const { floor, room, startX, startY } = dragState.context;
    const maxX = Math.max(
      floorBounds.x,
      floorBounds.x + floorBounds.width - room.width,
    );
    const maxY = Math.max(
      floorBounds.y,
      floorBounds.y + floorBounds.height - room.height,
    );
    const newX = clamp(
      startX + (pointer.x - dragState.startPointerX),
      floorBounds.x,
      maxX,
    );
    const newY = clamp(
      startY + (pointer.y - dragState.startPointerY),
      floorBounds.y,
      maxY,
    );
    const deltaX = newX - room.x;
    const deltaY = newY - room.y;
    if (Math.abs(deltaX) < 0.1 && Math.abs(deltaY) < 0.1) return;
    room.x = newX;
    room.y = newY;
    translateOpeningsForRoom(floor, room.id, deltaX, deltaY);
  } else if (dragState.type === "opening") {
    const { opening, floor } = dragState.context;
    const targetWall = getClosestWallForPointInFloor(
      floor,
      pointer,
      dragState.context.length,
      opening.roomId,
    );
    if (!targetWall) return;
    const { room } = targetWall;
    const bounds = getOpeningBoundsForWall(
      room,
      targetWall.side,
      targetWall.axis,
    );
    const span = Math.max(0, bounds.end - bounds.start);
    const length =
      dragState.context.length <= span ? dragState.context.length : span;
    const positionBounds = getOpeningPositionBounds(bounds, length);
    const axisValue = targetWall.axis === "x" ? pointer.x : pointer.y;
    const newCenter = clamp(axisValue, positionBounds.min, positionBounds.max);
    if (
      targetWall.axis === dragState.axis &&
      Math.abs(newCenter - dragState.lastPosition) < 0.1
    )
      return;
    setOpeningOnWall(
      opening,
      targetWall.axis,
      targetWall.position,
      newCenter,
      length,
    );
    opening.roomId = room.id;
    dragState.context.room = room;
    dragState.axis = targetWall.axis;
    dragState.lastPosition = newCenter;
    dragState.context.length = length;
  } else if (dragState.type === "comment") {
    const { comment, room, offsetX, offsetY } = dragState.context || {};
    if (!comment || !room) return;
    const newX = clamp(pointer.x - offsetX, room.x, room.x + room.width);
    const newY = clamp(pointer.y - offsetY, room.y, room.y + room.height);
    if (Math.abs(newX - comment.x) < 0.1 && Math.abs(newY - comment.y) < 0.1) {
      return;
    }
    comment.x = newX;
    comment.y = newY;
  }

  renderFloorplan();
};

const finishArchitectDrag = () => {
  if (!dragState.active) return;
  if (dragState.pointerId !== null) {
    try {
      elements.floorplan.releasePointerCapture(dragState.pointerId);
    } catch {
      // Ignore release failures when pointer capture is already cleared.
    }
  }

  if (dragState.didMove) {
    saveState();
    renderFloorplan();
    renderArchitectPanel();
    if (dragState.type === "wall") {
      const roomId = dragState.context?.room?.id;
      if (roomId) {
        renderRoomPanel();
        update3DScene(roomId);
      }
    }
    if (dragState.type === "room") {
      const roomId = dragState.context?.room?.id;
      if (roomId) {
        renderRoomPanel();
        update3DScene(roomId);
      }
    }
    if (dragState.type === "opening") {
      const { opening, startRoomId } = dragState.context || {};
      if (opening?.roomId && opening.roomId !== startRoomId) {
        state.activeRoomId = opening.roomId;
        if (state.selectedElement) {
          state.selectedElement.roomId = opening.roomId;
        }
        renderRoomPanel();
      }
    }
  }

  dragState.suppressClick = dragState.didMove;
  resetDragState({ keepSuppressClick: true });
  if (dragState.suppressClick) {
    window.setTimeout(() => {
      dragState.suppressClick = false;
    }, 0);
  }
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
    if (dragState.suppressClick) {
      dragState.suppressClick = false;
      return;
    }
    if (state.isExteriorMode) {
      if (state.isAddingComment) {
        handleAddComment(event);
        return;
      }
      const marker = target?.closest?.(".comment-marker");
      if (focusCommentFromMarker(marker)) {
        return;
      }
      const roomTarget = target?.closest?.(".room-hit");
      const roomId = roomTarget?.dataset?.roomId;
      if (roomId) {
        const room = findRoomById(roomId);
        if (room && isExteriorRoom(room)) {
          selectRoom(roomId);
        }
      }
      return;
    }
    if (state.isArchitectMode) {
      const hitTarget = target?.closest?.(".architect-hit");
      const point = getFloorplanPoint(event);
      if (state.architectTool === "door") {
        addOpeningAtPoint("door", point);
        return;
      }
      if (state.architectTool === "window") {
        addOpeningAtPoint("window", point);
        return;
      }
      if (state.architectTool === "room") {
        if (state.roomDraft) {
          state.roomDraft.currentX = point.x;
          state.roomDraft.currentY = point.y;
          commitRoomDraft();
        } else {
          beginRoomDraft(point);
        }
        return;
      }
      if (hitTarget) {
        selectArchitectElement(hitTarget);
        return;
      }
    }

    if (state.isAddingComment) {
      handleAddComment(event);
      return;
    }

    const marker = target?.closest?.(".comment-marker");
    if (focusCommentFromMarker(marker)) {
      return;
    }

    if (target.classList.contains("room-hit")) {
      selectRoom(target.dataset.roomId);
    }
  });

  elements.floorplan.addEventListener("pointerdown", (event) => {
    const target = event.target;
    const marker = target?.closest?.(".comment-marker");
    if (marker) {
      if (state.isExteriorMode) {
        const room = findRoomById(marker.dataset.roomId);
        if (!room || !isExteriorRoom(room)) {
          return;
        }
      }
      if (!state.isArchitectMode) {
        return;
      }
      event.preventDefault();
      startCommentDrag(event, marker);
      return;
    }
    if (state.isExteriorMode) return;
    if (!state.isArchitectMode || state.architectTool !== "select") return;
    const hitTarget = target?.closest?.(".architect-hit");
    if (!hitTarget) return;
    event.preventDefault();
    startArchitectDrag(event, hitTarget);
  });

  elements.floorplan.addEventListener(
    "pointermove",
    handleArchitectPointerMove,
  );
  elements.floorplan.addEventListener("pointerup", finishArchitectDrag);
  elements.floorplan.addEventListener("pointercancel", finishArchitectDrag);
  elements.floorplan.addEventListener("pointermove", (event) => {
    const target = event.target;
    const marker = target?.closest?.(".comment-marker");
    if (marker) {
      if (state.isExteriorMode) {
        const room = findRoomById(marker.dataset.roomId);
        if (!room || !isExteriorRoom(room)) {
          hideCommentTooltip();
          return;
        }
      }
      showCommentTooltipForMarker(marker);
      return;
    }
    hideCommentTooltip();
  });
  elements.floorplan.addEventListener("pointerleave", () => {
    hideCommentTooltip();
  });
  elements.floorplan.addEventListener("contextmenu", (event) => {
    const target = event.target;
    const marker = target?.closest?.(".comment-marker");
    if (!marker) return;
    const roomId = marker.dataset.roomId;
    const commentId = marker.dataset.commentId;
    if (!roomId || !commentId) return;
    if (state.isExteriorMode) {
      const room = findRoomById(roomId);
      if (!room || !isExteriorRoom(room)) {
        return;
      }
    }
    const comment = getCommentById(roomId, commentId);
    if (!comment) return;
    event.preventDefault();
    hideCommentTooltip();
    openCommentContextMenu(event, comment, roomId);
  });

  elements.floorplan.addEventListener("mouseover", (event) => {
    if (
      !state.isArchitectMode ||
      state.isExteriorMode ||
      state.architectTool !== "select"
    )
      return;
    const target = event.target;
    const hitTarget = target?.closest?.(".architect-hit");
    if (hitTarget) {
      clearHoverState();
      hitTarget.classList.add("hovered");
    }
  });

  elements.floorplan.addEventListener("mouseout", (event) => {
    if (
      !state.isArchitectMode ||
      state.isExteriorMode ||
      state.architectTool !== "select"
    )
      return;
    const target = event.target;
    const hitTarget = target?.closest?.(".architect-hit");
    if (hitTarget && !hitTarget.contains(event.relatedTarget)) {
      hitTarget.classList.remove("hovered");
    }
  });

  elements.addCommentBtn.addEventListener("click", () => {
    const activeRoom = state.activeRoomId
      ? findRoomById(state.activeRoomId)
      : null;
    if (state.isExteriorMode && !isExteriorRoom(activeRoom)) {
      return;
    }
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

  elements.comments?.addEventListener("contextmenu", (event) => {
    const target = event.target;
    const item = target?.closest?.("li");
    if (!item?.dataset?.commentId) return;
    const roomId = item.dataset.roomId || state.activeRoomId;
    const comment = getCommentById(roomId, item.dataset.commentId);
    if (!comment) return;
    event.preventDefault();
    openCommentContextMenu(event, comment, roomId);
  });

  elements.commentContextMenu?.addEventListener("click", (event) => {
    const target = event.target;
    const actionButton = target?.closest?.("button[data-action]");
    if (!actionButton || actionButton.disabled) return;
    const action = actionButton.dataset.action;
    if (!action) return;
    handleCommentContextAction(action);
    closeCommentContextMenu();
  });

  elements.taskPlanMenu?.addEventListener("click", (event) => {
    const target = event.target;
    const actionButton = target?.closest?.("button[data-action]");
    if (!actionButton || actionButton.disabled) return;
    const action = actionButton.dataset.action;
    if (!action) return;
    const taskId = taskPlanMenuState.taskId;
    closeTaskPlanMenu();
    handleTaskPlanMenuAction(action, taskId);
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

  if (elements.mobileRoomSelect) {
    elements.mobileRoomSelect.addEventListener("change", (event) => {
      const roomId = event.target.value;
      if (!roomId) {
        selectRoom(null);
        return;
      }
      const floorId = getFloorIdForRoom(roomId);
      if (floorId && floorId !== state.activeFloorId) {
        setActiveFloor(floorId);
      }
      selectRoom(roomId);
    });
  }

  if (elements.viewButtons?.length) {
    elements.viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.appView;
        if (!view) return;
        setActiveView(view);
        renderTasksPanel();
      });
    });
  }

  if (elements.taskViewButtons?.length) {
    elements.taskViewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.taskView;
        if (!view) return;
        state.taskFilters.view = TASK_VIEW_PRESETS[view] ? view : "all";
        clearTaskSelection();
        renderTasksPanel();
      });
    });
  }

  if (elements.taskViewButtons?.length) {
    elements.taskViewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.taskView;
        if (!view || !TASK_VIEW_PRESETS[view]) return;
        if (state.taskFilters.view === view) return;
        state.taskFilters.view = view;
        clearTaskSelection();
        renderTasksPanel();
      });
    });
  }

  if (elements.roomTabButtons?.length) {
    elements.roomTabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tab = button.dataset.roomTab;
        if (tab) {
          setActiveRoomTab(tab);
        }
      });
    });
  }

  elements.taskForm?.addEventListener("submit", handleTaskSubmit);
  elements.taskCreateForm?.addEventListener("submit", handleTaskCreateSubmit);
  elements.taskFilterRoom?.addEventListener("change", handleTaskFilterChange);
  elements.taskFilterStatus?.addEventListener("change", handleTaskFilterChange);
  elements.taskFilterAssignee?.addEventListener(
    "change",
    handleTaskFilterChange,
  );
  elements.taskFilterTag?.addEventListener("change", handleTaskFilterChange);
  elements.taskFilterSearch?.addEventListener("input", handleTaskFilterChange);
  elements.tasksReset?.addEventListener("click", resetTaskFilters);
  elements.taskSelectAll?.addEventListener("change", handleTaskSelectAll);
  elements.taskBulkDone?.addEventListener("click", handleTaskBulkDone);
  elements.taskBulkAssign?.addEventListener("click", handleTaskBulkAssign);
  elements.taskBulkDueApply?.addEventListener("click", handleTaskBulkDueDate);
  elements.taskBulkAssignee?.addEventListener("input", () =>
    updateTaskSelectionState(),
  );
  elements.taskBulkAssignee?.addEventListener("change", () =>
    updateTaskSelectionState(),
  );
  elements.taskBulkDueDate?.addEventListener("input", () =>
    updateTaskSelectionState(),
  );
  elements.taskBulkDueDate?.addEventListener("change", () =>
    updateTaskSelectionState(),
  );
  elements.taskModalForm?.addEventListener("submit", handleTaskModalSubmit);
  elements.taskStartDate?.addEventListener(
    "change",
    updateTaskDateSummaryFromInputs,
  );
  elements.taskEndDate?.addEventListener(
    "change",
    updateTaskDateSummaryFromInputs,
  );
  elements.taskModalClose?.addEventListener("click", closeTaskModal);
  elements.taskModalCancel?.addEventListener("click", closeTaskModal);
  elements.taskModal?.addEventListener("click", (event) => {
    if (event.target === elements.taskModal) {
      closeTaskModal();
    }
  });
  elements.taskModalChat?.addEventListener("click", () => {
    const task = getTaskFromModal();
    if (!task) return;
    openChatModal({ scope: "task", taskId: task.id });
  });
  elements.taskDependencyToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDependencyPicker();
  });
  elements.taskDependencyClose?.addEventListener(
    "click",
    closeDependencyPicker,
  );
  elements.emailUnlinkedToggle?.addEventListener(
    "click",
    toggleEmailUnlinkedPanel,
  );
  elements.ganttChart?.addEventListener("pointerdown", handleGanttPointerDown);
  elements.roomChatTrigger?.addEventListener("click", () => {
    if (!state.activeRoomId) return;
    openChatModal({ scope: "room", roomId: state.activeRoomId });
  });
  elements.chatForm?.addEventListener("submit", handleChatSubmit);
  elements.chatInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    elements.chatForm?.requestSubmit();
  });
  elements.chatModalClose?.addEventListener("click", closeChatModal);
  elements.chatModal?.addEventListener("click", (event) => {
    if (event.target === elements.chatModal) {
      closeChatModal();
    }
  });
  elements.helpButton?.addEventListener("click", openHelpModal);
  elements.activityNotification?.addEventListener(
    "click",
    handleActivityNotificationClick,
  );
  elements.helpModalClose?.addEventListener("click", closeHelpModal);
  elements.helpModal?.addEventListener("click", (event) => {
    if (event.target === elements.helpModal) {
      closeHelpModal();
    }
  });
  elements.emailAccountsButton?.addEventListener(
    "click",
    openEmailAccountsModal,
  );
  elements.emailAccountsClose?.addEventListener(
    "click",
    closeEmailAccountsModal,
  );
  elements.emailAccountsModal?.addEventListener("click", (event) => {
    if (event.target === elements.emailAccountsModal) {
      closeEmailAccountsModal();
    }
  });
  elements.emailAccountsRefresh?.addEventListener(
    "click",
    handleEmailAccountsRefresh,
  );
  elements.securityModal?.addEventListener("click", (event) => {
    if (event.target === elements.securityModal) {
      closeSecurityModal();
    }
  });
  elements.reauthModal?.addEventListener("click", (event) => {
    if (event.target === elements.reauthModal) {
      closeReauthModal();
    }
  });

  elements.imageEditForm?.addEventListener("submit", handleImageEditSubmit);
  elements.imageModalClose?.addEventListener("click", closeImageModal);
  elements.imageModal?.addEventListener("click", (event) => {
    if (event.target === elements.imageModal) {
      closeImageModal();
    }
  });
  elements.imageModalPreview?.addEventListener("load", () => {
    if (imageMaskState.active) {
      resetImageMaskCanvas();
    }
  });
  elements.imageMaskToggle?.addEventListener("click", () =>
    setImageMaskActive(!imageMaskState.active),
  );
  elements.imageMaskClear?.addEventListener("click", () => {
    if (!imageMaskState.active) {
      setImageMaskActive(true);
    } else {
      resetImageMaskCanvas();
    }
  });
  elements.imageMaskSize?.addEventListener("input", (event) => {
    imageMaskState.brushSize = Number(event.target.value) || 28;
  });
  if (elements.imageMaskCanvas) {
    elements.imageMaskCanvas.addEventListener(
      "pointerdown",
      handleImageMaskPointerDown,
    );
    elements.imageMaskCanvas.addEventListener(
      "pointermove",
      handleImageMaskPointerMove,
    );
    elements.imageMaskCanvas.addEventListener(
      "pointerup",
      handleImageMaskPointerUp,
    );
    elements.imageMaskCanvas.addEventListener(
      "pointerleave",
      handleImageMaskPointerUp,
    );
    elements.imageMaskCanvas.addEventListener(
      "pointercancel",
      handleImageMaskPointerUp,
    );
  }
  elements.imagePinApply?.addEventListener("click", handleImagePinApply);
  elements.imagePinClear?.addEventListener("click", handleImagePinClear);
  elements.imageDeleteBtn?.addEventListener("click", () => {
    if (!imageModalState.imageId || !imageModalState.roomId) return;
    removeImage(imageModalState.imageId, imageModalState.roomId);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (commentContextState.isOpen) {
      closeCommentContextMenu();
    }
    if (taskPlanMenuState.isOpen) {
      closeTaskPlanMenu();
    }
    if (taskModalState.dependencyPickerOpen) {
      closeDependencyPicker();
    }
    if (imageModalState.isOpen) {
      closeImageModal();
    }
    if (chatModalState.isOpen) {
      closeChatModal();
    }
  });
  document.addEventListener("click", (event) => {
    if (
      commentContextState.isOpen &&
      !elements.commentContextMenu?.contains(event.target)
    ) {
      closeCommentContextMenu();
    }
    if (
      taskPlanMenuState.isOpen &&
      !elements.taskPlanMenu?.contains(event.target)
    ) {
      closeTaskPlanMenu();
    }
    if (
      taskModalState.dependencyPickerOpen &&
      !elements.taskDependencyPicker?.contains(event.target) &&
      !elements.taskDependencyToggle?.contains(event.target)
    ) {
      closeDependencyPicker();
    }
  });
  window.addEventListener("resize", closeCommentContextMenu);
  window.addEventListener("resize", closeTaskPlanMenu);
  window.addEventListener("resize", scheduleGanttLinksUpdate);
  window.addEventListener("scroll", closeCommentContextMenu, true);
  window.addEventListener("scroll", closeTaskPlanMenu, true);

  elements.decisionForm?.addEventListener("submit", handleDecisionSubmit);
  elements.generateImageBtn.addEventListener("click", handleGenerateImage);
  elements.uploadImageInput.addEventListener("change", handleUploadImage);
  elements.addEvidenceLinkBtn?.addEventListener("click", handleAddEvidenceLink);
  elements.evidenceRoomSelect?.addEventListener("change", () => {
    renderEvidenceUploadTargets();
  });
  elements.taskFileUpload?.addEventListener("change", handleTaskFileUpload);
  elements.taskFileLink?.addEventListener("click", handleTaskFileLink);
  elements.setApiKeyBtn?.addEventListener("click", handleSetApiKey);
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.magicLinkBtn?.addEventListener("click", handleMagicLink);
  elements.resetPasswordBtn?.addEventListener(
    "click",
    handlePasswordResetRequest,
  );
  elements.signupForm?.addEventListener("submit", handleSignup);
  elements.passwordResetForm?.addEventListener("submit", handlePasswordUpdate);
  elements.signOutBtn?.addEventListener("click", handleSignOut);
  elements.securitySettingsBtn?.addEventListener("click", openSecurityModal);
  elements.securityModalClose?.addEventListener("click", closeSecurityModal);
  elements.security2faStart?.addEventListener("click", handleSecurityStart);
  elements.security2faConfirm?.addEventListener("click", handleSecurityConfirm);
  elements.security2faDisable?.addEventListener("click", handleSecurityDisable);
  elements.reauthModalClose?.addEventListener("click", closeReauthModal);
  elements.reauthForm?.addEventListener("submit", handleReauthSubmit);
  elements.emailConnectGmail?.addEventListener("click", () =>
    startEmailConnect("gmail"),
  );
  elements.emailConnectMicrosoft?.addEventListener("click", () =>
    startEmailConnect("microsoft"),
  );
  elements.emailPanelRefresh?.addEventListener(
    "click",
    handleEmailPanelRefresh,
  );
  elements.emailReplyTranslate?.addEventListener(
    "click",
    handleEmailReplyTranslate,
  );
  elements.emailReplySend?.addEventListener("click", handleEmailReplySend);

  elements.toggleArchitect.addEventListener("change", (event) => {
    setArchitectMode(event.target.checked);
  });

  if (elements.exteriorToggle) {
    elements.exteriorToggle.addEventListener("change", (event) => {
      setExteriorMode(event.target.checked);
    });
  }

  if (elements.architectToolButtons?.length) {
    elements.architectToolButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tool = button.dataset.architectTool;
        if (!tool) return;
        setArchitectTool(tool);
      });
    });
  }

  elements.threeDButton.addEventListener("click", () => {
    if (state.isExteriorMode) return;
    state.show3d = !state.show3d;
    elements.threeDPanel.classList.toggle("open", state.show3d);
    elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";
    if (state.show3d && state.activeRoomId) {
      update3DScene(state.activeRoomId);
    }
  });

  if (elements.threeDStage) {
    elements.threeDStage.addEventListener("pointerdown", startThreeDDrag);
    elements.threeDStage.addEventListener("pointermove", moveThreeDDrag);
    elements.threeDStage.addEventListener("pointerup", endThreeDDrag);
    elements.threeDStage.addEventListener("pointerleave", endThreeDDrag);
    elements.threeDStage.addEventListener("pointercancel", endThreeDDrag);
    elements.threeDStage.addEventListener("wheel", handleThreeDWheel, {
      passive: false,
    });
  }

  if (elements.threeDViewButtons?.length) {
    elements.threeDViewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const view = button.dataset.view;
        if (!view || !THREE_D_VIEW_PRESETS[view]) return;
        updateActiveRoomScene({ view }, { resetCamera: true });
      });
    });
  }

  elements.threeDReset?.addEventListener("click", () => {
    if (!state.activeRoomId) return;
    update3DScene(state.activeRoomId, { resetCamera: true });
  });

  if (elements.measurementLock) {
    elements.measurementLock.addEventListener("change", () => {
      state.wallLinkLocked = elements.measurementLock.checked;
      renderArchitectPanel();
    });
  }
  syncRangeNumber(elements.measurementAxis, elements.measurementAxisNumber);
  syncRangeNumber(elements.measurementSpan, elements.measurementSpanNumber);
  syncRangeNumber(elements.measurementHeight, elements.measurementHeightNumber);
  [elements.measurementAxis, elements.measurementAxisNumber].forEach(
    (input) => {
      if (!input) return;
      input.addEventListener("input", () =>
        applyArchitectAdjustments({ commit: false, refreshPanel: false }),
      );
      input.addEventListener("change", () =>
        applyArchitectAdjustments({ commit: true, refreshPanel: true }),
      );
    },
  );
  [elements.measurementSpan, elements.measurementSpanNumber].forEach(
    (input) => {
      if (!input) return;
      input.addEventListener("input", () =>
        applyArchitectAdjustments({ commit: false, refreshPanel: false }),
      );
      input.addEventListener("change", () =>
        applyArchitectAdjustments({ commit: true, refreshPanel: true }),
      );
    },
  );
  [elements.measurementHeight, elements.measurementHeightNumber].forEach(
    (input) => {
      if (!input) return;
      input.addEventListener("input", () =>
        applyArchitectAdjustments({ commit: false, refreshPanel: false }),
      );
      input.addEventListener("change", () =>
        applyArchitectAdjustments({ commit: true, refreshPanel: true }),
      );
    },
  );
  if (elements.measurementSwing) {
    elements.measurementSwing.addEventListener("change", () =>
      applyArchitectAdjustments({ commit: true, refreshPanel: true }),
    );
  }
  elements.measurementForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyArchitectAdjustments({ commit: true, refreshPanel: true });
  });

  MOBILE_MEDIA_QUERY.addEventListener("change", () => {
    updateMobileLayout();
  });
};

const init = () => {
  captureEmailOAuthParams();
  hydrateStateFromLocal();
  initChatControls();
  void fetchChatConfig({ force: false });
  state.isMobileView = MOBILE_MEDIA_QUERY.matches;
  document.body.classList.toggle("is-mobile", state.isMobileView);
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  renderTasksPanel();
  renderMobileRoomSelect();
  setArchitectMode(state.isArchitectMode);
  updateFloorButtons();
  updateInteriorControls();
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
