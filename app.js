const floorplanSize = { width: 800, height: 520 };

const rooms = [
  { id: "bedroom-left", name: "Schlafzimmer", x: 40, y: 40, width: 220, height: 140 },
  { id: "living", name: "Wohnzimmer", x: 260, y: 40, width: 280, height: 140 },
  { id: "bedroom-right", name: "Schlafzimmer", x: 560, y: 40, width: 200, height: 220 },
  { id: "cellar", name: "Keller", x: 40, y: 200, width: 200, height: 220 },
  { id: "kitchen", name: "Küche", x: 260, y: 200, width: 200, height: 180 },
  { id: "bathroom", name: "Bad", x: 480, y: 200, width: 180, height: 180 },
  { id: "hallway", name: "Flur", x: 300, y: 390, width: 220, height: 90 },
  { id: "storage", name: "Abstellschrank", x: 300, y: 450, width: 140, height: 50 },
];

const openings = [
  {
    id: "window-left",
    type: "window",
    roomId: "bedroom-left",
    label: "Fenster Schlafzimmer links",
    x1: 80,
    y1: 30,
    x2: 200,
    y2: 30,
  },
  {
    id: "window-living",
    type: "window",
    roomId: "living",
    label: "Fenster Wohnzimmer",
    x1: 320,
    y1: 30,
    x2: 480,
    y2: 30,
  },
  {
    id: "window-right",
    type: "window",
    roomId: "bedroom-right",
    label: "Fenster Schlafzimmer rechts",
    x1: 600,
    y1: 30,
    x2: 720,
    y2: 30,
  },
  {
    id: "door-living-hall",
    type: "door",
    roomId: "living",
    label: "Tür Wohnzimmer → Flur",
    x1: 360,
    y1: 190,
    x2: 440,
    y2: 190,
  },
  {
    id: "door-kitchen-hall",
    type: "door",
    roomId: "kitchen",
    label: "Tür Küche → Flur",
    x1: 330,
    y1: 390,
    x2: 390,
    y2: 390,
  },
  {
    id: "door-bathroom-hall",
    type: "door",
    roomId: "bathroom",
    label: "Tür Bad → Flur",
    x1: 540,
    y1: 390,
    x2: 600,
    y2: 390,
  },
  {
    id: "door-bedroom-right",
    type: "door",
    roomId: "bedroom-right",
    label: "Tür Schlafzimmer rechts",
    x1: 560,
    y1: 170,
    x2: 560,
    y2: 200,
  },
  {
    id: "door-cellar",
    type: "door",
    roomId: "cellar",
    label: "Tür Keller",
    x1: 200,
    y1: 200,
    x2: 240,
    y2: 200,
  },
];

const defaultMeasurements = {
  "bedroom-left": { width: 3600, length: 2800, height: 2800 },
  living: { width: 5200, length: 3000, height: 2800 },
  "bedroom-right": { width: 3200, length: 4200, height: 2800 },
  cellar: { width: 3000, length: 4000, height: 2800 },
  kitchen: { width: 3200, length: 3500, height: 2800 },
  bathroom: { width: 2800, length: 3200, height: 2800 },
  hallway: { width: 4200, length: 1800, height: 2800 },
  storage: { width: 1600, length: 900, height: 2800 },
};

const users = [
  { id: "user-1", name: "Wolfgang" },
  { id: "user-2", name: "Konstantin" },
];

const state = {
  activeRoomId: null,
  isAddingComment: false,
  isArchitectMode: false,
  activeUserId: users[0].id,
  roomData: {},
  roomMeasurements: {},
  selectedElement: null,
  show3d: false,
};

const elements = {
  floorplan: document.getElementById("floorplan"),
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
  measurementForm: document.getElementById("measurement-form"),
  measurementWidth: document.getElementById("measure-width"),
  measurementLength: document.getElementById("measure-length"),
  measurementHeight: document.getElementById("measure-height"),
  activeUserSelect: document.getElementById("active-user"),
  threeDPanel: document.getElementById("three-d-panel"),
  threeDButton: document.getElementById("toggle-3d"),
  threeDLabel: document.getElementById("three-d-label"),
};

const storageKey = "house-builder-state";

const defaultRoomData = () => ({
  checklist: [],
  images: [],
  comments: [],
});

const saveState = () => {
  const payload = {
    roomData: state.roomData,
    roomMeasurements: state.roomMeasurements,
    activeUserId: state.activeUserId,
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
};

const loadState = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.roomMeasurements = { ...defaultMeasurements };
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.roomData = parsed.roomData || {};
    state.roomMeasurements = parsed.roomMeasurements || { ...defaultMeasurements };
    state.activeUserId = parsed.activeUserId || users[0].id;
  } catch (error) {
    state.roomMeasurements = { ...defaultMeasurements };
  }
};

const ensureRoomData = (roomId) => {
  if (!state.roomData[roomId]) {
    state.roomData[roomId] = defaultRoomData();
  }
  return state.roomData[roomId];
};

const renderUsers = () => {
  elements.activeUserSelect.innerHTML = "";
  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    if (user.id === state.activeUserId) {
      option.selected = true;
    }
    elements.activeUserSelect.appendChild(option);
  });
};

const renderFloorplan = () => {
  elements.floorplan.innerHTML = "";

  const outline = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  outline.setAttribute("x", 20);
  outline.setAttribute("y", 20);
  outline.setAttribute("width", 760);
  outline.setAttribute("height", 480);
  outline.setAttribute("class", "outer-wall");
  elements.floorplan.appendChild(outline);

  rooms.forEach((room) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", room.x);
    rect.setAttribute("y", room.y);
    rect.setAttribute("width", room.width);
    rect.setAttribute("height", room.height);
    rect.setAttribute("class", `room${state.activeRoomId === room.id ? " active" : ""}`);
    rect.dataset.roomId = room.id;

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", room.x + 12);
    label.setAttribute("y", room.y + 28);
    label.setAttribute("class", "room-label");
    label.textContent = room.name;

    elements.floorplan.appendChild(rect);
    elements.floorplan.appendChild(label);
  });

  rooms.forEach((room) => {
    const wallSegments = [
      { x1: room.x, y1: room.y, x2: room.x + room.width, y2: room.y, position: "oben" },
      {
        x1: room.x + room.width,
        y1: room.y,
        x2: room.x + room.width,
        y2: room.y + room.height,
        position: "rechts",
      },
      {
        x1: room.x,
        y1: room.y + room.height,
        x2: room.x + room.width,
        y2: room.y + room.height,
        position: "unten",
      },
      { x1: room.x, y1: room.y, x2: room.x, y2: room.y + room.height, position: "links" },
    ];

    wallSegments.forEach((wall) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", wall.x1);
      line.setAttribute("y1", wall.y1);
      line.setAttribute("x2", wall.x2);
      line.setAttribute("y2", wall.y2);
      line.setAttribute("class", "wall-line");
      line.dataset.roomId = room.id;
      line.dataset.elementType = "wall";
      line.dataset.elementLabel = `${room.name} – Wand ${wall.position}`;
      elements.floorplan.appendChild(line);
    });
  });

  openings.forEach((opening) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", opening.x1);
    line.setAttribute("y1", opening.y1);
    line.setAttribute("x2", opening.x2);
    line.setAttribute("y2", opening.y2);
    line.setAttribute("class", opening.type === "door" ? "door-marker" : "window-marker");
    line.dataset.roomId = opening.roomId;
    line.dataset.elementType = opening.type;
    line.dataset.elementLabel = opening.label;
    elements.floorplan.appendChild(line);
  });

  rooms.forEach((room) => {
    const roomData = ensureRoomData(room.id);
    roomData.comments.forEach((comment) => {
      const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle");
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
    elements.roomSubtitle.textContent = "Klicken Sie auf einen Raum im Grundriss, um Details zu sehen.";
    elements.checklist.innerHTML = "";
    elements.comments.innerHTML = "";
    elements.imageGallery.innerHTML = "";
    elements.threeDPanel.hidden = true;
    return;
  }

  const room = rooms.find((item) => item.id === state.activeRoomId);
  const roomData = ensureRoomData(state.activeRoomId);

  elements.roomTitle.textContent = room.name;
  elements.roomSubtitle.textContent = "Aufgaben bearbeiten, Fotos ansehen oder Notizen hinterlassen.";
  elements.threeDLabel.textContent = `3D-Ansicht für ${room.name}`;
  elements.threeDPanel.hidden = false;
  elements.threeDPanel.classList.toggle("open", state.show3d);
  elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";

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
    const user = users.find((item) => item.id === comment.userId);
    li.textContent = `${user ? user.name : "Unbekannt"}: ${comment.text}`;
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
    elements.measurementForm.hidden = true;
    return;
  }

  const { roomId, label } = state.selectedElement;
  const measurement = state.roomMeasurements[roomId];
  elements.architectTitle.textContent = label;
  elements.measurementForm.hidden = false;
  elements.measurementWidth.value = measurement.width;
  elements.measurementLength.value = measurement.length;
  elements.measurementHeight.value = measurement.height;
};

const selectRoom = (roomId) => {
  state.activeRoomId = roomId;
  state.isAddingComment = false;
  state.show3d = false;
  renderFloorplan();
  renderRoomPanel();
};

const selectArchitectElement = (target) => {
  const roomId = target.dataset.roomId;
  const label = target.dataset.elementLabel || "Element";
  if (!roomId) {
    return;
  }
  state.selectedElement = { roomId, label };
  renderArchitectPanel();
};

const handleAddComment = (event) => {
  if (!state.activeRoomId || !state.isAddingComment) {
    return;
  }

  const bounds = elements.floorplan.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * floorplanSize.width;
  const y = ((event.clientY - bounds.top) / bounds.height) * floorplanSize.height;

  const room = rooms.find((item) => item.id === state.activeRoomId);
  const withinRoom =
    x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height;

  if (!withinRoom) {
    return;
  }

  const commentText = window.prompt("Wie lautet der Kommentar?");
  if (!commentText) {
    return;
  }

  const roomData = ensureRoomData(state.activeRoomId);
  roomData.comments.unshift({
    id: `comment-${Date.now()}`,
    userId: state.activeUserId,
    text: commentText,
    x,
    y,
  });

  state.isAddingComment = false;
  saveState();
  renderFloorplan();
  renderComments(roomData);
};

const handleChecklistSubmit = (event) => {
  event.preventDefault();
  if (!state.activeRoomId) {
    return;
  }
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

const handleGenerateImage = () => {
  if (!state.activeRoomId) {
    return;
  }
  const promptText = window.prompt("Beschreiben Sie das Bild, das erzeugt werden soll.");
  if (!promptText) {
    return;
  }

  const roomData = ensureRoomData(state.activeRoomId);
  roomData.images.unshift({
    id: `img-${Date.now()}`,
    label: `ChatGPT-Anfrage: ${promptText}`,
  });
  saveState();
  renderImages(roomData);
};

const handleUploadImage = (event) => {
  if (!state.activeRoomId) {
    return;
  }
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
  if (!state.selectedElement) {
    return;
  }
  const roomId = state.selectedElement.roomId;
  state.roomMeasurements[roomId] = {
    width: Number(elements.measurementWidth.value) || 0,
    length: Number(elements.measurementLength.value) || 0,
    height: state.roomMeasurements[roomId].height,
  };
  saveState();
};

const bindEvents = () => {
  elements.floorplan.addEventListener("click", (event) => {
    const target = event.target;
    if (state.isArchitectMode) {
      if (
        target.classList.contains("wall-line") ||
        target.classList.contains("door-marker") ||
        target.classList.contains("window-marker")
      ) {
        selectArchitectElement(target);
        return;
      }
    }

    if (state.isAddingComment) {
      handleAddComment(event);
      return;
    }

    if (target.classList.contains("room")) {
      selectRoom(target.dataset.roomId);
    }
  });

  elements.addCommentBtn.addEventListener("click", () => {
    state.isAddingComment = true;
  });

  elements.clearSelectionBtn.addEventListener("click", () => {
    selectRoom(null);
  });

  elements.checklistForm.addEventListener("submit", handleChecklistSubmit);
  elements.generateImageBtn.addEventListener("click", handleGenerateImage);
  elements.uploadImageInput.addEventListener("change", handleUploadImage);

  elements.toggleArchitect.addEventListener("change", (event) => {
    state.isArchitectMode = event.target.checked;
    elements.architectView.hidden = !state.isArchitectMode;
    state.selectedElement = null;
    renderArchitectPanel();
  });

  elements.activeUserSelect.addEventListener("change", (event) => {
    state.activeUserId = event.target.value;
    saveState();
  });

  elements.threeDButton.addEventListener("click", () => {
    state.show3d = !state.show3d;
    elements.threeDPanel.classList.toggle("open", state.show3d);
    elements.threeDButton.textContent = state.show3d ? "Schließen" : "Öffnen";
  });

  elements.measurementForm.addEventListener("submit", handleMeasurementSubmit);
};

const init = () => {
  loadState();
  renderUsers();
  renderFloorplan();
  renderRoomPanel();
  renderArchitectPanel();
  bindEvents();
};

init();
