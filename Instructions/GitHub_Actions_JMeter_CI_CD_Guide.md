# 🚀 HƯỚNG DẪN THIẾT LẬP & VẬN HÀNH JMETER PERFORMANCE TESTING TRÊN GITHUB ACTIONS CI/CD

> **Tài liệu:** Hướng dẫn tích hợp kiểm thử hiệu năng tự động hai tầng (Instant Job Summary & HTML Dashboard Artifacts) trên GitHub CI/CD  
> **Workflow File:** [`.github/workflows/jmeter-performance-ci.yml`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/.github/workflows/jmeter-performance-ci.yml)  
> **Parser Script:** [`jmeter/generate_summary_report.py`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/jmeter/generate_summary_report.py)

---

## 1. KIẾN TRÚC BÁO CÁO HAI TẦNG TRÊN CI/CD

Pipeline được thiết kế theo tiêu chuẩn Performance Engineering với 2 tầng báo cáo:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │              GitHub Actions Runner (Ubuntu)             │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                                  [jmeter -n -t ... -l result.jtl -e -o html-report]
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌─────────────────────────┐                         ┌─────────────────────────┐
       │   TẦNG 1: TỨC THÌ       │                         │   TẦNG 2: CHUYÊN SÂU    │
       │   (Job Step Summary)    │                         │   (Artifacts Dashboard) │
       ├─────────────────────────┤                         ├─────────────────────────┤
       │ • Bảng Markdown chuẩn   │                         │ • Full HTML Dashboard   │
       │ • Samples, Avg, P90, P95│                         │ • APDEX Score, Latency  │
       │ • Error %, Throughput   │                         │ • Raw .jtl Data File    │
       │ • Quality Gate Pass/Fail│                         │ • Tải về từ Artifacts   │
       └─────────────────────────┘                         └─────────────────────────┘
```

---

## 2. CÁC TÍNH NĂNG VƯỢT TRỘI CỦA PIPELINE

1. **Báo cáo tức thì ngay tại GitHub Summary (`$GITHUB_STEP_SUMMARY`):**
   * Hiển thị bảng tổng hợp chính xác chuẩn JMeter Aggregate Report (Labels, Samples, Avg, Median, 90% Line, 95% Line, 99% Line, Min, Max, Error %, Throughput RPS, Trạng thái từng request).
   * Người đánh giá (QA / Dev / Tech Lead) nhìn thấy ngay kết quả mà **không cần tải về và giải nén file ZIP**.

2. **Chế độ chạy linh hoạt (Workflow Dispatch):**
   * Cho phép chọn chạy toàn bộ (`all`) hoặc từng module (`heroku`, `petstore`, `reqres`, `todoist`).
   * Tùy chỉnh số lượng Virtual Users (`users`), thời gian chạy (`duration`), ngưỡng chấp nhận lỗi (`max_error_rate`) và SLA (`max_p95_ms`) ngay trên giao diện Web của GitHub.

3. **Cơ chế Caching Tối ưu tốc độ:**
   * Tự động cache bộ cài đặt Apache JMeter 5.6.3 (`actions/cache@v4`), giúp giảm thời gian build pipeline từ 3 phút xuống chỉ còn **vài giây**.

4. **Tự động Chặn Bản Build Suy giảm Hiệu năng (Quality Gate):**
   * Nếu tỷ lệ lỗi vượt quá ngưỡng định mức (ví dụ $> 10\%$) hoặc độ trễ $p(95)$ vượt ngưỡng SLA (ví dụ $> 4000ms$), pipeline sẽ tự động đánh dấu **FAILED (❌)** kèm thông báo lỗi chi tiết trên GitHub PR / Commit.

---

## 3. HƯỚNG DẪN KÍCH HOẠT & SỬ DỤNG TRÊN GITHUB

### 3.1. Kích hoạt thủ công qua Giao diện Web (Manual Trigger)
1. Truy cập Repository trên GitHub $\rightarrow$ Chuyển sang tab **Actions**.
2. Chọn workflow **"JMeter Performance Testing CI/CD"** ở thanh menu bên trái.
3. Bấm nút **"Run workflow"** và chọn các tham số mong muốn:
   * **Target API Suite:** `all` / `heroku` / `petstore` / `reqres` / `todoist`
   * **Virtual Users:** `5` (hoặc số lượng tải cần test)
   * **Duration in seconds:** `60`
   * **Max Allowed Error Rate (%):** `10`
   * **Max Allowed P95 Latency (ms):** `4000`
4. Bấm **"Run workflow"** màu xanh để bắt đầu thực thi.

### 3.2. Cấu hình Secrets (Tùy chọn cho Todoist)
Nếu muốn test có xác thực thật với Todoist:
1. Vào `Settings` $\rightarrow$ `Secrets and variables` $\rightarrow$ `Actions`.
2. Tạo Secret mới: `TODOIST_BEARER_TOKEN` và dán token API cá nhân của bạn vào.

---

## 4. XEM KẾT QUẢ & TẢI ARTIFACTS

1. **Xem Bảng Tóm tắt Summary:**
   * Sau khi Job hoàn tất, bấm vào Job **"Run JMeter Performance Suite"**.
   * Bảng **JMeter Performance Test Summary Report** sẽ hiển thị ngay dưới phần tóm tắt của Job.

2. **Tải HTML Dashboard Báo cáo Đồ thị:**
   * Kéo xuống mục **Artifacts** ở cuối trang Job Summary.
   * Tải file `jmeter-performance-dashboard-report.zip` $\rightarrow$ Giải nén $\rightarrow$ Mở `html-report/index.html` trên trình duyệt để xem toàn bộ đồ thị trực quan.
