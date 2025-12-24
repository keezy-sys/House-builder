import { test, expect } from "@playwright/test";
test("app loads ohne Absturz", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});

test("3D-Ansicht zeigt Raum und Ansichtswechsel", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    const authScreen = document.getElementById("auth-screen");
    if (authScreen) {
      authScreen.hidden = true;
    }
    document.body.classList.remove("auth-locked");
  });
  await page.locator(".room-hit").first().click();
  await page.locator("#toggle-3d").click();

  await expect(page.locator("#three-d-stage")).toBeVisible();

  const dollhouseButton = page.locator(
    ".segmented-option[data-view='dollhouse']",
  );
  await dollhouseButton.click();

  await expect(page.locator("#three-d-stage")).toHaveAttribute(
    "data-view",
    "dollhouse",
  );
  await expect(dollhouseButton).toHaveClass(/is-active/);
});
