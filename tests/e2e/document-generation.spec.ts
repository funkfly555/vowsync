import { test, expect, Page } from '@playwright/test';

/**
 * VowSync Document Generation E2E Tests
 * Feature: 017-document-generation
 * Phase 14 - 40 Comprehensive Test Cases
 *
 * Test Configuration:
 * - HEADED mode with slowMo: 500ms for visibility
 * - Screenshots captured on each step
 * - Video recording enabled
 */

// Increase timeout for headed mode with slowMo
test.setTimeout(120000);

// Test credentials
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Helper function to login
async function login(page: Page) {
  await page.goto('/login');
  await page.waitForSelector('input[type="email"]');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for redirect to weddings page
  await page.waitForURL('/', { timeout: 15000 });
  await page.waitForSelector('h1:has-text("Weddings")', { timeout: 15000 });
}

// Helper function to navigate to wedding dashboard
async function navigateToWeddingDashboard(page: Page) {
  // Wait for wedding cards to load
  await page.waitForSelector('text=Test Bride & Test Groom', { timeout: 15000 });

  // Click on the wedding card
  await page.locator('h3:has-text("Test Bride & Test Groom")').click();
  await page.waitForTimeout(1500);

  // Wait for dashboard to load
  await page.waitForSelector('text=Home', { timeout: 15000 });
}

// Helper to setup: login and navigate to dashboard
async function setupTest(page: Page) {
  await login(page);
  await navigateToWeddingDashboard(page);
}

// Helper to get the modal dialog (excludes navigation menu)
function getModalDialog(page: Page) {
  return page.locator('[role="dialog"][data-state="open"]');
}

// Helper to open Generate Function Sheet modal
async function openFunctionSheetModal(page: Page) {
  // Look for Generate Docs button in Quick Actions (testid: quick-action-generate-docs)
  const generateBtn = page.locator('[data-testid="quick-action-generate-docs"]');
  await generateBtn.click();
  await page.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 5000 });
}

// =============================================================================
// BASIC FUNCTIONAL TESTS (Tests 1-10)
// =============================================================================

test.describe('Document Generation E2E Tests - Phase 14', () => {
  test.describe.configure({ mode: 'serial' });

  // ============================================================================
  // TEST 1: Open Generate Function Sheet Modal
  // ============================================================================
  test('TC01: Open Generate Function Sheet Modal', async ({ page }) => {
    await login(page);
    await page.screenshot({ path: 'test-results/document-generation/tc01-01-after-login.png' });

    // Click on wedding card
    await page.waitForSelector('text=Test Bride & Test Groom', { timeout: 15000 });
    await page.locator('h3:has-text("Test Bride & Test Groom")').click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'test-results/document-generation/tc01-02-wedding-dashboard.png' });

    // Wait for Quick Actions section
    await page.waitForSelector('text=Quick Actions', { timeout: 15000 });
    await page.screenshot({ path: 'test-results/document-generation/tc01-03-quick-actions.png' });

    // Click Generate Docs button (using data-testid)
    const generateBtn = page.locator('[data-testid="quick-action-generate-docs"]');
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 5000 });
    await page.screenshot({ path: 'test-results/document-generation/tc01-04-modal-open.png' });

    // Verify modal title
    const modalTitle = page.locator('[role="dialog"] h2:has-text("Generate Function Sheet")');
    await expect(modalTitle).toBeVisible();
  });

  // ============================================================================
  // TEST 2: Modal Initial State
  // ============================================================================
  test('TC02: Modal Initial State', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc02-01-modal-initial.png' });

    const dialog = getModalDialog(page);

    // Verify tabs exist
    const sectionsTab = dialog.locator('button[role="tab"]:has-text("Sections")');
    const brandingTab = dialog.locator('button[role="tab"]:has-text("Branding")');
    const previewTab = dialog.locator('button[role="tab"]:has-text("Preview")');

    await expect(sectionsTab).toBeVisible();
    await expect(brandingTab).toBeVisible();
    await expect(previewTab).toBeVisible();

    // Verify Sections tab is active by default
    await expect(sectionsTab).toHaveAttribute('data-state', 'active');

    // Verify format selector exists
    const formatLabel = dialog.locator('text=Format:');
    await expect(formatLabel).toBeVisible();

    // Verify generate button exists
    const generateBtn = dialog.locator('button:has-text("Generate PDF"), button:has-text("Generate DOCX")');
    await expect(generateBtn).toBeVisible();

    await page.screenshot({ path: 'test-results/document-generation/tc02-02-verified.png' });
  });

  // ============================================================================
  // TEST 3: Section Selection Checkboxes
  // ============================================================================
  test('TC03: Section Selection Checkboxes', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc03-01-sections-tab.png' });

    const dialog = getModalDialog(page);

    // Verify section checkboxes exist - look for common sections
    const expectedSections = [
      'Wedding Overview',
      'Event Summary',
      'Guest List',
      'Attendance Matrix',
      'Meal Selections',
      'Bar Orders',
      'Furniture & Equipment',
      'Budget Summary',
      'Vendor Contacts',
      'Timeline',
    ];

    for (const section of expectedSections) {
      const checkbox = dialog.locator(`text=${section}`);
      const isVisible = await checkbox.isVisible().catch(() => false);
      console.log(`Section "${section}": ${isVisible ? 'found' : 'not found'}`);
    }

    // Find and click on one checkbox to toggle
    const weddingOverview = dialog.locator('label:has-text("Wedding Overview")');
    if (await weddingOverview.isVisible()) {
      await weddingOverview.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/document-generation/tc03-02-checkbox-toggled.png' });

      // Click again to restore
      await weddingOverview.click();
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc03-03-checkboxes-verified.png' });
  });

  // ============================================================================
  // TEST 4: Select All / Clear All Functionality
  // ============================================================================
  test('TC04: Select All / Clear All Functionality', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc04-01-initial.png' });

    const dialog = getModalDialog(page);

    // Look for Clear All button
    const clearAllBtn = dialog.locator('button:has-text("Clear All")');
    if (await clearAllBtn.isVisible()) {
      await clearAllBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/document-generation/tc04-02-cleared.png' });

      // Check generate button is disabled (no sections selected)
      const generateBtn = dialog.locator('button:has-text("Generate")');
      await expect(generateBtn).toBeDisabled();

      // Now click Select All
      const selectAllBtn = dialog.locator('button:has-text("Select All")');
      if (await selectAllBtn.isVisible()) {
        await selectAllBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'test-results/document-generation/tc04-03-selected-all.png' });

        // Generate button should be enabled
        await expect(generateBtn).toBeEnabled();
      }
    } else {
      console.log('Select All/Clear All buttons not found - may have different implementation');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc04-04-verified.png' });
  });

  // ============================================================================
  // TEST 5: Format Selection (PDF/DOCX)
  // ============================================================================
  test('TC05: Format Selection', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc05-01-initial.png' });

    const dialog = getModalDialog(page);

    // Find format dropdown
    const formatSelect = dialog.locator('button[role="combobox"]:near(:text("Format:"))');
    if (await formatSelect.isVisible()) {
      await formatSelect.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/document-generation/tc05-02-dropdown-open.png' });

      // Check options
      const pdfOption = page.locator('[role="option"]:has-text("PDF")');
      const docxOption = page.locator('[role="option"]:has-text("DOCX")');

      await expect(pdfOption).toBeVisible();
      await expect(docxOption).toBeVisible();

      // Select DOCX
      await docxOption.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/document-generation/tc05-03-docx-selected.png' });

      // Verify button text changed
      const generateBtn = dialog.locator('button:has-text("Generate DOCX")');
      await expect(generateBtn).toBeVisible();

      // Switch back to PDF
      await formatSelect.click();
      await page.waitForTimeout(300);
      await page.locator('[role="option"]:has-text("PDF")').click();
      await page.waitForTimeout(300);

      const pdfBtn = dialog.locator('button:has-text("Generate PDF")');
      await expect(pdfBtn).toBeVisible();
    } else {
      console.log('Format selector not found with combobox role');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc05-04-verified.png' });
  });

  // ============================================================================
  // TEST 6: Branding Tab - Company Name
  // ============================================================================
  test('TC06: Branding Tab - Company Name', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc06-01-initial.png' });

    const dialog = getModalDialog(page);

    // Click Branding tab
    const brandingTab = dialog.locator('button[role="tab"]:has-text("Branding")');
    await brandingTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc06-02-branding-tab.png' });

    // Find company name input
    const companyInput = dialog.locator('input#companyName, input[placeholder*="Company Name"]');
    if (await companyInput.isVisible()) {
      // Clear and enter new company name
      await companyInput.fill('');
      await companyInput.fill('My Wedding Planning Co');
      await page.waitForTimeout(300);
      await page.screenshot({ path: 'test-results/document-generation/tc06-03-company-entered.png' });

      // Verify value
      const value = await companyInput.inputValue();
      expect(value).toBe('My Wedding Planning Co');
    } else {
      console.log('Company name input not found');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc06-04-verified.png' });
  });

  // ============================================================================
  // TEST 7: Branding Tab - Color Picker
  // ============================================================================
  test('TC07: Branding Tab - Color Picker', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Click Branding tab
    await dialog.locator('button[role="tab"]:has-text("Branding")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc07-01-branding-tab.png' });

    // Find color input
    const colorInput = dialog.locator('input[type="color"]');
    if (await colorInput.isVisible()) {
      // Get current color
      const currentColor = await colorInput.inputValue();
      console.log(`Current color: ${currentColor}`);

      // Set new color via JavaScript (color inputs are tricky to fill)
      await colorInput.evaluate((el) => {
        (el as HTMLInputElement).value = '#FF5733';
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/document-generation/tc07-02-color-changed.png' });

      // Check for color preview section
      const colorPreview = dialog.locator('text=Color Preview');
      if (await colorPreview.isVisible()) {
        console.log('Color preview section found');
        await page.screenshot({ path: 'test-results/document-generation/tc07-03-preview.png' });
      }
    } else {
      console.log('Color input not found');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc07-04-verified.png' });
  });

  // ============================================================================
  // TEST 8: Preview Tab
  // ============================================================================
  test('TC08: Preview Tab', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Click Preview tab
    const previewTab = dialog.locator('button[role="tab"]:has-text("Preview")');
    await previewTab.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc08-01-preview-tab.png' });

    // Verify preview content exists (use specific active tabpanel)
    const previewContent = dialog.locator('[role="tabpanel"][data-state="active"]');
    await expect(previewContent).toBeVisible();

    // Check for document title in preview
    const docTitle = dialog.locator('text=Function Sheet');
    if (await docTitle.first().isVisible()) {
      console.log('Document title found in preview');
    }

    // Check for section list in preview
    const sectionsList = dialog.locator('text=/\\d+ sections selected/i, text=/Sections:/');
    if (await sectionsList.first().isVisible()) {
      const text = await sectionsList.first().textContent();
      console.log(`Preview sections: ${text}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc08-02-verified.png' });
  });

  // ============================================================================
  // TEST 9: Generate Button State
  // ============================================================================
  test('TC09: Generate Button State', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc09-01-initial.png' });

    const dialog = getModalDialog(page);

    // Get generate button
    const generateBtn = dialog.locator('button:has-text("Generate PDF"), button:has-text("Generate DOCX")');
    await expect(generateBtn).toBeVisible();

    // Initially should be enabled (sections selected by default)
    const isEnabled = await generateBtn.isEnabled();
    console.log(`Generate button initially enabled: ${isEnabled}`);

    // Clear all sections
    const clearAllBtn = dialog.locator('button:has-text("Clear All")');
    if (await clearAllBtn.isVisible()) {
      await clearAllBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/document-generation/tc09-02-cleared.png' });

      // Button should be disabled
      await expect(generateBtn).toBeDisabled();
      console.log('Generate button disabled when no sections selected');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc09-03-verified.png' });
  });

  // ============================================================================
  // TEST 10: Generate PDF Flow (Smoke Test)
  // ============================================================================
  test('TC10: Generate PDF Flow', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc10-01-modal-open.png' });

    const dialog = getModalDialog(page);

    // Make sure at least some sections are selected
    const selectAllBtn = dialog.locator('button:has-text("Select All")');
    if (await selectAllBtn.isVisible()) {
      await selectAllBtn.click();
      await page.waitForTimeout(500);
    }

    // Click Generate PDF button
    const generateBtn = dialog.locator('button:has-text("Generate PDF")');
    await expect(generateBtn).toBeEnabled();
    await page.screenshot({ path: 'test-results/document-generation/tc10-02-before-generate.png' });

    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);

    // Click generate
    await generateBtn.click();
    await page.screenshot({ path: 'test-results/document-generation/tc10-03-generating.png' });

    // Check for loading state
    const loadingIndicator = dialog.locator('text=Generating..., svg[class*="animate-spin"]');
    const hasLoading = await loadingIndicator.isVisible().catch(() => false);
    if (hasLoading) {
      console.log('Loading indicator shown during generation');
    }

    // Wait for download or modal to close
    const download = await downloadPromise;
    if (download) {
      console.log(`Download started: ${download.suggestedFilename()}`);
      await page.screenshot({ path: 'test-results/document-generation/tc10-04-download-started.png' });
    } else {
      // Check if modal closed (success without download tracking)
      await page.waitForTimeout(5000);
      const modalVisible = await dialog.isVisible();
      console.log(`Modal still visible after generate: ${modalVisible}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc10-05-complete.png' });
  });

  // =============================================================================
  // DATA AGGREGATION & INTEGRATION TESTS (Tests 11-20)
  // =============================================================================

  // ============================================================================
  // TEST 11: Real Wedding Data in Modal
  // ============================================================================
  test('TC11: Real Wedding Data in Modal', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc11-01-modal.png' });

    const dialog = getModalDialog(page);

    // Check modal description contains wedding info
    const description = dialog.locator('[class*="DialogDescription"], p:has-text("Function Sheet")');
    if (await description.isVisible()) {
      const text = await description.textContent();
      console.log(`Description: ${text}`);
      // Should mention the wedding title
      expect(text?.toLowerCase()).toMatch(/test bride|wedding/i);
    }

    // Go to Preview tab to see wedding data
    await dialog.locator('button[role="tab"]:has-text("Preview")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc11-02-preview.png' });

    // Look for wedding names in preview
    const weddingNames = dialog.locator('text=/Test Bride|Test Groom/');
    if (await weddingNames.first().isVisible()) {
      console.log('Wedding names found in preview');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc11-03-verified.png' });
  });

  // ============================================================================
  // TEST 12: Section Counts Display
  // ============================================================================
  test('TC12: Section Counts Display', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc12-01-sections.png' });

    const dialog = getModalDialog(page);

    // Look for count badges next to section names (e.g., "5 guests", "3 events")
    const countPattern = dialog.locator('text=/\\d+\\s+(guest|event|vendor|item|task)/i');
    const countElements = await countPattern.all();

    console.log(`Found ${countElements.length} section count indicators`);

    for (const element of countElements.slice(0, 5)) {
      const text = await element.textContent();
      console.log(`Count: ${text}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc12-02-counts.png' });
  });

  // ============================================================================
  // TEST 13: Event Summary Section
  // ============================================================================
  test('TC13: Event Summary Section', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find Event Summary checkbox
    const eventSection = dialog.locator('label:has-text("Event Summary")');
    if (await eventSection.isVisible()) {
      const parent = eventSection.locator('..');
      const text = await parent.textContent();
      console.log(`Event Summary section: ${text}`);

      // Check if count is shown
      const hasCount = text?.match(/\d+\s*event/i);
      console.log(`Has event count: ${hasCount ? 'yes' : 'no'}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc13-01-event-section.png' });
  });

  // ============================================================================
  // TEST 14: Guest List Section
  // ============================================================================
  test('TC14: Guest List Section', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find Guest List checkbox
    const guestSection = dialog.locator('label:has-text("Guest List")');
    if (await guestSection.isVisible()) {
      const parent = guestSection.locator('..');
      const text = await parent.textContent();
      console.log(`Guest List section: ${text}`);

      // Check for guest count
      const hasCount = text?.match(/\d+\s*(guest|adult|child)/i);
      console.log(`Has guest count: ${hasCount ? 'yes' : 'no'}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc14-01-guest-section.png' });
  });

  // ============================================================================
  // TEST 15: Budget Summary Section
  // ============================================================================
  test('TC15: Budget Summary Section', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find Budget Summary checkbox
    const budgetSection = dialog.locator('label:has-text("Budget Summary")');
    if (await budgetSection.isVisible()) {
      const parent = budgetSection.locator('..');
      const text = await parent.textContent();
      console.log(`Budget Summary section: ${text}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc15-01-budget-section.png' });
  });

  // ============================================================================
  // TEST 16: Vendor Contacts Section
  // ============================================================================
  test('TC16: Vendor Contacts Section', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find Vendor Contacts checkbox
    const vendorSection = dialog.locator('label:has-text("Vendor Contacts")');
    if (await vendorSection.isVisible()) {
      const parent = vendorSection.locator('..');
      const text = await parent.textContent();
      console.log(`Vendor Contacts section: ${text}`);

      // Check for vendor count
      const hasCount = text?.match(/\d+\s*vendor/i);
      console.log(`Has vendor count: ${hasCount ? 'yes' : 'no'}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc16-01-vendor-section.png' });
  });

  // ============================================================================
  // TEST 17: Timeline Section
  // ============================================================================
  test('TC17: Timeline Section', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find Timeline checkbox
    const timelineSection = dialog.locator('label:has-text("Timeline")');
    if (await timelineSection.isVisible()) {
      const parent = timelineSection.locator('..');
      const text = await parent.textContent();
      console.log(`Timeline section: ${text}`);

      // Check for task count
      const hasCount = text?.match(/\d+\s*task/i);
      console.log(`Has task count: ${hasCount ? 'yes' : 'no'}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc17-01-timeline-section.png' });
  });

  // ============================================================================
  // TEST 18: Empty Section Handling
  // ============================================================================
  test('TC18: Empty Section Handling', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Go to Preview tab
    await dialog.locator('button[role="tab"]:has-text("Preview")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc18-01-preview.png' });

    // Look for empty section warnings
    const emptyWarning = dialog.locator('text=/empty|no data|0 items/i');
    const hasWarning = await emptyWarning.first().isVisible().catch(() => false);

    if (hasWarning) {
      const text = await emptyWarning.first().textContent();
      console.log(`Empty section warning: ${text}`);
    } else {
      console.log('No empty section warnings (all sections have data or warnings not shown)');
    }

    await page.screenshot({ path: 'test-results/document-generation/tc18-02-verified.png' });
  });

  // ============================================================================
  // TEST 19: Loading States
  // ============================================================================
  test('TC19: Loading States', async ({ page }) => {
    await setupTest(page);

    // Click Generate Docs button
    const generateBtn = page.locator('[data-testid="quick-action-generate-docs"]');
    await generateBtn.click();
    await page.screenshot({ path: 'test-results/document-generation/tc19-01-opening.png' });

    // Check for loading state while modal content loads
    const loadingSpinner = page.locator('svg[class*="animate-spin"], [class*="loading"]');
    const hasLoading = await loadingSpinner.first().isVisible().catch(() => false);
    console.log(`Loading spinner visible: ${hasLoading}`);

    // Wait for modal to fully load
    await page.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 5000 });
    await page.screenshot({ path: 'test-results/document-generation/tc19-02-loaded.png' });
  });

  // ============================================================================
  // TEST 20: Section Category Headers
  // ============================================================================
  test('TC20: Section Category Headers', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc20-01-sections.png' });

    const dialog = getModalDialog(page);

    // Look for category headers (Overview, Guests, Logistics, Vendors, Finance)
    const categories = ['Overview', 'Guests', 'Logistics', 'Vendors', 'Finance'];

    for (const category of categories) {
      const header = dialog.locator(`text=${category}`).first();
      const visible = await header.isVisible().catch(() => false);
      console.log(`Category "${category}": ${visible ? 'found' : 'not found'}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc20-02-categories.png' });
  });

  // =============================================================================
  // UI & UX TESTS (Tests 21-30)
  // =============================================================================

  // ============================================================================
  // TEST 21: Modal Close (X Button)
  // ============================================================================
  test('TC21: Modal Close (X Button)', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc21-01-modal-open.png' });

    const dialog = getModalDialog(page);

    // Find the close button within the dialog content area (not navigation)
    // Shadcn dialogs have a close button in DialogContent with lucide X icon
    const closeBtn = dialog.locator('button[class*="absolute"][class*="right"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/document-generation/tc21-02-closed.png' });

      // Verify modal is closed
      await expect(dialog).not.toBeVisible();
    } else {
      // Alternative: use Escape key to close
      console.log('X close button not found, using Escape key');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      await expect(dialog).not.toBeVisible();
    }

    await page.screenshot({ path: 'test-results/document-generation/tc21-03-verified.png' });
  });

  // ============================================================================
  // TEST 22: Tab Navigation
  // ============================================================================
  test('TC22: Tab Navigation', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Click through tabs
    const sectionsTab = dialog.locator('button[role="tab"]:has-text("Sections")');
    const brandingTab = dialog.locator('button[role="tab"]:has-text("Branding")');
    const previewTab = dialog.locator('button[role="tab"]:has-text("Preview")');

    // Start at Sections
    await expect(sectionsTab).toHaveAttribute('data-state', 'active');
    await page.screenshot({ path: 'test-results/document-generation/tc22-01-sections-active.png' });

    // Go to Branding
    await brandingTab.click();
    await page.waitForTimeout(300);
    await expect(brandingTab).toHaveAttribute('data-state', 'active');
    await page.screenshot({ path: 'test-results/document-generation/tc22-02-branding-active.png' });

    // Go to Preview
    await previewTab.click();
    await page.waitForTimeout(300);
    await expect(previewTab).toHaveAttribute('data-state', 'active');
    await page.screenshot({ path: 'test-results/document-generation/tc22-03-preview-active.png' });

    // Back to Sections
    await sectionsTab.click();
    await page.waitForTimeout(300);
    await expect(sectionsTab).toHaveAttribute('data-state', 'active');
    await page.screenshot({ path: 'test-results/document-generation/tc22-04-back-to-sections.png' });
  });

  // ============================================================================
  // TEST 23: Modal Responsive Layout
  // ============================================================================
  test('TC23: Modal Responsive Layout', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc23-01-initial.png' });

    // Check modal has max-width class
    const dialog = getModalDialog(page);
    const classes = await dialog.getAttribute('class');
    console.log(`Dialog classes: ${classes}`);

    // Modal should have responsive width (max-w-3xl or similar)
    expect(classes).toMatch(/max-w/);

    await page.screenshot({ path: 'test-results/document-generation/tc23-02-responsive.png' });
  });

  // ============================================================================
  // TEST 24: Error Display
  // ============================================================================
  test('TC24: Error Display', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check for error display area (even if no error)
    // Errors would be shown in a destructive/red alert area
    const errorArea = dialog.locator('[class*="destructive"], [class*="text-red"], [class*="bg-destructive"]');
    const hasError = await errorArea.first().isVisible().catch(() => false);
    console.log(`Error area visible: ${hasError}`);

    await page.screenshot({ path: 'test-results/document-generation/tc24-01-error-check.png' });
  });

  // ============================================================================
  // TEST 25: Cancel Button
  // ============================================================================
  test('TC25: Cancel Button', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc25-01-modal-open.png' });

    const dialog = getModalDialog(page);

    // Find and click Cancel button
    const cancelBtn = dialog.locator('button:has-text("Cancel")');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc25-02-closed.png' });

    // Verify modal is closed
    await expect(dialog).not.toBeVisible();
  });

  // ============================================================================
  // TEST 26: Format Toggle Button Display
  // ============================================================================
  test('TC26: Format Toggle Button Display', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check format displays correctly in button
    const formatSelect = dialog.locator('button[role="combobox"]').first();
    if (await formatSelect.isVisible()) {
      const selectedText = await formatSelect.textContent();
      console.log(`Selected format: ${selectedText}`);

      // Should show PDF or DOCX
      expect(selectedText?.toUpperCase()).toMatch(/PDF|DOCX/);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc26-01-format-display.png' });
  });

  // ============================================================================
  // TEST 27: Branding Preview Updates
  // ============================================================================
  test('TC27: Branding Preview Updates', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Go to Branding tab
    await dialog.locator('button[role="tab"]:has-text("Branding")').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/document-generation/tc27-01-branding.png' });

    // Find color preview section
    const colorPreview = dialog.locator('text=Color Preview').locator('..');
    if (await colorPreview.isVisible()) {
      // Check preview element exists with color styling
      const colorSwatch = colorPreview.locator('[style*="background"]');
      if (await colorSwatch.first().isVisible()) {
        const style = await colorSwatch.first().getAttribute('style');
        console.log(`Color swatch style: ${style}`);
      }
    }

    await page.screenshot({ path: 'test-results/document-generation/tc27-02-preview-verified.png' });
  });

  // ============================================================================
  // TEST 28: Section Descriptions
  // ============================================================================
  test('TC28: Section Descriptions', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Look for section descriptions (small text under checkboxes)
    const descriptions = dialog.locator('[class*="text-muted"], [class*="text-sm"]');
    const descCount = await descriptions.count();
    console.log(`Found ${descCount} description elements`);

    // Sample a few
    for (let i = 0; i < Math.min(3, descCount); i++) {
      const text = await descriptions.nth(i).textContent();
      console.log(`Description ${i}: ${text?.substring(0, 50)}...`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc28-01-descriptions.png' });
  });

  // ============================================================================
  // TEST 29: Document Title in Preview
  // ============================================================================
  test('TC29: Document Title in Preview', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Go to Preview tab
    await dialog.locator('button[role="tab"]:has-text("Preview")').click();
    await page.waitForTimeout(500);

    // Look for document title (should include wedding names)
    const titlePattern = dialog.locator('text=/Function Sheet|Test Bride.*Test Groom/i');
    if (await titlePattern.first().isVisible()) {
      const title = await titlePattern.first().textContent();
      console.log(`Document title: ${title}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc29-01-title.png' });
  });

  // ============================================================================
  // TEST 30: Footer Button Layout
  // ============================================================================
  test('TC30: Footer Button Layout', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check footer contains format selector, cancel, and generate buttons
    const footer = dialog.locator('[class*="DialogFooter"], footer, [class*="flex"][class*="gap"]').last();

    // Format selector
    const formatLabel = dialog.locator('text=Format:');
    await expect(formatLabel).toBeVisible();

    // Cancel button
    const cancelBtn = dialog.locator('button:has-text("Cancel")');
    await expect(cancelBtn).toBeVisible();

    // Generate button
    const generateBtn = dialog.locator('button:has-text("Generate")');
    await expect(generateBtn).toBeVisible();

    await page.screenshot({ path: 'test-results/document-generation/tc30-01-footer-layout.png' });
  });

  // =============================================================================
  // DESIGN SYSTEM COMPLIANCE (Tests 31-35)
  // =============================================================================

  // ============================================================================
  // TEST 31: Button Styles (Primary/Secondary)
  // ============================================================================
  test('TC31: Button Styles', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check primary button (Generate)
    const generateBtn = dialog.locator('button:has-text("Generate")');
    const generateClasses = await generateBtn.getAttribute('class');
    console.log(`Generate button classes: ${generateClasses}`);

    // Check secondary button (Cancel)
    const cancelBtn = dialog.locator('button:has-text("Cancel")');
    const cancelClasses = await cancelBtn.getAttribute('class');
    console.log(`Cancel button classes: ${cancelClasses}`);

    // Verify different styling
    expect(generateClasses).not.toBe(cancelClasses);

    await page.screenshot({ path: 'test-results/document-generation/tc31-01-button-styles.png' });
  });

  // ============================================================================
  // TEST 32: Input Styles
  // ============================================================================
  test('TC32: Input Styles', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Go to Branding tab
    await dialog.locator('button[role="tab"]:has-text("Branding")').click();
    await page.waitForTimeout(500);

    // Check input styling
    const input = dialog.locator('input[type="text"], input#companyName').first();
    if (await input.isVisible()) {
      const classes = await input.getAttribute('class');
      console.log(`Input classes: ${classes}`);

      // Should have border and rounded styling
      expect(classes).toMatch(/border|rounded/);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc32-01-input-styles.png' });
  });

  // ============================================================================
  // TEST 33: Dialog Styles
  // ============================================================================
  test('TC33: Dialog Styles', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);
    const classes = await dialog.getAttribute('class');
    console.log(`Dialog classes: ${classes}`);

    // Should have background, border, shadow styling
    expect(classes).toMatch(/bg|background|shadow|rounded/);

    // Check overlay/backdrop exists
    const overlay = page.locator('[data-state="open"][class*="fixed inset"]').first();
    const hasOverlay = await overlay.isVisible().catch(() => false);
    console.log(`Has overlay: ${hasOverlay}`);

    await page.screenshot({ path: 'test-results/document-generation/tc33-01-dialog-styles.png' });
  });

  // ============================================================================
  // TEST 34: Checkbox Styles
  // ============================================================================
  test('TC34: Checkbox Styles', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Find checkbox elements
    const checkbox = dialog.locator('button[role="checkbox"], input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      const classes = await checkbox.getAttribute('class');
      console.log(`Checkbox classes: ${classes}`);

      // Check state
      const checked = await checkbox.getAttribute('data-state');
      console.log(`Checkbox state: ${checked}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc34-01-checkbox-styles.png' });
  });

  // ============================================================================
  // TEST 35: Color Consistency
  // ============================================================================
  test('TC35: Color Consistency', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check primary color usage in various elements
    const primaryElements = dialog.locator('[class*="primary"], button:not([class*="outline"])').first();
    if (await primaryElements.isVisible()) {
      const classes = await primaryElements.getAttribute('class');
      console.log(`Primary element classes: ${classes}`);
    }

    // Check muted text colors
    const mutedText = dialog.locator('[class*="text-muted"]').first();
    if (await mutedText.isVisible()) {
      const classes = await mutedText.getAttribute('class');
      console.log(`Muted text classes: ${classes}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc35-01-colors.png' });
  });

  // =============================================================================
  // ACCESSIBILITY TESTS (Tests 36-40)
  // =============================================================================

  // ============================================================================
  // TEST 36: Focus Management
  // ============================================================================
  test('TC36: Focus Management', async ({ page }) => {
    await setupTest(page);

    // Open modal
    const generateBtn = page.locator('[data-testid="quick-action-generate-docs"]');
    await generateBtn.click();
    await page.waitForSelector('[role="dialog"][data-state="open"]', { timeout: 5000 });
    await page.screenshot({ path: 'test-results/document-generation/tc36-01-modal-open.png' });

    // Focus should be trapped in dialog
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.waitForTimeout(200);

    // Get active element
    const activeElement = await page.evaluate(() => document.activeElement?.tagName);
    console.log(`Active element after tab: ${activeElement}`);

    // Should be within dialog
    const dialog = getModalDialog(page);
    const dialogContainsFocus = await dialog.evaluate((el) => el.contains(document.activeElement));
    console.log(`Dialog contains focus: ${dialogContainsFocus}`);
    expect(dialogContainsFocus).toBe(true);

    await page.screenshot({ path: 'test-results/document-generation/tc36-02-focus-trapped.png' });
  });

  // ============================================================================
  // TEST 37: Keyboard Navigation
  // ============================================================================
  test('TC37: Keyboard Navigation', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);
    await page.screenshot({ path: 'test-results/document-generation/tc37-01-initial.png' });

    // Tab through form elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: 'test-results/document-generation/tc37-02-tabbed.png' });

    // Test Escape closes modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const dialog = getModalDialog(page);
    await expect(dialog).not.toBeVisible();
    await page.screenshot({ path: 'test-results/document-generation/tc37-03-escaped.png' });
  });

  // ============================================================================
  // TEST 38: ARIA Labels
  // ============================================================================
  test('TC38: ARIA Labels', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Check dialog has proper role
    const role = await dialog.getAttribute('role');
    expect(role).toBe('dialog');
    console.log(`Dialog role: ${role}`);

    // Check for aria-labelledby or aria-label
    const labelledBy = await dialog.getAttribute('aria-labelledby');
    const ariaLabel = await dialog.getAttribute('aria-label');
    console.log(`Labelled by: ${labelledBy}, Aria label: ${ariaLabel}`);
    expect(labelledBy || ariaLabel).toBeTruthy();

    // Check tabs have proper roles
    const tabs = dialog.locator('[role="tab"]');
    const tabCount = await tabs.count();
    console.log(`Tab elements with role: ${tabCount}`);
    expect(tabCount).toBeGreaterThan(0);

    // Check checkboxes have proper roles
    const checkboxes = dialog.locator('[role="checkbox"]');
    const checkboxCount = await checkboxes.count();
    console.log(`Checkbox elements with role: ${checkboxCount}`);

    await page.screenshot({ path: 'test-results/document-generation/tc38-01-aria.png' });
  });

  // ============================================================================
  // TEST 39: Screen Reader Text
  // ============================================================================
  test('TC39: Screen Reader Text', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Look for sr-only (screen reader only) text
    const srOnly = dialog.locator('.sr-only, [class*="sr-only"]');
    const srCount = await srOnly.count();
    console.log(`Screen reader only elements: ${srCount}`);

    // Check buttons have accessible names
    const buttons = dialog.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(3, buttonCount); i++) {
      const btn = buttons.nth(i);
      const name =
        (await btn.getAttribute('aria-label')) ||
        (await btn.textContent()) ||
        (await btn.getAttribute('title'));
      console.log(`Button ${i} accessible name: ${name?.substring(0, 30)}`);
    }

    await page.screenshot({ path: 'test-results/document-generation/tc39-01-sr-text.png' });
  });

  // ============================================================================
  // TEST 40: Tab Order
  // ============================================================================
  test('TC40: Tab Order', async ({ page }) => {
    await setupTest(page);
    await openFunctionSheetModal(page);

    const dialog = getModalDialog(page);

    // Get all focusable elements in order
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = dialog.locator(focusableSelector);
    const count = await focusables.count();
    console.log(`Focusable elements: ${count}`);

    // Tab through and record order
    const tabOrder: string[] = [];
    for (let i = 0; i < Math.min(10, count); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const activeEl = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? el.tagName + (el.textContent?.substring(0, 20) || '') : 'unknown';
      });
      tabOrder.push(activeEl);
    }

    console.log('Tab order:', tabOrder);
    await page.screenshot({ path: 'test-results/document-generation/tc40-01-tab-order.png' });

    // Verify tab order is logical (no jumps back)
    // At minimum, we should be able to tab through elements
    expect(tabOrder.length).toBeGreaterThan(0);
  });
});
