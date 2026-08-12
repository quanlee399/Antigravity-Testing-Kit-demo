import { Page, Locator } from '@playwright/test';

export class EncounterPage {
  
  async completeEncounter(encounterPopup: Page): Promise<void> {
    await encounterPopup.getByRole('button', { name: 'Edit', exact: true }).click();
    await encounterPopup.getByRole('button', { name: 'Complete Encounter' }).click();
    await encounterPopup.getByRole('button', { name: 'Complete' }).click();
  }

  async captureChargesAndSubmitToRCM(encounterPopup: Page): Promise<void> {
    await encounterPopup.getByRole('button', { name: 'Capture Charges' }).click();
    await encounterPopup.getByRole('button', { name: 'Save & Next' }).click();
    await encounterPopup.getByRole('button', { name: 'Submit to RCM' }).click();
    await encounterPopup.getByRole('button', { name: 'Save & Close' }).click();
  }
}
