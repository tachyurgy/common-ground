import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173/common-ground';

test.describe('Common Ground Visual Tour', () => {
  test('Landing page', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForSelector('.landing-hero');
    await page.screenshot({ path: '/tmp/cg_screenshots/01-landing.png', fullPage: true });

    // Check key elements
    await expect(page.locator('h1')).toHaveText('Common Ground');
    await expect(page.locator('.tagline')).toBeVisible();
    await expect(page.locator('.landing-features .feature')).toHaveCount(3);
    await expect(page.locator('.landing-cta .btn')).toHaveCount(2);
  });

  test('About page', async ({ page }) => {
    await page.goto(BASE + '/about');
    await page.waitForSelector('.article');
    await page.screenshot({ path: '/tmp/cg_screenshots/02-about.png', fullPage: true });

    await expect(page.locator('h1')).toHaveText('What Is This?');
    await expect(page.locator('h2')).toHaveCount(2);
  });

  test('Story page', async ({ page }) => {
    await page.goto(BASE + '/story');
    await page.waitForSelector('.article');
    await page.screenshot({ path: '/tmp/cg_screenshots/03-story.png', fullPage: true });

    await expect(page.locator('h1')).toHaveText('The Story Behind Common Ground');
  });

  test('Tech stack page', async ({ page }) => {
    await page.goto(BASE + '/tech');
    await page.waitForSelector('.article');
    await page.screenshot({ path: '/tmp/cg_screenshots/04-tech.png', fullPage: true });

    await expect(page.locator('h1')).toHaveText('Tech Stack');
    // Should have multiple h2 sections
    const sections = page.locator('h2');
    await expect(sections).not.toHaveCount(0);
  });

  test('New Agreement form', async ({ page }) => {
    await page.goto(BASE + '/new');
    await page.waitForSelector('.agreement-form');
    await page.screenshot({ path: '/tmp/cg_screenshots/05-new-empty.png', fullPage: true });

    // Fill out the form
    await page.fill('#title', 'Household Communication Agreement');
    await page.fill('#participants', 'Alex and Jordan');
    await page.fill('#description', 'We need to establish clearer expectations around household tasks and how we communicate about them. Things have been tense lately and we want to get ahead of it.');
    await page.screenshot({ path: '/tmp/cg_screenshots/06-new-filled.png', fullPage: true });

    // Check submit button is enabled
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
  });

  test('Sidebar navigation', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForSelector('.sidebar');

    // Check sidebar links
    await expect(page.locator('.sidebar-brand a')).toHaveText('Common Ground');
    await expect(page.locator('.sidebar-section')).toHaveCount(2);

    // Navigate via sidebar
    await page.click('.sidebar-section a[href="/common-ground/about"]');
    await page.waitForSelector('h1:has-text("What Is This?")');
    await page.screenshot({ path: '/tmp/cg_screenshots/07-sidebar-nav.png', fullPage: true });
  });

  test('Agreement session flow (with mocked backend)', async ({ page }) => {
    // Try creating an agreement via the API directly
    const response = await page.request.post('http://localhost:3000/api/agreements', {
      headers: { 'Content-Type': 'application/json' },
      data: { agreement: { title: 'Test Agreement', description: 'Testing the flow', participant_names: 'Person A and Person B' } }
    });

    if (response.ok()) {
      const data = await response.json();
      const agreementId = data.agreement.id;

      // Navigate to the agreement session
      await page.goto(BASE + `/agreement/${agreementId}`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/cg_screenshots/08-session.png', fullPage: true });

      // Check session elements
      await expect(page.locator('h1')).toHaveText('Test Agreement');
      await expect(page.locator('.voice-recorder')).toBeVisible();
      await expect(page.locator('.btn-record')).toBeVisible();

      // Navigate to contract view (should be empty)
      await page.goto(BASE + `/agreement/${agreementId}/contract`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/cg_screenshots/09-contract-empty.png', fullPage: true });

      // Navigate to version history (should be empty)
      await page.goto(BASE + `/agreement/${agreementId}/history`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/cg_screenshots/10-history-empty.png', fullPage: true });

      // Navigate to responses (should be empty)
      await page.goto(BASE + `/agreement/${agreementId}/responses`);
      await page.waitForTimeout(500);
      await page.screenshot({ path: '/tmp/cg_screenshots/11-responses-empty.png', fullPage: true });
    }
  });

  test('Mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/');
    await page.waitForSelector('.landing-hero');
    await page.screenshot({ path: '/tmp/cg_screenshots/12-mobile-landing.png', fullPage: true });

    await page.goto(BASE + '/about');
    await page.waitForSelector('.article');
    await page.screenshot({ path: '/tmp/cg_screenshots/13-mobile-about.png', fullPage: true });

    await page.goto(BASE + '/new');
    await page.waitForSelector('.agreement-form');
    await page.screenshot({ path: '/tmp/cg_screenshots/14-mobile-new.png', fullPage: true });
  });

  test('Dark mode', async ({ page }) => {
    await page.goto(BASE + '/');
    await page.waitForSelector('.landing-hero');

    // Click the theme toggle
    await page.click('.theme-toggle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/cg_screenshots/15-dark-landing.png', fullPage: true });

    await page.goto(BASE + '/about');
    await page.waitForSelector('.article');
    await page.screenshot({ path: '/tmp/cg_screenshots/16-dark-about.png', fullPage: true });

    // Create an agreement and check dark mode session
    const response = await page.request.post('http://localhost:3000/api/agreements', {
      headers: { 'Content-Type': 'application/json' },
      data: { agreement: { title: 'Dark Mode Test' } }
    });
    if (response.ok()) {
      const data = await response.json();
      await page.goto(BASE + `/agreement/${data.agreement.id}`);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/tmp/cg_screenshots/17-dark-session.png', fullPage: true });
    }
  });
});
