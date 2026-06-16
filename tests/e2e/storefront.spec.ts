import { expect, test } from "@playwright/test";

test("product browsing and lead form are reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /კონდიციონერები და გათბობის სისტემები/ })).toBeVisible();
  await page.getByRole("link", { name: /ყველას ნახვა|პროდუქტების ნახვა/ }).first().click();
  await expect(page).toHaveURL(/products/);
});

test("admin login page loads", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "Admin Login" })).toBeVisible();
});
