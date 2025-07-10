import { test, expect } from "@playwright/test";
import { authenticateUser, logoutUser } from "./helpers/auth";

const testEmail = `testuser_${Date.now()}@example.com`;
const testPassword = "testpassword123";

test("homepage loads", async ({ page }) => {
  await test.step("Navigate to homepage", async () => {
    await page.goto("http://localhost:8088");
    await expect(page).toHaveTitle(/Web Crawler/i);
  });

  await test.step("Login tab is visible", async () => {
    await expect(
      page.locator('button[type="button"]:has-text("Login")')
    ).toBeVisible();
  });

  await test.step("Register tab is visible", async () => {
    await expect(
      page.locator('button[type="button"]:has-text("Register")')
    ).toBeVisible();
  });
});

test("User can register successfully", async ({ page }) => {
  await authenticateUser(page, "register", testEmail, testPassword);
});

test("User can log out successfully", async ({ page }) => {
  await page.goto("http://localhost:8088");
  await authenticateUser(page, "register", testEmail, testPassword);
  await logoutUser(page);
});

test("User can log in successfully", async ({ page }) => {
  await authenticateUser(page, "register", testEmail, testPassword);
  await logoutUser(page);
  await authenticateUser(page, "login", testEmail, testPassword);
});
