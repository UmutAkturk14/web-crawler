import { test, expect } from "@playwright/test";
import { authenticateUser } from "./helpers/auth";
import { addUrl } from "./helpers/url";
import {
  deleteAllEntries,
  startCrawlAndWait,
  analyzeAll,
  clickStartButton,
  clickStopButton,
} from "./helpers/url";
import type { Page } from "@playwright/test";

const testEmail = `testuser_${Date.now()}@example.com`;
const testPassword = "testpassword123";

const urls = [
  "https://www.freecodecamp.org/news/how-to-work-with-react-forms/",
  "https://www.freecodecamp.org/news/how-to-use-a-resistive-soil-moisture-sensor/",
  "https://www.freecodecamp.org/news/how-to-deploy-a-nextjs-blog-on-sevalla/",
];

test("Dashboard toolbar renders correctly", async ({ page }) => {
  await page.goto("http://localhost:8088/");

  await authenticateUser(page, "register", testEmail, testPassword);

  await expect(page).toHaveTitle(/Web Crawler/i);
  await expect(page.getByText("Title")).toBeVisible();
  await expect(page.getByPlaceholder("Search URL or title...")).toBeVisible();
  await expect(page.getByPlaceholder("Enter new URL...")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Re-analyze" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("URL can be added", async ({ page }) => {
  await page.goto("http://localhost:8088/");
  await authenticateUser(page, "register", testEmail, testPassword);

  const newUrl = urls[0];

  await addUrl(page, newUrl);
});

test("URL can be crawled", async ({ page }) => {
  await ready(page);

  const newUrl = urls[0];
  await addUrl(page, newUrl);

  await startCrawlAndWait(page, newUrl, 20000);
});

test("More than one URL can be added and crawled", async ({ page }) => {
  await ready(page);

  for (const url of urls) {
    await addUrl(page, url);
  }

  await analyzeAll(page, urls);
});

test("Bulk Re-analyze works", async ({ page }) => {
  await ready(page);

  for (const url of urls) {
    await addUrl(page, url);
  }

  await analyzeAll(page, urls);
});

test("Bulk Delete works", async ({ page }) => {
  await ready(page);

  for (const url of urls) {
    await addUrl(page, url);
  }

  await deleteAllEntries(page);
  await expect(page.getByText(/Reanalyze|Start|Retry/i)).toHaveCount(0);
});

test("Detailed view opens on URL click", async ({ page }) => {
  const sections = [
    "URL Details",
    "Broken Links",
    "URL",
    "TITLE",
    "STATUS",
    "HTML",
    "H1",
    "H2",
    "H3",
    "H4",
    "INTERNAL LINKS",
    "EXTERNAL LINKS",
    "CREATED AT",
  ];

  await ready(page);

  const newUrl = urls[0];
  await addUrl(page, newUrl);
  await startCrawlAndWait(page, newUrl, 20000);

  const urlRow = page.locator("tr", { hasText: newUrl });
  await expect(urlRow).toBeVisible();
  await urlRow.click();

  for (const section of sections) {
    await expect(page.getByText(section).first()).toBeVisible({
      timeout: 10000,
    });
  }
});

test("Single re-analyze works", async ({ page }) => {
  await ready(page);

  const newUrl = urls[0];
  await addUrl(page, newUrl);
  await startCrawlAndWait(page, newUrl, 20000);
  await startCrawlAndWait(page, newUrl, 20000);
});

test("Start/Stop toggles correctly", async ({ page }) => {
  await ready(page);

  const newUrl = `https://www.example.com/test-${Date.now()}`;
  await addUrl(page, newUrl);

  const row = page.locator("tr", { hasText: newUrl });
  await expect(row).toBeVisible();

  await clickStartButton(row);
  await clickStopButton(row);
});

const ready = async (page: Page) => {
  await page.goto("http://localhost:8088/");
  await authenticateUser(page, "register", testEmail, testPassword);

  const rows = page.locator("table tbody tr");

  const rowCount = await rows.count();

  let hasStatusCell = false;
  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);
    const statusCells = row.getByRole("cell", { name: /running|done|error/i });
    if ((await statusCells.count()) > 0) {
      hasStatusCell = true;
      break;
    }
  }

  if (hasStatusCell) {
    await deleteAllEntries(page);
  }
};
