# 🚀 K6 PERFORMANCE & LOAD TESTING - TEST SPECIFICATION & TEST CASES

> **Tài liệu:** Kế hoạch & Danh mục Test Case Kiểm thử Hiệu năng (Performance & Load Testing) bằng k6  
> **Áp dụng cho:** 4 bộ APIs mục tiêu (**Herokuapp Restful-Booker, Swagger Petstore, ReqRes, Todoist**)  
> **Tiêu chuẩn:** ISTQB Performance Testing Guidelines & k6 Best Practices  
> **Thư mục lưu trữ:** `manual_test_cases/`

---

## 1. TỔNG QUAN VỀ CÁC LOẠI KIỂM THỬ HIỆU NĂNG (PERFORMANCE TEST TYPES)

| Loại Test | Mục đích | Cấu hình k6 (VUs / Stages) | Ngưỡng đánh giá (Threshold SLA) |
| :--- | :--- | :--- | :--- |
| **Smoke Test** | Kiểm tra tính đúng đắn của kịch bản, xác thực hệ thống sống và API phản hồi bình thường dưới tải tối thiểu trước khi kích hoạt tải lớn. | `1 - 2 VUs`, Thời gian: `1m` - `2m` | `p(99) < 1500ms`, `error_rate < 1%`, `checks > 99%` |
| **Load Test (Average Load)** | Đo lường hiệu năng thực tế (Throughput, Latency, Error rate) khi hệ thống chịu tải người dùng đồng thời theo dự kiến hằng ngày. | Ramp-up `30s` (5 VUs) $\rightarrow$ Duy trì `2m` - `5m` (10-20 VUs) $\rightarrow$ Ramp-down `30s` (0 VUs) | `p(95) < 3000ms`, `p(99) < 5000ms`, `error_rate < 5%`, `checks > 95%` |
| **Stress Test** | Tăng tải vượt ngưỡng thông thường theo từng bậc thang để xác định giới hạn chịu tải tối đa (Breaking Point), đánh giá cơ chế tự phục hồi và suy giảm hiệu năng (Graceful Degradation). | Bậc 1: `10 VUs (1m)` $\rightarrow$ Bậc 2: `30 VUs (1m)` $\rightarrow$ Bậc 3: `50 VUs (1m)` $\rightarrow$ Bậc 4: `100 VUs (1m)` $\rightarrow$ Hạ tải về `0 VUs` | `p(95) < 6000ms`, `error_rate < 15%` khi chưa vượt tải định mức, ghi nhận điểm bão hòa |
| **Spike Test** | Kiểm tra độ ổn định và khả năng đàn hồi (Resilience) khi lưu lượng truy cập tăng vọt đột ngột trong vài giây (ví dụ: flash sale, peak time push notification). | `5 VUs (30s)` $\rightarrow$ **VỌT 50 VUs trong 10s** $\rightarrow$ Giữ `1m` $\rightarrow$ Giảm về `5 VUs (10s)` $\rightarrow$ Quan sát phục hồi `1m` | Hệ thống không sập đổ hoàn toàn (no 502/503 cascade), thời gian hồi phục về baseline latency < 30s sau khi giảm tải |
| **Soak Test (Endurance)** | Chạy tải liên tục ở mức trung bình trong thời gian dài để phát hiện Memory Leak, rò rỉ Connection Pool, cạn kiệt tài nguyên Server (CPU/RAM). | Ramp-up `1m` $\rightarrow$ Duy trì ổn định `10 VUs` liên tục trong `30m` đến `4h` $\rightarrow$ Ramp-down `1m` | Tốc độ phản hồi (Latency Trend) không tăng tuyến tính theo thời gian; Tỷ lệ lỗi duy trì `< 2%` suốt toàn bộ chu kỳ |

---

## 2. MA TRẬN TEST CASES CHI TIẾT THEO TỪNG BỘ API

---

### MODULE 1: RESTFUL-BOOKER (HEROKUAPP) API
* **Base URL:** `https://restful-booker.herokuapp.com`
* **Đặc tính:** Public Hotel Booking API, hỗ trợ CRUD booking và xác thực Auth Token.

```
+---------------------------------------------------------------------------------------------------------------+
| Test Case ID          | Performance Type | Endpoint & Method     | Kịch bản / Scenario                       |
+---------------------------------------------------------------------------------------------------------------+
| TC_PERF_HEROKU_001    | Smoke Test       | GET /ping, POST /auth | Xác thực Server Readiness & Auth dưới 1 VU|
| TC_PERF_HEROKU_002    | Load Test        | GET /booking          | Tải duyệt danh sách Booking (10-20 VUs)   |
| TC_PERF_HEROKU_003    | Load Test        | POST /booking + GET   | Tải luồng tạo mới & xem Booking chi tiết  |
| TC_PERF_HEROKU_004    | Stress Test      | CRUD Full Booking     | Stress test chu trình đặt phòng 50-100 VUs|
| TC_PERF_HEROKU_005    | Spike Test       | POST /booking         | Đột biến đặt phòng giờ cao điểm (50 VUs)  |
| TC_PERF_HEROKU_006    | Soak Test        | Booking Query & Ping  | Kiểm tra rò rỉ tài nguyên trong 30 phút   |
+---------------------------------------------------------------------------------------------------------------+
```

#### TC_PERF_HEROKU_001: Smoke Test - Healthcheck & Token Generation
* **Mục tiêu:** Đảm bảo hệ thống Booker sẵn sàng tiếp nhận request và cấp phát Auth Token hợp lệ dưới 1 VU.
* **Cấu hình tải k6:** `VUs: 1`, `Duration: 1m`, `Threshold: p(95) < 2000ms, error_rate == 0%`.
* **Dữ liệu kiểm thử (Test Data):**
  * Headers: `Content-Type: application/json; Accept: application/json`
  * Auth Payload: `{"username": "admin", "password": "password123"}`
* **Các bước thực hiện (Test Steps):**
  1. Gửi `GET /ping` để kiểm tra trạng thái máy chủ.
  2. Gửi `POST /auth` kèm payload xác thực quản trị viên.
  3. Trích xuất token từ response body và gán vào biến context.
  4. Thiết lập thời gian nghỉ giả lập người dùng (Think time: 1s).
* **Kết quả mong đợi & Assertions:**
  * Endpoint `/ping` trả về HTTP `201 Created` (hoặc `200 OK`) trong `< 1000ms`.
  * Endpoint `/auth` trả về HTTP `200 OK` chứa trường `token` dạng String không rỗng.
  * Tỷ lệ request lỗi: `0%`.

#### TC_PERF_HEROKU_002: Load Test - Booking Catalog Browsing
* **Mục tiêu:** Đo lường hiệu năng và thời gian phản hồi khi nhiều khách hàng cùng lúc tra cứu danh sách đặt phòng.
* **Cấu hình tải k6:**
  * `Ramp-up`: 30s lên 10 VUs
  * `Sustained`: 2m giữ đều 10 VUs
  * `Ramp-down`: 30s về 0 VUs
* **Ngưỡng SLA (Thresholds):** `http_req_duration: p(95) < 3000ms`, `http_req_failed: rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):**
  * Query parameters ngẫu nhiên: `?checkin=2026-09-01`, `?checkout=2026-09-10`, `?firstname=John`
* **Các bước thực hiện (Test Steps):**
  1. VU gửi `GET /booking` lấy toàn bộ danh sách ID đặt phòng.
  2. VU gửi `GET /booking?checkin=2026-09-01&checkout=2026-09-10` lọc theo ngày lưu trú.
  3. Kiểm tra tính toàn vẹn của cấu trúc JSON trả về.
  4. Nghỉ ngẫu nhiên giữa các lần lặp: `randomThinkTime(1, 3)`.
* **Kết quả mong đợi & Assertions:**
  * HTTP status: `200 OK`.
  * Response body là một mảng (Array) chứa các object `{"bookingid": number}`.
  * Latency 95% requests hoàn tất trong `< 3000ms`, không xảy ra timeout/504 gateway error.

#### TC_PERF_HEROKU_003: Load Test - E2E Create & Inspect Booking Flow
* **Mục tiêu:** Đánh giá khả năng xử lý giao dịch ghi dữ liệu và truy vấn chi tiết đặt phòng theo chuỗi nghiệp vụ.
* **Cấu hình tải k6:** `Stages: [0 -> 10 VUs (1m), 10 VUs (3m), 10 -> 0 VUs (30s)]`.
* **Dữ liệu kiểm thử (Test Data - Traceable & Unique):**
  * Payload POST:
    ```json
    {
      "firstname": "Perf_Guest_{{timestamp}}_{{vu_id}}",
      "lastname": "Benchmark",
      "totalprice": 250,
      "depositpaid": true,
      "bookingdates": {
        "checkin": "2026-10-01",
        "checkout": "2026-10-05"
      },
      "additionalneeds": "Late Checkout, High-speed Wifi"
    }
    ```
* **Các bước thực hiện (Test Steps):**
  1. VU tạo mới thông tin đặt phòng qua `POST /booking`.
  2. Trích xuất `bookingid` được sinh ra từ response.
  3. VU gửi tiếp `GET /booking/{bookingid}` để xác nhận thông tin vừa tạo được lưu chính xác trong database.
  4. Thực hiện `sleep` ngẫu nhiên từ 1 đến 2 giây.
* **Kết quả mong đợi & Assertions:**
  * Bước 1: HTTP `200 OK`, response body chứa `bookingid` $> 0$ và nested object `booking`.
  * Bước 2: HTTP `200 OK`, trường `firstname` khớp chính xác với chuỗi ngẫu nhiên đã gửi.
  * 95% chu kỳ hoàn thành dưới ngưỡng 4000ms.

#### TC_PERF_HEROKU_004: Stress Test - Multi-step Hotel Management Under High Concurrency
* **Mục tiêu:** Xác định ngưỡng gãy (Breaking Point) của backend Herokuapp khi số lượng người dùng đồng thời tăng lên 50 - 100 VUs.
* **Cấu hình tải k6:**
  * `Stage 1`: 1m ramp-up lên 20 VUs
  * `Stage 2`: 1m ramp-up lên 50 VUs
  * `Stage 3`: 2m duy trì tại 50 VUs
  * `Stage 4`: 1m ramp-up lên 80 VUs
  * `Stage 5`: 1m ramp-down về 0 VUs
* **Dữ liệu kiểm thử (Test Data):** Token lấy từ setup stage, payload cập nhật phòng, payload xóa phòng.
* **Các bước thực hiện (Test Steps):**
  1. Gửi request tạo booking mới `POST /booking`.
  2. Gửi request cập nhật thông tin phòng qua `PUT /booking/{id}` (kèm `Cookie: token={{token}}`).
  3. Gửi request cập nhật một phần `PATCH /booking/{id}` thay đổi giá tiền `{"totalprice": 999}`.
  4. Gửi request hủy phòng `DELETE /booking/{id}`.
* **Kết quả mong đợi & Assertions:**
  * Ghi nhận Throughput tối đa (RPS) mà server duy trì trước khi bắt đầu xuất hiện mã lỗi `HTTP 429 / 500 / 503`.
  * Phân tích Latency degradation: Xác định mức tải (VUs) mà tại đó latency $p(95)$ vượt quá 6000ms.

#### TC_PERF_HEROKU_005: Spike Test - Flash Sale Booking Surge
* **Mục tiêu:** Kiểm tra khả năng chống chịu và phục hồi của hệ thống khi có 50 VUs đồng loạt gửi request đặt phòng trong 10 giây.
* **Cấu hình tải k6:**
  * Baseline: `5 VUs` trong 30s.
  * Spike: Bật vọt lên `50 VUs` trong 10s $\rightarrow$ duy trì `1m`.
  * Recovery: Hạ về `5 VUs` trong 10s $\rightarrow$ duy trì theo dõi `1m`.
* **Dữ liệu kiểm thử (Test Data):** JSON booking với `additionalneeds: "FlashSaleDeal"`.
* **Các bước thực hiện (Test Steps):**
  1. Thực hiện kịch bản `POST /booking` lặp liên tục.
  2. Theo dõi tỷ lệ phản hồi thành công và tỷ lệ nghẽn mạng trong giai đoạn spike.
  3. Đo thời gian hệ thống đưa response time trở lại trạng thái baseline sau khi hết spike.
* **Kết quả mong đợi & Assertions:**
  * Hệ thống không bị treo hoặc crash service hoàn toàn.
  * Tỷ lệ lỗi trong giai đoạn spike không vượt quá 25%.
  * Sau khi kết thúc spike 20 giây, latency trở lại mức bình thường ($< 2500ms$).

#### TC_PERF_HEROKU_006: Soak Test - Long-duration Availability & Connection Stability
* **Mục tiêu:** Đảm bảo server không bị cạn kiệt tài nguyên bộ nhớ hoặc connection pool khi chạy liên tục 30 phút ở mức tải 10 VUs.
* **Cấu hình tải k6:** `VUs: 10`, `Duration: 30m`, `Threshold: p(95) < 3500ms, error_rate < 0.02`.
* **Dữ liệu kiểm thử (Test Data):** Hỗn hợp 70% `GET /booking`, 20% `GET /ping`, 10% `POST /booking`.
* **Kết quả mong đợi & Assertions:**
  * Đồ thị thời gian phản hồi (Trend) là một đường đi ngang ổn định, không có xu hướng tăng dốc về cuối bài test.
  * Error rate ổn định $< 2\%$ xuyên suốt 30 phút.

---

### MODULE 2: SWAGGER PETSTORE API
* **Base URL:** `https://petstore.swagger.io/v2`
* **Đặc tính:** E-commerce Pet Store REST API, hỗ trợ quản lý kho thú cưng, đặt đơn hàng (Store Order) và quản lý User.

```
+---------------------------------------------------------------------------------------------------------------+
| Test Case ID          | Performance Type | Endpoint & Method     | Kịch bản / Scenario                       |
+---------------------------------------------------------------------------------------------------------------+
| TC_PERF_PETSTORE_001  | Smoke Test       | GET /store/inventory  | Kiểm tra kết nối kho hàng (1 VU)          |
| TC_PERF_PETSTORE_002  | Load Test        | GET /pet/findByStatus | Tải tìm kiếm Pet theo trạng thái (15 VUs) |
| TC_PERF_PETSTORE_003  | Load Test        | POST /pet & GET /pet  | Tải thêm mới & truy vấn thú cưng (15 VUs) |
| TC_PERF_PETSTORE_004  | Load Test        | POST /store/order     | Tải đặt hàng mua thú cưng (Order Flow)    |
| TC_PERF_PETSTORE_005  | Stress Test      | POST /pet + PUT /pet  | Đẩy tải tạo & sửa thông tin Pet đến 80 VUs|
| TC_PERF_PETSTORE_006  | Spike Test       | GET /store/inventory  | Đột biến tra cứu tồn kho flash deal 60 VUs|
+---------------------------------------------------------------------------------------------------------------+
```

#### TC_PERF_PETSTORE_001: Smoke Test - Store Inventory Validation
* **Mục tiêu:** Xác minh endpoint kiểm tra số lượng tồn kho của Petstore phản hồi chuẩn xác.
* **Cấu hình tải k6:** `VUs: 1`, `Duration: 1m`, `Threshold: p(95) < 1500ms, error_rate < 0.01`.
* **Dữ liệu kiểm thử (Test Data):** Headers: `Accept: application/json`.
* **Các bước thực hiện (Test Steps):**
  1. Gửi `GET /store/inventory`.
  2. Kiểm tra status code và các key trạng thái hàng trong kho (`available`, `pending`, `sold`).
* **Kết quả mong đợi & Assertions:**
  * HTTP `200 OK`.
  * Response body là JSON object chứa các số nguyên đại diện cho số lượng pet.
  * Error rate: `0%`.

#### TC_PERF_PETSTORE_002: Load Test - Search Pets by Filter Under Concurrency
* **Mục tiêu:** Đánh giá năng lực xử lý của database & API khi nhiều người dùng cùng lọc thú cưng theo status `available`, `pending`, `sold`.
* **Cấu hình tải k6:** `Stages: [0 -> 15 VUs (30s), 15 VUs (2m30s), 15 -> 0 VUs (30s)]`.
* **Ngưỡng SLA (Thresholds):** `http_req_duration: p(95) < 3000ms`, `http_req_failed: rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):** Query: `?status=available`, `?status=pending`, `?status=sold`.
* **Các bước thực hiện (Test Steps):**
  1. VU gửi request `GET /pet/findByStatus?status=available`.
  2. VU gửi request tiếp theo `GET /pet/findByStatus?status=pending`.
  3. Kiểm tra mảng kết quả và trường `status` của các phần tử.
  4. Nghỉ ngơi giữa các request: `randomThinkTime(1, 2)`.
* **Kết quả mong đợi & Assertions:**
  * HTTP `200 OK`.
  * Response body trả về mảng danh sách pet hợp lệ.
  * Tỷ lệ hoàn thành đúng hạn $> 95\%$.

#### TC_PERF_PETSTORE_003: Load Test - Concurrent Pet Registration & Verification
* **Mục tiêu:** Đo lường độ trễ khi tạo mới Pet với ID ngẫu nhiên và tra cứu lại ngay lập tức.
* **Cấu hình tải k6:** `Stages: [0 -> 10 VUs (30s), 10 VUs (2m), 10 -> 0 VUs (30s)]`.
* **Dữ liệu kiểm thử (Test Data):**
  * Pet ID: `getRandomInt(100000000, 999999999)`
  * Payload:
    ```json
    {
      "id": "{{pet_id}}",
      "category": { "id": 1, "name": "Dogs" },
      "name": "Husky_Perf_{{timestamp}}",
      "photoUrls": ["https://images.example.com/pet.jpg"],
      "tags": [{ "id": 101, "name": "load-test-tag" }],
      "status": "available"
    }
    ```
* **Các bước thực hiện (Test Steps):**
  1. Gửi `POST /pet` kèm payload trên.
  2. Trích xuất ID từ kết quả trả về.
  3. Gửi `GET /pet/{{pet_id}}` để kiểm tra độ trễ đồng bộ dữ liệu.
  4. Dọn dẹp dữ liệu (Tùy chọn): Gửi `DELETE /pet/{{pet_id}}`.
* **Kết quả mong đợi & Assertions:**
  * `POST /pet`: HTTP `200 OK`, `body.id == pet_id`.
  * `GET /pet/{{pet_id}}`: HTTP `200 OK`, `body.name` khớp với chuỗi khởi tạo.
  * Latency trung bình $< 2000ms$.

#### TC_PERF_PETSTORE_004: Load Test - Store Checkout Order Placement
* **Mục tiêu:** Kiểm tra khả năng xử lý đơn đặt hàng thú cưng dưới tải người dùng đồng thời.
* **Cấu hình tải k6:** `VUs: 15`, `Duration: 2m`, `Threshold: p(95) < 3500ms, error_rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):**
  * Order Payload:
    ```json
    {
      "id": "{{random_order_id}}",
      "petId": 198772,
      "quantity": 1,
      "shipDate": "2026-09-01T12:00:00.000Z",
      "status": "placed",
      "complete": true
    }
    ```
* **Các bước thực hiện (Test Steps):**
  1. VU gửi `POST /store/order` đặt mua thú cưng.
  2. Gửi `GET /store/order/{{order_id}}` lấy trạng thái giao hàng.
  3. Ngủ 1-2 giây giữa mỗi đơn hàng.
* **Kết quả mong đợi & Assertions:**
  * `POST /store/order` trả về HTTP `200 OK` với trường `status: "placed"`.
  * Không xuất hiện tình trạng Deadlock dữ liệu đơn hàng.

#### TC_PERF_PETSTORE_005: Stress Test - Heavy Pet Modification & Catalog Overload
* **Mục tiêu:** Tìm giới hạn chịu tải khi số lượng tác vụ cập nhật thông tin thú cưng tăng mạnh.
* **Cấu hình tải k6:** `Stages: [10 VUs (1m), 30 VUs (1m), 60 VUs (1m), 80 VUs (1m), 0 VUs (30s)]`.
* **Dữ liệu kiểm thử (Test Data):** Payload sửa đổi thông tin `PUT /pet` và form-data `POST /pet/{id}`.
* **Kết quả mong đợi & Assertions:**
  * Xác định điểm gãy mà tại đó server trả về lỗi `5xx` hoặc response time vượt 6000ms.

#### TC_PERF_PETSTORE_006: Spike Test - Inventory Flash Check
* **Mục tiêu:** Mô phỏng sự kiện khuyến mãi chớp nhoáng với 60 VUs truy cập tra cứu tồn kho trong vòng 10 giây.
* **Cấu hình tải k6:** `5 VUs (20s) -> Spike 60 VUs (10s) -> Giữ 40s -> 5 VUs (20s)`.
* **Kết quả mong đợi & Assertions:**
  * Server xử lý tốt đợt xung đột truy cập, tỷ lệ lỗi không vượt quá 20%, hệ thống phục hồi dưới 15 giây.

---

### MODULE 3: REQRES API
* **Base URL:** `https://reqres.in/api`
* **Đặc tính:** REST API Mock Service chuyên nghiệp cho việc kiểm thử Frontend/Mobile, hỗ trợ User pagination, Auth & Simulation.

```
+---------------------------------------------------------------------------------------------------------------+
| Test Case ID          | Performance Type | Endpoint & Method     | Kịch bản / Scenario                       |
+---------------------------------------------------------------------------------------------------------------+
| TC_PERF_REQRES_001    | Smoke Test       | GET /users?page=1     | Kiểm tra tính khả dụng của ReqRes (1 VU)  |
| TC_PERF_REQRES_002    | Load Test        | GET /users (Paging)   | Tải đọc danh sách User nhiều trang (15 VUs|
| TC_PERF_REQRES_003    | Load Test        | POST /users           | Tải tạo người dùng mới (15 VUs)           |
| TC_PERF_REQRES_004    | Load Test        | POST /login           | Tải xác thực đăng nhập người dùng (15 VUs)|
| TC_PERF_REQRES_005    | Stress Test      | Multi CRUD ReqRes Flow| Thử thách tải hỗn hợp đọc/ghi đến 70 VUs  |
| TC_PERF_REQRES_006    | Spike Test       | POST /login & GET user| Đột biến phiên đăng nhập (50 VUs)         |
+---------------------------------------------------------------------------------------------------------------+
```

#### TC_PERF_REQRES_001: Smoke Test - Public API Health & Pagination Readiness
* **Mục tiêu:** Xác minh ReqRes online và xử lý request danh sách cơ bản dưới 1 VU.
* **Cấu hình tải k6:** `VUs: 1`, `Duration: 1m`, `Threshold: p(95) < 1500ms, error_rate == 0%`.
* **Dữ liệu kiểm thử (Test Data):** `GET /api/users?page=2`.
* **Kết quả mong đợi & Assertions:**
  * HTTP `200 OK`.
  * Response body chứa trường `page: 2`, `data` là array với độ dài $> 0$.

#### TC_PERF_REQRES_002: Load Test - User Directory Paginated Queries
* **Mục tiêu:** Đo đạc hiệu năng khi đồng thời truy xuất danh sách người dùng trên các trang khác nhau.
* **Cấu hình tải k6:** `Stages: [0 -> 15 VUs (30s), 15 VUs (2m), 15 -> 0 VUs (30s)]`.
* **Ngưỡng SLA (Thresholds):** `p(95) < 3000ms`, `http_req_failed: rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):** Tham số `page` ngẫu nhiên từ `1` đến `4`.
* **Các bước thực hiện (Test Steps):**
  1. VU gửi `GET /api/users?page={{random_page}}`.
  2. VU gửi `GET /api/users/{{random_id}}` (ID từ 1 đến 12).
  3. Kiểm tra dữ liệu `email`, `first_name`, `avatar`.
  4. Nghỉ ngơi `randomThinkTime(1, 2)`.
* **Kết quả mong đợi & Assertions:**
  * HTTP `200 OK`.
  * Latency $p(95) < 3000ms$, $p(99) < 5000ms$.

#### TC_PERF_REQRES_003: Load Test - High-frequency User Registration/Creation
* **Mục tiêu:** Đo lường Throughput khi tạo mới profile người dùng liên tục.
* **Cấu hình tải k6:** `VUs: 15`, `Duration: 2m30s`, `Threshold: p(95) < 3500ms, error_rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):**
  * Payload: `{"name": "Perf_User_{{timestamp}}_{{vu_id}}", "job": "QA Automation Engineer"}`
* **Các bước thực hiện (Test Steps):**
  1. Gửi `POST /api/users` kèm payload.
  2. Kiểm tra `createdAt` và `id` được tạo tự động.
* **Kết quả mong đợi & Assertions:**
  * HTTP status: `201 Created`.
  * Trường `id` và `createdAt` tồn tại và có giá trị hợp lệ.

#### TC_PERF_REQRES_004: Load Test - Authentication Service (Login Flow)
* **Mục tiêu:** Kiểm tra khả năng xử lý dịch vụ đăng nhập với tài khoản mẫu hợp lệ.
* **Cấu hình tải k6:** `VUs: 15`, `Duration: 2m`, `Threshold: p(95) < 2500ms, error_rate < 0.03`.
* **Dữ liệu kiểm thử (Test Data):**
  * Payload: `{"email": "eve.holt@reqres.in", "password": "cityslicka"}`
* **Các bước thực hiện (Test Steps):**
  1. Gửi `POST /api/login` kèm thông tin đăng nhập.
  2. Xác thực chuỗi `token` trả về.
* **Kết quả mong đợi & Assertions:**
  * HTTP `200 OK`.
  * Response chứa trường `token` dạng string hợp lệ (`QpwL5tke4Pnpja7X4`).

#### TC_PERF_REQRES_005: Stress Test - Heavy Combined Operations Under Escalating Concurrency
* **Mục tiêu:** Kiểm tra độ bền bỉ của ReqRes API khi chịu tải kết hợp (List $\rightarrow$ Get Detail $\rightarrow$ Create $\rightarrow$ Update $\rightarrow$ Login) với 20 $\rightarrow$ 50 $\rightarrow$ 70 VUs.
* **Cấu hình tải k6:** `Stages: [20 VUs (1m), 50 VUs (1m30s), 70 VUs (1m30s), 0 VUs (30s)]`.
* **Kết quả mong đợi & Assertions:**
  * Hệ thống duy trì tính ổn định, xác định chính xác tỷ lệ lỗi suy giảm khi tải vượt ngưỡng.

#### TC_PERF_REQRES_006: Spike Test - Login Surge Simulation
* **Mục tiêu:** Đánh giá tính sẵn sàng của Auth microservice khi có 50 VUs đồng loạt gửi lệnh login trong thời gian ngắn (10s).
* **Cấu hình tải k6:** `3 VUs (20s) -> 50 VUs (10s) -> Giữ 50 VUs (40s) -> 3 VUs (20s)`.
* **Kết quả mong đợi & Assertions:**
  * Không xảy ra nghẽn mạng nghiêm trọng, tỷ lệ lỗi không vượt quá 20%, thời gian phục hồi nhanh.

---

### MODULE 4: TODOIST API
* **Base URL:** `https://api.todoist.com/api/v1` (hoặc `/rest/v2`)
* **Đặc tính:** Enterprise Task Management API, yêu cầu Bearer Token Authorization, thao tác Projects, Tasks, Sections.

```
+---------------------------------------------------------------------------------------------------------------+
| Test Case ID          | Performance Type | Endpoint & Method     | Kịch bản / Scenario                       |
+---------------------------------------------------------------------------------------------------------------+
| TC_PERF_TODOIST_001   | Smoke Test       | GET /projects         | Xác thực Token & lấy Projects (1 VU)      |
| TC_PERF_TODOIST_002   | Load Test        | GET /tasks & /projects| Tải đồng bộ danh sách công việc (10 VUs)  |
| TC_PERF_TODOIST_003   | Load Test        | POST /tasks           | Tải tạo công việc mới tốc độ cao (10 VUs) |
| TC_PERF_TODOIST_004   | Load Test        | Complete Task Flow    | Tải chu trình Tạo -> Đóng Task (10 VUs)   |
| TC_PERF_TODOIST_005   | Stress & Rate Lim| POST /tasks (Burst)   | Kiểm thử ngưỡng Rate Limiting & 40 VUs    |
| TC_PERF_TODOIST_006   | Soak Test        | Sync Tasks Stream     | Tải đồng bộ liên tục 20 phút kiểm tra leak|
+---------------------------------------------------------------------------------------------------------------+
```

#### TC_PERF_TODOIST_001: Smoke Test - Bearer Auth & Project Sync
* **Mục tiêu:** Đảm bảo Bearer Token hợp lệ và có thể kết nối lấy danh mục dự án cá nhân dưới 1 VU.
* **Cấu hình tải k6:** `VUs: 1`, `Duration: 1m`, `Threshold: p(95) < 2000ms, error_rate == 0%`.
* **Dữ liệu kiểm thử (Test Data):**
  * Headers: `Authorization: Bearer {{TODOIST_BEARER_TOKEN}}`, `Content-Type: application/json`.
* **Các bước thực hiện (Test Steps):**
  1. Gửi request `GET /projects`.
  2. Kiểm tra danh sách project trả về.
* **Kết quả mong đợi & Assertions:**
  * HTTP status: `200 OK` (hoặc xử lý fallback nếu không truyền token).
  * Response body là danh sách JSON chứa thông tin các project.

#### TC_PERF_TODOIST_002: Load Test - User Workspace Task Synchronization
* **Mục tiêu:** Đo lường thời gian tải và độ trễ khi nhiều phiên làm việc cùng đồng bộ danh sách Project và Task.
* **Cấu hình tải k6:** `Stages: [0 -> 10 VUs (30s), 10 VUs (2m), 10 -> 0 VUs (30s)]`.
* **Ngưỡng SLA (Thresholds):** `p(95) < 3000ms`, `http_req_failed: rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):** Bearer Token từ cấu hình môi trường.
* **Các bước thực hiện (Test Steps):**
  1. VU gửi `GET /projects` lấy danh mục dự án.
  2. VU gửi `GET /tasks` lấy toàn bộ danh sách công việc hiện hành.
  3. Nghỉ ngẫu nhiên: `randomThinkTime(1, 2)`.
* **Kết quả mong đợi & Assertions:**
  * Cả 2 request đều trả về HTTP `200 OK`.
  * Thời gian phản hồi 95% dưới 3000ms.

#### TC_PERF_TODOIST_003: Load Test - Rapid Task Creation Flow
* **Mục tiêu:** Đo lường khả năng xử lý khi người dùng liên tục tạo mới các task công việc với độ ưu tiên và thời hạn khác nhau.
* **Cấu hình tải k6:** `Stages: [0 -> 10 VUs (30s), 10 VUs (2m), 10 -> 0 VUs (30s)]`.
* **Dữ liệu kiểm thử (Test Data):**
  * Payload:
    ```json
    {
      "content": "Perf_Task_{{timestamp}}_{{vu_id}}",
      "due_string": "tomorrow at 14:00",
      "priority": 4
    }
    ```
* **Các bước thực hiện (Test Steps):**
  1. Gửi `POST /tasks` kèm payload khởi tạo công việc.
  2. Trích xuất `id` của task từ response.
  3. Nghỉ 1-2 giây.
* **Kết quả mong đợi & Assertions:**
  * HTTP status: `200 OK` hoặc `201 Created`.
  * Task ID trả về hợp lệ và nội dung `content` khớp với payload.

#### TC_PERF_TODOIST_004: Load Test - Task Lifecycle (Create, Query, Close)
* **Mục tiêu:** Kiểm tra hiệu năng của chuỗi thao tác hoàn chỉnh: Tạo task $\rightarrow$ Lấy chi tiết $\rightarrow$ Đóng task hoàn thành.
* **Cấu hình tải k6:** `VUs: 10`, `Duration: 2m30s`, `Threshold: p(95) < 4000ms, error_rate < 0.05`.
* **Dữ liệu kiểm thử (Test Data):** Payload task mới, URL close task `/tasks/{id}/close`.
* **Các bước thực hiện (Test Steps):**
  1. Tạo mới task bằng `POST /tasks`.
  2. Lấy thông tin task bằng `GET /tasks/{id}`.
  3. Đánh dấu hoàn thành task bằng `POST /tasks/{id}/close`.
* **Kết quả mong đợi & Assertions:**
  * Toàn bộ các bước trong flow trả về mã thành công (`200` / `204`).
  * 95% các chu kỳ hoàn thành dưới ngưỡng 4000ms.

#### TC_PERF_TODOIST_005: Stress & Rate Limiting Test - Burst Task Submissions
* **Mục tiêu:** Kiểm tra cơ chế giới hạn tần suất (Rate Limiting HTTP 429) và tính ổn định của Todoist API khi bị gọi dồn dập với 40 VUs.
* **Cấu hình tải k6:** `Stages: [5 VUs (30s), 20 VUs (1m), 40 VUs (1m), 0 VUs (30s)]`.
* **Kết quả mong đợi & Assertions:**
  * Ghi nhận chính xác ngưỡng mà tại đó server kích hoạt cơ chế `429 Too Many Requests`.
  * Response kèm theo header `Retry-After` đúng chuẩn RESTful specification.

#### TC_PERF_TODOIST_006: Soak Test - Continuous Task Stream & State Polling
* **Mục tiêu:** Kiểm tra độ ổn định của API khi thực hiện query liên tục trong 20 phút ở mức 5 VUs.
* **Cấu hình tải k6:** `VUs: 5`, `Duration: 20m`, `Threshold: p(95) < 3000ms, error_rate < 0.02`.
* **Kết quả mong đợi & Assertions:**
  * Không phát sinh lỗi suy giảm hiệu năng theo thời gian.
  * Tỷ lệ lỗi duy trì dưới 2% trong suốt 20 phút.

---

## 3. THÔNG SỐ VÀ TIÊU CHUẨN THÔNG QUA (PASS/FAIL CRITERIA)

Dựa trên hướng dẫn của bộ skill k6, toàn bộ bài test kiểm thử hiệu năng tự động cần đối chiếu với các chỉ số đo lường (Key Performance Indicators - KPIs) sau:

1. **Response Time Percentiles:**
   - $p(90) \le 2000ms$: 90% các request phải được phục vụ trong vòng 2 giây.
   - $p(95) \le 3000ms$: 95% các request phải được phục vụ trong vòng 3 giây.
   - $p(99) \le 6000ms$: 99% các request phải được phục vụ trong vòng 6 giây (loại trừ các đột biến mạng internet).
2. **Error Rate (Tỷ lệ lỗi):**
   - Smoke Test: `error_rate < 1%`
   - Load Test: `error_rate < 5%`
   - Stress / Spike Test: `error_rate < 20%`
3. **Checks Rate (Tỷ lệ xác thực nghiệp vụ thành công):**
   - `checks > 95%` trên toàn bộ các bài test có tải thông thường.
4. **Throughput (RPS - Requests Per Second):**
   - Đạt ngưỡng Throughput kỳ vọng tương ứng với số lượng Virtual Users (VUs) được cấu hình mà không làm sụp đổ server.

---

## 4. HƯỚNG DẪN THỰC THI (EXECUTION COMMANDS)

### Chạy Smoke Test (Xác nhận nhanh hệ thống)
```bash
k6 run k6/scripts/smoke-test.js
```

### Chạy Load Test (Tất cả APIs hoặc chọn lọc từng API)
```bash
# Chạy toàn bộ 4 APIs
k6 run k6/scripts/load-test.js

# Chạy riêng từng API bằng Environment Variable
k6 run -e TARGET_API=herokuapp k6/scripts/load-test.js
k6 run -e TARGET_API=petstore k6/scripts/load-test.js
k6 run -e TARGET_API=reqres k6/scripts/load-test.js
k6 run -e TARGET_API=todoist -e TODOIST_BEARER_TOKEN="your_token" k6/scripts/load-test.js
```

### Chạy Stress Test
```bash
k6 run k6/scripts/stress-test.js
```

### Chạy Spike Test
```bash
k6 run k6/scripts/spike-test.js
```

### Chạy Soak Test
```bash
k6 run k6/scripts/soak-test.js
```
