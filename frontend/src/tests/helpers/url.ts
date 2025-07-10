import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Locator } from "@playwright/test";

export async function addUrl(page: Page, newUrl: string): Promise<void> {
  await expect(page.getByPlaceholder("Enter new URL...")).toBeVisible();
  await page.getByPlaceholder("Enter new URL...").fill(newUrl);

  const addButton = page.getByRole("button", { name: "Add" });
  await expect(addButton).toBeVisible();
  await addButton.click();

  await expect(page.getByRole("link", { name: newUrl })).toBeVisible();
}

export async function deleteAllEntries(page: Page) {
  const deleteButton = page.getByRole("button", { name: "Delete" });

  const didSelect = await selectAll(page);
  if (!didSelect) return;

  await expect(deleteButton).toBeVisible();
  await expect(deleteButton).toBeEnabled();

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("confirm");
    await dialog.accept();
  });

  await deleteButton.click();

  await expect(page.getByText(/Reanalyze|Start|Retry/i)).toHaveCount(0);
}

export async function startCrawlAndWait(
  page: Page,
  url: string,
  timeout = 15000
) {
  const urlRow = page.locator("tr", { hasText: url });

  const startButton = urlRow.getByRole("button", {
    name: /Start|Reanalyze|Retry/i,
  });
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

export async function clickStartButton(row: Locator): Promise<void> {
  const startButton = row.getByRole("button", { name: "Start" });
  await expect(startButton).toBeVisible();
  await startButton.click();
  await expect(row.getByRole("button", { name: "Stop" })).toBeVisible();
}

export async function clickStopButton(row: Locator): Promise<void> {
  const stopButton = row.getByRole("button", { name: "Stop" });
  await expect(stopButton).toBeVisible();
  await stopButton.click();
  await expect(row.getByRole("button", { name: "Start" })).toBeVisible();
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
