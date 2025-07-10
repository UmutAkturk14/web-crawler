import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Locator } from "@playwright/test";

/**
 * Adds a new URL using the toolbar input and verifies it's added to the DOM.
 *
 * @param page - The Playwright page object
 * @param newUrl - The URL to add
 */
export async function addUrl(page: Page, newUrl: string): Promise<void> {
  await expect(page.getByPlaceholder("Enter new URL...")).toBeVisible();
  await page.getByPlaceholder("Enter new URL...").fill(newUrl);

  const addButton = page.getByRole("button", { name: "Add" });
  await expect(addButton).toBeVisible();
  await addButton.click();

  // Verify the URL appears as a visible link
  await expect(page.getByRole("link", { name: newUrl })).toBeVisible();
}

// Deletes all entries by clicking the "Delete All" checkbox and Delete button with confirm dialog
export async function deleteAllEntries(page: Page) {
  const deleteButton = page.getByRole("button", { name: "Delete" });

  // If button doesn't exist at all
  if ((await deleteButton.count()) === 0) return;

  // If Delete button is disabled, skip
  if (await deleteButton.isDisabled()) return;

  // Safely try selecting all (returns false if failed)
  const didSelect = await selectAll(page);
  if (!didSelect) return;

  // Ensure it's still visible and enabled before clicking
  await expect(deleteButton).toBeVisible();
  await expect(deleteButton).toBeEnabled();

  // Handle confirmation dialog
  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });

  await deleteButton.click();

  // Wait for UI to reflect empty state
  await expect(page.getByText("Start")).toHaveCount(0);
}

// Starts crawl for a given URL by clicking its Start button in the row containing that URL,
// then waits for Running and Done status cells to appear
export async function startCrawlAndWait(
  page: Page,
  url: string,
  timeout = 15000
) {
  // Find the row containing the URL
  const urlRow = page.locator("tr", { hasText: url });

  // Find the Start button inside that row
  const startButton = urlRow.getByRole("button", { name: /Start|Reanalyze/i });
  await startButton.click();

  await trackStatus(urlRow, timeout);
}

export async function analyzeAll(page: Page, urls: string[], timeout = 20000) {
  await selectAll(page);

  const analyzeButton = page.getByRole("button", { name: "Re-analyze" });
  await expect(analyzeButton).toBeVisible();
  await analyzeButton.click();

  for (const url of urls) {
    const urlRow = page.locator("tr", { hasText: url });

    await expect(urlRow).toBeVisible({ timeout });
    await trackStatus(urlRow, timeout);
  }
}

async function selectAll(page: Page): Promise<boolean> {
  const headerRow = page.getByRole("row", {
    name: "ID Title URL Status HTML H1",
  });

  if ((await headerRow.count()) === 0) return false;

  const checkbox = headerRow.getByRole("checkbox");

  if ((await checkbox.count()) === 0) return false;

  await checkbox.click();
  return true;
}

async function trackStatus(urlRow: Locator, timeout = 20000) {
  const statusCell = urlRow.getByRole("cell", { name: /running|done|error/i });

  await expect
    .poll(
      async () => {
        const count = await statusCell.count();
        if (count === 0) return "";
        const text = await statusCell.first().innerText();
        return text.toLowerCase();
      },
      { timeout }
    )
    .toMatch(/running|done|error/);
}
