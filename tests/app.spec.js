import { test, expect } from "@playwright/test";
test("app loads ohne Absturz", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toBeVisible();
});
