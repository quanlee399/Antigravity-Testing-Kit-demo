import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { AppointmentPage } from '../pages/appointment.page';
import { ScheduleBoardPage } from '../pages/schedule-board.page';
import { EFormPage } from '../pages/eform.page';
import { EncounterPage } from '../pages/encounter.page';

test.describe('Quy trình khám bệnh Outpatient E2E', () => {

  test('Nên hoàn thành trọn vẹn quy trình khám Outpatient từ đặt lịch đến thanh toán', async ({ page }) => {
    // 1. Setup môi trường & Đăng nhập
    const username = process.env.TEST_USERNAME || 'quan_le';
    const password = process.env.TEST_PASSWORD || 'Abcd@1234';
    
    await page.goto('/identity/login');
    const loginPage = new LoginPage(page);
    await loginPage.login(username, password);

    // Xác nhận đã login thành công bằng cách check URL hoặc sự xuất hiện của nút apps
    await expect(page.getByRole('button', { name: 'apps' })).toBeVisible({ timeout: 15000 });

    // 2. Điều hướng sang Outpatient > Appointments
    const appointmentPage = new AppointmentPage(page);
    await appointmentPage.navigateToAppointments();

    // 3. Đặt lịch hẹn mới với dữ liệu traceable động
    const timestamp = Date.now();
    const uniquePurpose = `Auto test outpatient appointment ${timestamp}`;
    const appointmentDetails = {
      patientSearch: 'vinicius',
      patientFullName: 'Vinicius D. Souza, PhD',
      appointmentTemplateName: 'Anh_Appointment_NoApproval',
      encounterTemplateName: 'Annual Check up - James',
      purpose: uniquePurpose,
      providerName: 'MArtin'
    };

    await appointmentPage.fillAppointmentForm(appointmentDetails);
    await appointmentPage.selectFirstAvailableTimeSlot();
    await appointmentPage.submit();

    // Đợi toast message thành công để đảm bảo cuộc hẹn tạo xong và trang web ổn định
    await expect(page.getByText('Appointment created successfully')).toBeVisible({ timeout: 15000 });

    // 4. Vào Schedule Board và thực hiện Check-in
    const scheduleBoardPage = new ScheduleBoardPage(page);
    await scheduleBoardPage.navigateToScheduleBoard();
    
    // Xác nhận đã chuyển sang trang Schedule Board thành công
    await expect(page).toHaveURL(/.*schedule-board/, { timeout: 10000 });
    
    await scheduleBoardPage.checkIn(appointmentDetails.patientFullName);

    // Đợi bệnh nhân xuất hiện trong danh sách In-Clinic trước khi tiếp tục
    const patientInClinicCard = page.locator('div').filter({ hasText: appointmentDetails.patientFullName }).first();
    await expect(patientInClinicCard).toBeVisible({ timeout: 10000 });

    await scheduleBoardPage.reviewCoverage('QC Insurance PlanQC', appointmentDetails.patientFullName);

    // 5. Sinh E-Forms và điền thông tin (popup eFormPopup)
    const eFormPage = new EFormPage(page);
    const eFormPopup = await eFormPage.generateEFormsAndGetPopup();
    
    // Nộp form (click Submit 4 lần liên tiếp)
    await eFormPage.submitEForms(eFormPopup, 4);
    await eFormPage.backToHomepage(eFormPopup);

    // Hoàn thành Intake Form
    await eFormPage.completeIntakeForms(eFormPopup);
    await eFormPage.closeSuccessDialog(eFormPopup);

    // Xác nhận sẵn sàng khám và mở popup Encounter
    const encounterPopup = await eFormPage.setReadyToBeSeen(eFormPopup);

    // 6. Xử lý Encounter & Capture Charges
    const encounterPage = new EncounterPage();
    await encounterPage.completeEncounter(encounterPopup);
    await encounterPage.captureChargesAndSubmitToRCM(encounterPopup);

    // ASSERTION CUỐI: Xác nhận popup Encounter đã được đóng và quay về trang chính thành công
    await expect(encounterPopup.isClosed()).toBeTruthy();
    await expect(page.getByText('Schedule Board')).toBeVisible();
  });
});
