import { Page, Locator } from '@playwright/test';

export class EFormPage {
  private readonly page: Page;
  private readonly firstCheckbox: Locator;
  private readonly generateEFormsBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstCheckbox = page.getByRole('checkbox').first();
    this.generateEFormsBtn = page.getByRole('button', { name: 'tablet Generate E-Forms' });
  }

  async generateEFormsAndGetPopup(): Promise<Page> {
    await this.firstCheckbox.check();
    
    const popupPromise = this.page.waitForEvent('popup');
    await this.generateEFormsBtn.click();
    
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  async submitEForms(eFormPopup: Page, submitCount: number = 4): Promise<void> {
    const submitBtn = eFormPopup.getByRole('button', { name: 'Submit' });
    for (let i = 0; i < submitCount; i++) {
      await submitBtn.waitFor({ state: 'visible', timeout: 5000 });
      await submitBtn.click();
    }
  }

  async backToHomepage(eFormPopup: Page): Promise<void> {
    await eFormPopup.getByRole('button', { name: 'Back to Homepage' }).click();
  }

  async completeIntakeForms(eFormPopup: Page): Promise<void> {
    await eFormPopup.getByRole('button', { name: 'Process Intake Forms' }).click();
    await eFormPopup.getByRole('button', { name: 'Complete Intake Forms' }).click();
  }

  async closeSuccessDialog(eFormPopup: Page): Promise<void> {
    // Tối ưu hóa locator thay vì div:nth-child(2) > svg
    // Thường dialog có các icon Close hoặc class đóng, hoặc chúng ta dùng một locator ổn định
    const closeBtn = eFormPopup.locator('//button[contains(@class, "close")] | //svg[@data-testid="CloseIcon"] | div:nth-child(2) > svg').first();
    await closeBtn.click();
  }

  async setReadyToBeSeen(eFormPopup: Page): Promise<Page> {
    await eFormPopup.getByRole('button', { name: 'Ready to be Seen' }).click();
    await eFormPopup.getByText('Yes').click();
    await eFormPopup.getByRole('button', { name: 'Confirm' }).click();

    // Chuyển sang Encounter popup
    const encounterPopupPromise = eFormPopup.waitForEvent('popup');
    await eFormPopup.getByRole('button', { name: 'Submit' }).click();
    
    const encounterPopup = await encounterPopupPromise;
    await encounterPopup.waitForLoadState('domcontentloaded');
    return encounterPopup;
  }
}
