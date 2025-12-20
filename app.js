const rooms = [
  { id: "living", name: "Living Room", x: 40, y: 40, width: 260, height: 160 },
  { id: "kitchen", name: "Kitchen", x: 320, y: 40, width: 220, height: 160 },
  { id: "bedroom", name: "Bedroom", x: 40, y: 220, width: 220, height: 160 },
  { id: "bathroom", name: "Bathroom", x: 280, y: 220, width: 140, height: 160 },
  { id: "office", name: "Office", x: 440, y: 220, width: 200, height: 160 },
];

const initialFeatures = [
  {
    id: "feature-1",
    text: "Integrate ChatGPT image creation + room image stacks (upload, generate, edit, browse gallery).",
    status: "not-started",
  },
  {
    id: "feature-2",
    text: "Support multiple user logins with collaboration notes tied to specific spots in a room.",
    status: "not-started",
  },
  {
    id: "feature-3",
    text: "Convert room actions into a checklist for materials and builders.",
    status: "in-progress",
  },
];

const users = [
  { id: "user-1", name: "Avery" },
  { id: "user-2", name: "Pat" },
  { id: "user-3", name: "Sam" },
];

const state = {
  activeRoomId: null,
  isAddingComment: false,
  activeUserId: users[0].id,
  roomData: {},
  features: [],
  updateRequests: [],
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
  toggleDev: document.getElementById("toggle-dev"),
  developerView: document.getElementById("developer-view"),
  featureForm: document.getElementById("feature-form"),
  featureInput: document.getElementById("feature-input"),
  featureStatus: document.getElementById("feature-status"),
  featureList: document.getElementById("feature-list"),
  updateRequests: document.getElementById("update-requests"),
  activeUserSelect: document.getElementById("active-user"),
};

const storageKey = "house-builder-state";

const statusLabels = {
  "not-started": "Not started",
  "in-progress": "In progress",
  complete: "Complete",
};

const statusClass = {
  "not-started": "status-not-started",
  "in-progress": "status-in-progress",
  complete: "status-complete",
};

const defaultRoomData = () => ({
  checklist: [],
  images: [],
  comments: [],
});

const saveState = () => {
  const payload = {
    roomData: state.roomData,
    features: state.features,
    updateRequests: state.updateRequests,
    activeUserId: state.activeUserId,
  };
  localStorage.setItem(storageKey, JSON.stringify(payload));
};

const loadState = () => {
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    state.features = initialFeatures;
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state.roomData = parsed.roomData || {};
    state.features = parsed.features || initialFeatures;
    state.updateRequests = parsed.updateRequests || [];
    state.activeUserId = parsed.activeUserId || users[0].id;
  } catch (error) {
    state.features = initialFeatures;
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

  rooms.forEach((room) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", room.x);
    rect.setAttribute("y", room.y);
    rect.setAttribute("width", room.width);
    rect.setAttribute("height", room.height);
    rect.setAttribute("rx", 12);
    rect.setAttribute("class", `room${state.activeRoomId === room.id ? " active" : ""}`);
    rect.dataset.roomId = room.id;

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", room.x + 16);
    label.setAttribute("y", room.y + 32);
    label.setAttribute("fill", "#1f2937");
    label.setAttribute("font-size", "16");
    label.setAttribute("font-weight", "600");
    label.textContent = room.name;

    elements.floorplan.appendChild(rect);
    elements.floorplan.appendChild(label);
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
    elements.roomTitle.textContent = "Select a room";
    elements.roomSubtitle.textContent = "Pick a room on the floor plan to see details.";
    elements.checklist.innerHTML = "";
    elements.comments.innerHTML = "";
    elements.imageGallery.innerHTML = "";
    return;
  }

  const room = rooms.find((item) => item.id === state.activeRoomId);
  const roomData = ensureRoomData(state.activeRoomId);

  elements.roomTitle.textContent = room.name;
  elements.roomSubtitle.textContent = "Edit tasks, view photos, or leave notes for collaborators.";

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
    removeBtn.textContent = "Remove";
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
    li.textContent = `${user ? user.name : "Unknown"}: ${comment.text}`;
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

const renderFeatures = () => {
  elements.featureList.innerHTML = "";
  state.features.forEach((feature) => {
    const li = document.createElement("li");
    const text = document.createElement("div");
    text.textContent = feature.text;

    const chip = document.createElement("span");
    chip.className = `status-chip ${statusClass[feature.status]}`;
    chip.textContent = statusLabels[feature.status];

    const actions = document.createElement("div");
    actions.className = "feature-actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.className = "edit-input";
      input.placeholder = "Describe the update or change";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Send update";
      saveBtn.className = "primary";

      saveBtn.addEventListener("click", () => {
        if (!input.value.trim()) {
          return;
        }
        state.updateRequests.unshift({
          id: `update-${Date.now()}`,
          featureId: feature.id,
          text: input.value.trim(),
          timestamp: new Date().toLocaleString(),
        });
        input.remove();
        saveBtn.remove();
        saveState();
        renderUpdateRequests();
      });

      actions.appendChild(input);
      actions.appendChild(saveBtn);
      editBtn.disabled = true;
    });

    const statusSelect = document.createElement("select");
    ["not-started", "in-progress", "complete"].forEach((status) => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = statusLabels[status];
      if (status === feature.status) {
        option.selected = true;
      }
      statusSelect.appendChild(option);
    });

    statusSelect.addEventListener("change", (event) => {
      feature.status = event.target.value;
      saveState();
      renderFeatures();
    });

    actions.appendChild(editBtn);
    actions.appendChild(statusSelect);

    li.appendChild(text);
    li.appendChild(chip);
    li.appendChild(actions);
    elements.featureList.appendChild(li);
  });
};

const renderUpdateRequests = () => {
  elements.updateRequests.innerHTML = "";
  state.updateRequests.forEach((request) => {
    const li = document.createElement("li");
    const title = document.createElement("div");
    title.textContent = request.text;

    const meta = document.createElement("small");
    meta.textContent = `For feature ${request.featureId} • ${request.timestamp}`;
    meta.style.color = "#6b7280";

    li.appendChild(title);
    li.appendChild(meta);
    elements.updateRequests.appendChild(li);
  });
};

const selectRoom = (roomId) => {
  state.activeRoomId = roomId;
  state.isAddingComment = false;
  renderFloorplan();
  renderRoomPanel();
};

const handleAddComment = (event) => {
  if (!state.activeRoomId || !state.isAddingComment) {
    return;
  }

  const bounds = elements.floorplan.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 700;
  const y = ((event.clientY - bounds.top) / bounds.height) * 420;

  const room = rooms.find((item) => item.id === state.activeRoomId);
  const withinRoom =
    x >= room.x && x <= room.x + room.width && y >= room.y && y <= room.y + room.height;

  if (!withinRoom) {
    return;
  }

  const commentText = window.prompt("What should this comment say?");
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
  const promptText = window.prompt("Describe the image you want to generate.");
  if (!promptText) {
    return;
  }

  const roomData = ensureRoomData(state.activeRoomId);
  roomData.images.unshift({
    id: `img-${Date.now()}`,
    label: `ChatGPT request: ${promptText}`,
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

const handleFeatureSubmit = (event) => {
  event.preventDefault();
  const text = elements.featureInput.value.trim();
  if (!text) {
    return;
  }
  state.features.unshift({
    id: `feature-${Date.now()}`,
    text,
    status: elements.featureStatus.value,
  });
  elements.featureInput.value = "";
  elements.featureStatus.value = "not-started";
  saveState();
  renderFeatures();
};

const bindEvents = () => {
  elements.floorplan.addEventListener("click", (event) => {
    const target = event.target;
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
  elements.toggleDev.addEventListener("change", (event) => {
    elements.developerView.hidden = !event.target.checked;
  });

  elements.featureForm.addEventListener("submit", handleFeatureSubmit);

  elements.activeUserSelect.addEventListener("change", (event) => {
    state.activeUserId = event.target.value;
    saveState();
  });
};

const init = () => {
  loadState();
  renderUsers();
  renderFloorplan();
  renderRoomPanel();
  renderFeatures();
  renderUpdateRequests();
  bindEvents();
};

init();
