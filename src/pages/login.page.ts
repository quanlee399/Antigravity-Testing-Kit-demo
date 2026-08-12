import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly clinicSelector: Locator;
  private readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log In' });
    this.clinicSelector = page.locator('.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-11\\.2').first();
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    await this.clinicSelector.click();
    await this.continueButton.click();
  }
}
