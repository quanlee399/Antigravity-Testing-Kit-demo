import { Page, Locator } from '@playwright/test';

export class AppointmentPage {
  private readonly page: Page;
  private readonly appsMenuBtn: Locator;
  private readonly outpatientBtn: Locator;
  private readonly sidebarCollapseBtn: Locator;
  private readonly appointmentsMenuBtn: Locator;
  
  private readonly createAppointmentBtn: Locator;
  private readonly patientInput: Locator;
  private readonly durationDropdown: Locator;
  private readonly durationOption10: Locator;
  private readonly appointmentTemplateDropdown: Locator;
  private readonly encounterTemplateDropdown: Locator;
  private readonly purposeInput: Locator;
  private readonly providerInput: Locator;
  private readonly createBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation Locators
    this.appsMenuBtn = page.getByRole('button', { name: 'apps' });
    this.outpatientBtn = page.getByRole('button', { name: 'outpatient Outpatient' });
    this.sidebarCollapseBtn = page.getByText('chevron_left');
    this.appointmentsMenuBtn = page.locator('a[href*="appointments"]').or(page.getByText('calendar_monthAppointments'));

    // Form Locators
    this.createAppointmentBtn = page.getByRole('button', { name: 'Create Appointment' });
    this.patientInput = page.getByRole('combobox', { name: 'Patient *' });
    this.durationDropdown = page.getByRole('group', { name: 'Appointment Duration' }).getByLabel('Open');
    this.durationOption10 = page.getByRole('option', { name: '10', exact: true });
    this.appointmentTemplateDropdown = page.getByRole('combobox', { name: 'Appointment Template *' });
    this.encounterTemplateDropdown = page.getByRole('combobox', { name: 'Encounter Template *' });
    this.purposeInput = page.getByRole('textbox', { name: 'Please state the purpose of' });
    this.providerInput = page.getByRole('textbox', { name: 'Search by Primary Provider' });
    this.createBtn = page.getByRole('button', { name: 'Create' });
  }

  async navigateToAppointments(): Promise<void> {
    await this.appsMenuBtn.click();
    await this.outpatientBtn.click();
    await this.appointmentsMenuBtn.click();
  }

  async fillAppointmentForm(details: {
    patientSearch: string;
    patientFullName: string;
    appointmentTemplateName: string;
    encounterTemplateName: string;
    purpose: string;
    providerName: string;
  }): Promise<void> {
    // Click nút tạo cuộc hẹn
    await this.createAppointmentBtn.click();
    
    // Đợi ô input Patient xuất hiện để xác minh modal đã mở thành công (khắc phục React hydration delay)
    try {
      await this.patientInput.waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      // Nếu chưa xuất hiện, click lại lần nữa
      await this.createAppointmentBtn.click();
      await this.patientInput.waitFor({ state: 'visible', timeout: 5000 });
    }
    
    await this.patientInput.fill(details.patientSearch);
    // Nhấn Enter hoặc click trực tiếp tên bệnh nhân xuất hiện trong danh sách
    await this.patientInput.press('Enter');
    await this.page.getByText(details.patientFullName).click();

    await this.durationDropdown.click();
    await this.durationOption10.click();

    await this.appointmentTemplateDropdown.click();
    await this.page.getByRole('option', { name: details.appointmentTemplateName }).click();

    await this.encounterTemplateDropdown.click();
    await this.page.getByRole('option', { name: details.encounterTemplateName }).click();

    // Fill lý do (tránh trùng lặp click/fill nhiều lần)
    await this.purposeInput.fill(details.purpose);

    await this.providerInput.fill(details.providerName);
  }

  async selectFirstAvailableTimeSlot(): Promise<void> {
    // Bật toggle "Show fully booked times" để luôn hiển thị các slot giờ kể cả khi đã đầy (tránh hết slot khi chạy test nhiều lần)
    const toggle = this.page.getByText('Show fully booked times');
    try {
      await toggle.waitFor({ state: 'visible', timeout: 3000 });
      await toggle.click();
    } catch (e) {
      // Toggle không hiển thị hoặc không load kịp, bỏ qua
    }

    // Tìm button hiển thị giờ (AM/PM) khả dụng và KHÔNG BỊ DISABLE (giờ trong tương lai) để click
    const timeSlotRegex = /^[0-9]{2}:[0-9]{2} (AM|PM)/;
    const availableSlot = this.page.locator('button:not([disabled])').filter({ hasText: timeSlotRegex }).first();

    // Tự động chuyển sang ngày tiếp theo nếu ngày hiện tại không có slot khả dụng
    try {
      await availableSlot.waitFor({ state: 'visible', timeout: 3000 });
    } catch (e) {
      const selectedDayCell = this.page.getByRole('gridcell', { selected: true });
      let moved = false;
      if (await selectedDayCell.isVisible()) {
        const selectedDayText = await selectedDayCell.textContent();
        if (selectedDayText) {
          const currentDay = parseInt(selectedDayText.trim(), 10);
          const nextDay = currentDay + 1;
          const nextDayCell = this.page.getByRole('gridcell', { name: String(nextDay), exact: true });
          
          if (await nextDayCell.isVisible()) {
            await nextDayCell.click();
            moved = true;
          }
        }
      }
      
      if (!moved) {
        const nextMonthBtn = this.page.getByRole('button', { name: 'Next month' });
        if (await nextMonthBtn.isVisible()) {
          await nextMonthBtn.click();
          await this.page.getByRole('gridcell', { name: '1', exact: true }).first().click();
        }
      }
      
      // Chờ slot giờ của ngày mới load xong
      await availableSlot.waitFor({ state: 'visible', timeout: 5000 });
    }

    await availableSlot.click();
  }

  async submit(): Promise<void> {
    await this.createBtn.click();
  }
}
