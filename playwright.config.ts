import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Đọc file .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './src/tests',
  timeout: 120000, // Tăng timeout lên 120s cho kịch bản E2E dài
  fullyParallel: false, // Chạy tuần tự để tránh xung đột dữ liệu E2E trên staging
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Giới hạn 1 worker do kịch bản E2E dùng chung dữ liệu và cần chạy tuần tự
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'https://qa.lumisightemr.datahouse.asia',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1920, height: 1080 }, // Viewport chuẩn desktop 1920x1080
    headless: false, // Chạy headed mode để dễ debug theo rules
    permissions: ['microphone', 'camera'], // Tự động cấp quyền mic/camera bypass popup Chrome
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
