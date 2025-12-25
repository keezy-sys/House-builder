import { test, expect } from "@playwright/test";

const preparePage = async (page) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
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

test("app loads ohne Absturz", async ({ page }) => {
  await preparePage(page);
  await expect(page.locator("body")).toBeVisible();
});

test("3D-Ansicht zeigt Raum und Ansichtswechsel", async ({ page }) => {
  await preparePage(page);
  await page.locator(".room-hit").first().click();
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

  await page.locator("[data-app-view='tasks']").click();
  await page.selectOption("#task-filter-room", firstRoomId);

  const taskList = page.locator("#task-list");
  await expect(taskList).toContainText("Aufgabe Küche");
  await expect(taskList).not.toContainText("Aufgabe Bad");

  const taskItem = page.locator("#task-list .task-item").first();
  await taskItem.locator("select[data-field='status']").selectOption("Done");
  await expect(taskItem).toHaveClass(/is-done/);
});

test("saved views filtern Tasks nach Tags und Status", async ({ page }) => {
  await preparePage(page);
  await addTasks(page, [
    "Order tiles #materials",
    "Order paint #materials",
    "Permit submission #permit",
    "Contractor quote #contractor",
  ]);

  await page.locator("#view-tasks").click();

  const taskList = page.locator("#task-list");
  const paintTask = taskList.locator("[data-task-title='Order paint']");
  await paintTask.locator("select[data-field='status']").selectOption("Done");
  await expect(paintTask).toHaveClass(/is-done/);

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
  await expect(
    taskList.locator("[data-task-title='Permit submission']"),
  ).toHaveCount(0);
  await expect(
    taskList.locator("[data-task-title='Contractor quote']"),
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

  const taskList = page.locator("#task-list");
  const taskA = taskList.locator("[data-task-title='Bulk task A']");
  const taskB = taskList.locator("[data-task-title='Bulk task B']");

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-done").click();

  await expect(taskA.locator("select[data-field='status']")).toHaveValue(
    "Done",
  );
  await expect(taskB.locator("select[data-field='status']")).toHaveValue(
    "Done",
  );

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  const bulkAssignee = await page.$$eval(
    "#task-bulk-assignee option",
    (options) => options.map((option) => option.value).find(Boolean) || "",
  );
  expect(bulkAssignee).toBeTruthy();
  await page.locator("#task-bulk-assignee").selectOption(bulkAssignee);
  await page.locator("#task-bulk-assign").click();

  await expect(taskA.locator("select[data-field='assignee']")).toHaveValue(
    bulkAssignee,
  );
  await expect(taskB.locator("select[data-field='assignee']")).toHaveValue(
    bulkAssignee,
  );

  await taskA.locator("input[data-task-select]").check();
  await taskB.locator("input[data-task-select]").check();
  await page.locator("#task-bulk-due").fill("2024-10-01");
  await page.locator("#task-bulk-due-apply").click();

  await expect(taskA.locator("input[data-task-due]")).toHaveValue("2024-10-01");
  await expect(taskB.locator("input[data-task-due]")).toHaveValue("2024-10-01");
});
