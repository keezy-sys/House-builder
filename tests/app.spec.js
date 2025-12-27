import { test, expect } from "@playwright/test";

const preparePage = async (page, { state } = {}) => {
  await page.addInitScript((payload) => {
    localStorage.clear();
    if (payload && typeof payload === "object") {
      localStorage.setItem("house-builder-state", JSON.stringify(payload));
    }
  }, state);
  await page.goto("/");
  await page.addStyleTag({
    content:
      "#auth-screen { display: none !important; } body.auth-locked { overflow: auto !important; }",
  });
  await page.evaluate(() => {
    const authScreen = document.getElementById("auth-screen");
    if (authScreen) {
      authScreen.hidden = true;
      authScreen.style.display = "none";
      authScreen.style.pointerEvents = "none";
    }
    document.body.classList.remove("auth-locked");
  });
};

const TINY_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const buildPinnedRoomState = (roomId) => ({
  roomData: {
    [roomId]: {
      images: [
        {
          id: "img-wall",
          label: "Pin Wand",
          name: "Pin Wand",
          url: TINY_IMAGE,
          type: "image/gif",
          pin: { surface: "wall-north", x: 0.5, y: 0.4, scale: 0.35 },
        },
        {
          id: "img-floor",
          label: "Pin Boden",
          name: "Pin Boden",
          url: TINY_IMAGE,
          type: "image/gif",
          pin: { surface: "floor", x: 0.4, y: 0.6, scale: 0.4 },
        },
        {
          id: "img-ceiling",
          label: "Pin Decke",
          name: "Pin Decke",
          url: TINY_IMAGE,
          type: "image/gif",
          pin: { surface: "ceiling", x: 0.6, y: 0.3, scale: 0.4 },
        },
      ],
    },
  },
});

const addTasks = async (page, tasks) => {
  await page.locator(".room-hit").first().click();
  await page.locator("[data-room-tab='tasks']").click();
  const taskInput = page.locator("#task-input");
  const submitTask = page.locator("#task-form button[type='submit']");
  for (const task of tasks) {
    await taskInput.fill(task);
    await submitTask.click();
  }
};

const openTaskAdvanced = async (page) => {
  const advanced = page.locator("#task-advanced");
  await expect(advanced).toBeVisible();
  const isOpen = await advanced.evaluate((element) => element.open);
  if (!isOpen) {
    await advanced.locator("summary").click();
  }
};

const switchToGroundFloor = async (page) => {
  await page.locator("#floor-toggle").evaluate((input) => {
    input.value = "0";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
};

test("app loads ohne Absturz", async ({ page }) => {
  await preparePage(page);
  await expect(page.locator("body")).toBeVisible();
});

test("3D-Ansicht zeigt Raum und Ansichtswechsel", async ({ page }) => {
  await preparePage(page);
  await page.locator(".room-hit").first().click();
  await page.locator("[data-room-tab='inspiration']").click();
  await page.locator("#toggle-3d").click();

  await expect(page.locator("#three-d-stage")).toBeVisible();

  const modelButton = page.locator(".segmented-option[data-view='model']");
  await modelButton.click();

  await expect(page.locator("#three-d-stage")).toHaveAttribute(
    "data-view",
    "model",
  );
  await expect(modelButton).toHaveClass(/is-active/);
});

test("Pinned images erscheinen auf Waenden, Boden und Decke in 3D", async ({
  page,
}) => {
  const roomId = "ground-bedroom-left";
  await preparePage(page, { state: buildPinnedRoomState(roomId) });
  await switchToGroundFloor(page);
  await page.locator(`.room-hit[data-room-id='${roomId}']`).click();
  await page.locator("[data-room-tab='inspiration']").click();
  await page.locator("#toggle-3d").click();

  await expect(page.locator("#three-d-stage")).toBeVisible();
  await expect(
    page.locator(".room-surface.wall-north .pinned-image"),
  ).toHaveCount(1);
  await expect(page.locator(".room-surface.floor .pinned-image")).toHaveCount(
    1,
  );
  await expect(page.locator(".room-surface.ceiling .pinned-image")).toHaveCount(
    1,
  );
});

test("Aufgaben erstellen, filtern und erledigen", async ({ page }) => {
  await preparePage(page);

  const firstRoom = page.locator(".room-hit").first();
  const secondRoom = page.locator(".room-hit").nth(1);
  const firstRoomId = await firstRoom.getAttribute("data-room-id");
  const secondRoomId = await secondRoom.getAttribute("data-room-id");
  expect(firstRoomId).toBeTruthy();
  expect(secondRoomId).toBeTruthy();

  await firstRoom.click();
  await page.locator("[data-room-tab='tasks']").click();
  await page.locator("#task-input").fill("Aufgabe Küche #material");
  await page.locator("#task-input").press("Enter");
  await expect(page.locator("#room-tasks")).toContainText("Aufgabe Küche");

  await secondRoom.click();
  await page.locator("[data-room-tab='tasks']").click();
  await page.locator("#task-input").fill("Aufgabe Bad #fliesen");
  await page.locator("#task-input").press("Enter");
  await expect(page.locator("#room-tasks")).toContainText("Aufgabe Bad");

  await page.locator("#view-tasks").click();
  await openTaskAdvanced(page);
  await page.selectOption("#task-filter-room", firstRoomId);

  const taskList = page.locator("#task-list");
  await expect(taskList).toContainText("Aufgabe Küche");
  await expect(taskList).not.toContainText("Aufgabe Bad");

  const taskItem = page.locator("#task-list .task-item").first();
  const doneColumn = page.locator(".kanban-column[data-status='Done']");
  await taskItem.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-done").click();
  await expect(
    doneColumn.locator("[data-task-title='Aufgabe Küche']"),
  ).toHaveCount(1);
});

test("Aufgabenuebersicht erstellt neue Aufgabe trotz Filter", async ({
  page,
}) => {
  await preparePage(page);

  await page.locator("#view-tasks").click();
  await expect(page.locator("#tasks-view")).toBeVisible();
  await openTaskAdvanced(page);

  await page.selectOption("#task-filter-status", "Planned");
  await page.locator("#task-create-input").fill("Neue Aufgabe Uebersicht");
  await page.locator("#task-create-form button[type='submit']").click();

  const taskList = page.locator("#task-list");
  await expect(taskList).toContainText("Neue Aufgabe Uebersicht");
  await expect(page.locator("#task-filter-status")).toHaveValue("all");
});

test("saved views filtern Tasks nach Tags und Status", async ({ page }) => {
  await preparePage(page);
  await addTasks(page, [
    "Order tiles #materials",
    "Order paint #materials",
    "Device delivery #geraete",
    "Permit submission #permit",
    "Contractor quote #contractor",
  ]);

  await page.locator("#view-tasks").click();
  await openTaskAdvanced(page);

  const taskList = page.locator("#task-list");
  const paintTask = taskList.locator("[data-task-title='Order paint']");
  const deviceTask = taskList.locator("[data-task-title='Device delivery']");
  const doneColumn = page.locator(".kanban-column[data-status='Done']");
  await paintTask.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-done").click();
  await expect(
    doneColumn.locator("[data-task-title='Order paint']"),
  ).toHaveCount(1);

  await page.locator("button[data-task-view='materials']").click();
  await expect(page.locator("button[data-task-view='materials']")).toHaveClass(
    /is-active/,
  );
  await expect(taskList.locator("[data-task-title='Order tiles']")).toHaveCount(
    1,
  );
  await expect(taskList.locator("[data-task-title='Order paint']")).toHaveCount(
    0,
  );
  await expect(deviceTask).toHaveCount(0);
  await expect(
    taskList.locator("[data-task-title='Permit submission']"),
  ).toHaveCount(0);
  await expect(
    taskList.locator("[data-task-title='Contractor quote']"),
  ).toHaveCount(0);

  await page.locator("button[data-task-view='devices']").click();
  await expect(deviceTask).toHaveCount(1);
  await expect(taskList.locator("[data-task-title='Order tiles']")).toHaveCount(
    0,
  );
  await expect(
    taskList.locator("[data-task-title='Permit submission']"),
  ).toHaveCount(0);

  await page.locator("button[data-task-view='permits']").click();
  await expect(
    taskList.locator("[data-task-title='Permit submission']"),
  ).toHaveCount(1);
  await expect(taskList.locator("[data-task-title='Order tiles']")).toHaveCount(
    0,
  );

  await page.locator("button[data-task-view='contractors']").click();
  await expect(
    taskList.locator("[data-task-title='Contractor quote']"),
  ).toHaveCount(1);
  await expect(
    taskList.locator("[data-task-title='Permit submission']"),
  ).toHaveCount(0);
});

test("bulk actions setzen Status, Zuweisung und Faelligkeit", async ({
  page,
}) => {
  await preparePage(page);
  await addTasks(page, ["Bulk task A #materials", "Bulk task B #permit"]);

  await page.locator("#view-tasks").click();
  await openTaskAdvanced(page);

  const taskList = page.locator("#task-list");
  const taskA = taskList.locator("[data-task-title='Bulk task A']");
  const taskB = taskList.locator("[data-task-title='Bulk task B']");
  const doneColumn = page.locator(".kanban-column[data-status='Done']");

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-done").click();

  await expect(
    doneColumn.locator("[data-task-title='Bulk task A']"),
  ).toHaveCount(1);
  await expect(
    doneColumn.locator("[data-task-title='Bulk task B']"),
  ).toHaveCount(1);

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  const bulkAssignee = await page.$$eval(
    "#task-bulk-assignee option",
    (options) => options.map((option) => option.value).find(Boolean) || "",
  );
  expect(bulkAssignee).toBeTruthy();
  await page.locator("#task-bulk-assignee").selectOption(bulkAssignee);
  await page.locator("#task-bulk-assign").click();

  const assigneeValues = await page.evaluate(() => {
    const payload = JSON.parse(localStorage.getItem("house-builder-state"));
    const tasks = payload?.tasks || [];
    const result = {};
    tasks.forEach((task) => {
      if (task.title === "Bulk task A" || task.title === "Bulk task B") {
        result[task.title] = task.assignee || "";
      }
    });
    return result;
  });
  expect(assigneeValues["Bulk task A"]).toBe(bulkAssignee);
  expect(assigneeValues["Bulk task B"]).toBe(bulkAssignee);

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-due").fill("2024-10-01");
  await page.locator("#task-bulk-due-apply").click();

  const dueValues = await page.evaluate(() => {
    const payload = JSON.parse(localStorage.getItem("house-builder-state"));
    const tasks = payload?.tasks || [];
    const result = {};
    tasks.forEach((task) => {
      if (task.title === "Bulk task A" || task.title === "Bulk task B") {
        result[task.title] = task.dueDate || "";
      }
    });
    return result;
  });
  expect(dueValues["Bulk task A"]).toBe("2024-10-01");
  expect(dueValues["Bulk task B"]).toBe("2024-10-01");
});

test.describe("mobile view", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("mobile navigation und Aufgabenliste sind vereinfacht", async ({
    page,
  }) => {
    await preparePage(page);

    await expect(page.locator(".floorplan")).toBeHidden();
    await expect(page.locator("#toggle-architect")).toBeHidden();

    const roomSelect = page.locator("#mobile-room-select");
    await expect(roomSelect).toBeVisible();

    const firstRoomId = await roomSelect.evaluate((select) => {
      const options = Array.from(select.querySelectorAll("option"));
      const match = options.find((option) => option.value);
      return match ? match.value : "";
    });
    expect(firstRoomId).toBeTruthy();
    await roomSelect.selectOption(firstRoomId);

    await page.locator("[data-room-tab='inspiration']").click();
    await expect(page.locator("#three-d-panel")).toBeHidden();

    await page.locator("[data-room-tab='tasks']").click();
    await page.locator("#task-input").fill("Mobile Aufgabe");
    await page.locator("#task-input").press("Enter");

    await page.locator(".mobile-bar button[data-app-view='tasks']").click();
    await expect(page.locator("#task-list .task-list-group")).toHaveCount(1);
    await expect(page.locator("#task-list .kanban-column")).toHaveCount(0);
  });
});
