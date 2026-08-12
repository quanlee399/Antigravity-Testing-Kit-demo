import { Page, Locator, expect } from '@playwright/test';

export class ScheduleBoardPage {
  private readonly page: Page;
  private readonly scheduleBoardMenuBtn: Locator;
  private readonly checkInNowBtn: Locator;
  private readonly inClinicTab: Locator;
  private readonly reviewCoverageBtn: Locator;
  private readonly nextBtn: Locator;
  private readonly submitBtn: Locator;
  private readonly processIntakeFormsBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.scheduleBoardMenuBtn = page.locator('a[href*="schedule-board"]').or(page.getByText('overviewSchedule Board'));
    this.checkInNowBtn = page.getByRole('button', { name: 'Check-in Now' });
    this.inClinicTab = page.getByRole('tab', { name: 'In-Clinic' });
    this.reviewCoverageBtn = page.getByRole('button', { name: 'Review Coverage' });
    this.nextBtn = page.getByRole('button', { name: 'Next' });
    this.submitBtn = page.getByRole('button', { name: 'Submit' });
    this.processIntakeFormsBtn = page.getByRole('button', { name: 'Process Intake Forms' });
  }

  async navigateToScheduleBoard(): Promise<void> {
    await this.scheduleBoardMenuBtn.click();
  }

  async checkIn(patientName?: string): Promise<void> {
    if (patientName) {
      // Sử dụng div filter theo tên bệnh nhân vì Schedule Board hiển thị dạng Card chứ không phải Table Row (tr)
      const patientCard = this.page.locator('div').filter({ hasText: patientName }).getByRole('button', { name: 'Check-in Now' }).first();
      
      await patientCard.click();
      // Chờ nút Check-in biến mất để đảm bảo check-in đã được xử lý thành công
      await expect(patientCard).toBeHidden({ timeout: 10000 });

      // Kiểm tra và xử lý modal "Camera Access" của EMR nếu xuất hiện (timeout giảm xuống 3s cho nhanh)
      const cameraAccessModal = this.page.getByText('Camera Access', { exact: true });
      const oneTimeUseRadio = this.page.getByText('One Time Use: Allow camera access just for this instance');
      const saveBtn = this.page.getByRole('button', { name: 'Save' });
      
      try {
        await cameraAccessModal.waitFor({ state: 'visible', timeout: 3000 });
        await oneTimeUseRadio.click();
        await saveBtn.click();
        await expect(cameraAccessModal).toBeHidden({ timeout: 5000 });
      } catch (e) {
        // Modal không xuất hiện, bỏ qua
      }

      // Kiểm tra và xử lý modal "Take Photo" của EMR nếu xuất hiện
      const takePhotoModal = this.page.getByText('Take Photo');
      const skipBtn = this.page.getByRole('button', { name: 'Skip' });
      
      try {
        await takePhotoModal.waitFor({ state: 'visible', timeout: 3000 });
        await skipBtn.click();
        await expect(takePhotoModal).toBeHidden({ timeout: 5000 });
      } catch (e) {
        // Modal không xuất hiện, bỏ qua
      }
    } else {
      await this.checkInNowBtn.first().click();
    }
    await this.inClinicTab.click();
  }

  async reviewCoverage(insurancePlanName: string, patientName?: string): Promise<void> {
    if (patientName) {
      // Tìm nút Review Coverage nằm trong Card của bệnh nhân cụ thể để tránh Strict Mode Violation
      const patientCard = this.page.locator('div')
        .filter({ hasText: patientName })
        .filter({ has: this.page.getByRole('button', { name: 'Review Coverage' }) })
        .last();
      await patientCard.getByRole('button', { name: 'Review Coverage' }).click();
    } else {
      await this.reviewCoverageBtn.first().click();
    }
    
    // Chọn bảo hiểm chỉ định từ danh sách
    const insuranceCheckbox = this.page.getByRole('listitem')
      .filter({ hasText: insurancePlanName })
      .getByRole('checkbox');
    
    await insuranceCheckbox.check();
    await this.nextBtn.click();
    await this.submitBtn.click();
  }

  async processIntakeForms(): Promise<void> {
    await this.processIntakeFormsBtn.click();
  }
}
