import { test, expect } from "@playwright/test";

test("ShopEase home page should load successfully", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/ShopEase/i);
});