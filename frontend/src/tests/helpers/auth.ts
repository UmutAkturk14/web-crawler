import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

type AuthMode = "login" | "register";

export async function authenticateUser(
  page: Page,
  mode: AuthMode,
  email: string,
  password: string
): Promise<void> {
  await test.step("Navigate to homepage", async () => {
    await page.goto("http://localhost:8088");
    await expect(page).toHaveTitle(/Web Crawler/i);
  });

  if (mode === "register") {
    await test.step("Click register tab and wait for form", async () => {
      const registerTab = page.getByRole("button", { name: "Register" });
      await expect(registerTab).toBeVisible();
      await registerTab.click();
      await page.waitForSelector("form >> text=Register");
    });

    await test.step("Fill out registration form and submit", async () => {
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);

      const registerSubmitButton = page
        .locator("form")
        .getByRole("button", { name: "Register" });

      await Promise.all([
        page.waitForFunction(() => !!localStorage.getItem("authToken")),
        registerSubmitButton.click(),
      ]);
    });
  } else {
    // Login path stays similar, maybe keep waitForTimeout for safety
    await test.step("Fill out login form and submit", async () => {
      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password").fill(password);

      const loginButton = page
        .locator("form")
        .getByRole("button", { name: "Login" });

      await loginButton.click();
      await page.waitForFunction(() => !!localStorage.getItem("authToken"));
    });
  }

  await test.step("Verify login was successful", async () => {
    await expect(
      page.getByRole("button", { name: "Re-analyze" })
    ).toBeVisible();

    await expect(page.getByText("Title")).toBeVisible();

    await page.waitForFunction(() => !!localStorage.getItem("authToken"));
    const token = await page.evaluate(() => localStorage.getItem("authToken"));
    expect(token).not.toBeNull();
  });
}

export async function logoutUser(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: "Log out" })).toBeVisible({
    timeout: 5000,
  });

  await page.getByRole("button", { name: "Log out" }).click();

  // Confirm we are logged out by checking for the login button
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible({
    timeout: 5000,
  });
}
