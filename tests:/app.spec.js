import { test, expect } from "@playwright/test";

test("app loads without crashing", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator("body")).toBeVisible();
});
