# 📘 HƯỚNG DẪN CHI TIẾT CẤU HÌNH THỦ CÔNG JMETER CHO BỘ TEST CASE KIỂM THỬ HIỆU NĂNG & LOAD TESTING

> **Áp dụng cho:** 4 Bộ APIs (**Herokuapp Restful-Booker, Swagger Petstore, ReqRes, Todoist**)  
> **Tham chiếu Test Cases:** [`manual_test_cases/k6_Performance_Load_Test_Cases.md`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/manual_test_cases/k6_Performance_Load_Test_Cases.md)  
> **Phiên bản JMeter khuyến nghị:** Apache JMeter 5.5+ / 5.6.x (Java 11+)

---

## 📑 MỤC LỤC
1. [Chuẩn bị Môi trường & Nguyên tắc Cấu trúc Test Plan](#1-chuẩn-bị-môi-trường--nguyên-tắc-cấu-trúc-test-plan)
2. [Chiến lược Sinh Dữ liệu Kiểm thử (Test Data) trong JMeter](#2-chiến-lược-sinh-dữ-liệu-kiểm-thử-test-data-trong-jmeter)
3. [Cấu hình Thread Group tương ứng các Kịch bản Performance](#3-cấu-hình-thread-group-tương-ứng-các-kịch-bản-performance)
4. [Hướng dẫn Step-by-Step cho Từng Bộ API](#4-hướng-dẫn-step-by-step-cho-từng-bộ-api)
   * [Module 1: Herokuapp (Restful-Booker) API](#module-1-herokuapp-restful-booker-api)
   * [Module 2: Swagger Petstore API](#module-2-swagger-petstore-api)
   * [Module 3: ReqRes Mock API](#module-3-reqres-mock-api)
   * [Module 4: Todoist API](#module-4-todoist-api)
5. [Cấu hình Assertions, SLA & Listeners Báo cáo](#5-cấu-hình-assertions-sla--listeners-báo-cáo)
6. [Quy trình Chạy Tải Thực tế qua CLI (Non-GUI Mode)](#6-quy-trình-chạy-tải-thực-tế-qua-cli-non-gui-mode)

---

## 1. CHUẨN BỊ MÔI TRƯỜNG & NGUYÊN TẮC CẤU TRÚC TEST PLAN

### 1.1. Cài đặt Plugins cần thiết (JMeter Plugins Manager)
Để cấu hình các kịch bản tải phức tạp (Stress bậc thang, Spike vọt nhanh), bạn nên cài đặt các plugin sau thông qua **Plugins Manager**:
* **Custom Thread Groups** (chứa *Ultimate Thread Group*, *Concurrency Thread Group*, *Stepping Thread Group*).
* **3 Basic Graphs** & **Composite Graph** (đo lường Throughput, Response Time theo thời gian).
* **Dummy Sampler** (phục vụ debug luồng dữ liệu).

### 1.2. Cấu trúc Cây Thư mục Test Plan Chuẩn (Best Practice)
Một Test Plan chuyên nghiệp trên giao diện JMeter phải tuân theo cấu trúc phân cấp:

```
Test Plan: [Performance_Multi_API_Suite]
 ├── ⚙️ User Defined Variables (Khai báo Base URL, Global Config)
 ├── 🌐 HTTP Request Defaults (Cấu hình Default Protocol: https, Timeout)
 ├── 📋 HTTP Header Manager (Content-Type, Accept, User-Agent)
 ├── 🍪 HTTP Cookie Manager (Quản trị Session & Auth Cookie)
 ├── ⏳ Uniform Random Timer (Mô phỏng Think Time người dùng thật)
 ├── 👥 Thread Groups (Phân tách theo loại test hoặc module API)
 │    ├── 🔄 Logic Controller / Transaction Controller (Nhóm flow nghiệp vụ)
 │    │    ├── 🚀 HTTP Request Sampler (Gửi Request API)
 │    │    │    ├── 🧩 JSR223 PreProcessor (Sinh dynamic payload/timestamp)
 │    │    │    ├── 🎯 JSON Extractor (Trích xuất Token/ID)
 │    │    │    ├── ⏱️ Duration Assertion (Đo SLA Response Time)
 │    │    │    └── ✅ Response Assertion (Kiểm tra Status Code/Body)
 └── 📊 Listeners (Summary Report, Aggregate Report, Backend Listener)
```

---

## 2. CHIẾN LƯỢC SINH DỮ LIỆU KIỂM THỬ (TEST DATA) TRONG JMETER

Để tránh trùng lặp dữ liệu và mô phỏng chính xác hành vi người dùng, áp dụng 3 phương pháp sau:

### 2.1. Sử dụng Built-in Functions của JMeter (Nhanh & Tiện lợi)
* **Sinh số ngẫu nhiên:** `${__Random(100000, 999999, RANDOM_ID)}`
* **Sinh Timestamp hiện tại (Epoch ms):** `${__time(,CURRENT_TIME)}`
* **Sinh Date format:** `${__time(yyyy-MM-dd,CHECKIN_DATE)}`
* **Sinh chuỗi ngẫu nhiên (Alphanumeric):** `${__RandomString(8,abcdefghijklmnopqrstuvwxyz0123456789,RANDOM_STR)}`
* **Sinh UUID unique:** `${__UUID()}`
* **Lấy số thứ tự Thread/VU hiện tại:** `${__threadNum}`

### 2.2. Sử dụng JSR223 PreProcessor (Groovy) để tạo Traceable Dynamic Data
Thêm **JSR223 PreProcessor** (ngay dưới HTTP Request) để tạo đối tượng dữ liệu có ý nghĩa và có thể truy vết (traceable):

```groovy
// Language: groovy
long timestamp = System.currentTimeMillis();
int threadNum = ctx.getThreadNum() + 1;

// Sinh tên và email duy nhất
String uniqueName = "Perf_User_" + timestamp + "_T" + threadNum;
String uniqueEmail = "perf_user_" + timestamp + "@benchmark.test";
int randomPrice = org.apache.commons.lang3.RandomUtils.nextInt(100, 500);

// Đặt vào biến context của JMeter để dùng ở body: ${dynamicName}, ${dynamicEmail}, ${dynamicPrice}
vars.put("dynamicName", uniqueName);
vars.put("dynamicEmail", uniqueEmail);
vars.put("dynamicPrice", String.valueOf(randomPrice));
```

### 2.3. Sử dụng CSV Data Set Config (Dữ liệu cố định theo danh sách)
1. **Click chuột phải vào Thread Group** $\rightarrow$ `Add` $\rightarrow$ `Config Element` $\rightarrow$ `CSV Data Set Config`.
2. Cấu hình các thông số:
   * **Filename:** `data/users_payload.csv`
   * **Variable Names:** `username,password,expectedRole`
   * **Delimiter:** `,`
   * **Recycle on EOF:** `True` (Tự lặp lại khi hết dòng)
   * **Sharing Mode:** `All threads` (Các VU chia sẻ dữ liệu trong file)

---

## 3. CẤU HÌNH THREAD GROUP TƯƠNG ỨNG CÁC KỊCH BẢN PERFORMANCE

| Loại Test | Loại Thread Group khuyến nghị | Tham số cấu hình chi tiết trên JMeter |
| :--- | :--- | :--- |
| **Smoke Test** | `Standard Thread Group` | • **Number of Threads (users):** `1`<br>• **Ramp-up period (seconds):** `1`<br>• **Loop Count:** `1` (hoặc check *Infinite* và set *Duration: 60s*) |
| **Load Test (Average Load)** | `Standard Thread Group` hoặc `jp@gc - Stepping Thread Group` | • **Number of Threads:** `10` đến `15`<br>• **Ramp-up period:** `30` giây<br>• **Duration:** `120` đến `180` giây (2-3 phút)<br>• **Startup delay:** `0` |
| **Stress Test (Tăng bậc thang)** | `jp@gc - Ultimate Thread Group` (Plugin) | Cấu hình bảng **Threads Schedule**:<br>1. *Row 1:* Start 10 VUs in 30s, Hold 60s, Shutdown 10s<br>2. *Row 2:* Start 20 VUs at 60s (Ramp 30s), Hold 60s, Shutdown 10s<br>3. *Row 3:* Start 30 VUs at 150s (Ramp 30s), Hold 60s, Shutdown 10s<br>4. *Row 4:* Start 20 VUs at 240s (Ramp 30s), Hold 60s, Shutdown 10s *(Tổng đạt 80 VUs)* |
| **Spike Test (Đột biến tức thời)** | `jp@gc - Ultimate Thread Group` | Cấu hình bảng **Threads Schedule**:<br>• *Row 1 (Baseline):* 5 VUs, Ramp 5s, Hold 180s, Shutdown 5s<br>• *Row 2 (Spike):* 45 VUs, Initial Delay: 30s, **Ramp-up: 5s**, **Hold: 60s**, Shutdown 5s |
| **Soak Test (Chạy bền vững)** | `Standard Thread Group` | • **Number of Threads:** `5` đến `10`<br>• **Ramp-up period:** `60` giây<br>• **Same user on each iteration:** Uncheck (giả lập new session)<br>• **Duration:** `1800` giây (30 phút) đến `7200` giây (2 giờ) |

---

## 4. HƯỚNG DẪN STEP-BY-STEP CHO TỪNG BỘ API

---

### MODULE 1: HEROKUAPP (RESTFUL-BOOKER) API
* **Base URL:** `https://restful-booker.herokuapp.com`

```
Test Plan Structure for Herokuapp:
 ├── User Defined Variables: BASE_URL = restful-booker.herokuapp.com, PROTOCOL = https
 ├── HTTP Request Defaults: Server Name = ${BASE_URL}, Protocol = ${PROTOCOL}
 ├── HTTP Header Manager: Content-Type = application/json, Accept = application/json
 └── Thread Group: [Herokuapp_Performance_Suite]
      ├── 1. POST - Auth Token Generator (Extracts ${BOOKER_TOKEN})
      ├── 2. GET - Ping Healthcheck
      ├── 3. GET - List Bookings (Filter by Dates)
      ├── 4. POST - Create Booking (Extracts ${BOOKING_ID})
      ├── 5. GET - Get Booking Detail (Verify Firstname)
      ├── 6. PUT/PATCH - Update Booking (Header Cookie: token=${BOOKER_TOKEN})
      └── 7. DELETE - Delete Booking
```

#### Chi tiết từng bước cấu hình:

#### Bước 1.1: Tạo User Defined Variables & HTTP Defaults
1. Chuột phải `Test Plan` $\rightarrow$ `Add` $\rightarrow$ `Config Element` $\rightarrow$ `User Defined Variables`.
   * Name: `HEROKU_HOST`, Value: `restful-booker.herokuapp.com`
   * Name: `PROTOCOL`, Value: `https`
2. Chuột phải `Test Plan` $\rightarrow$ `Add` $\rightarrow$ `Config Element` $\rightarrow$ `HTTP Request Defaults`.
   * Server Name or IP: `${HEROKU_HOST}`, Protocol: `${PROTOCOL}`.

#### Bước 1.2: Cấu hình Sinh Auth Token (POST /auth)
1. Chuột phải Thread Group $\rightarrow$ `Add` $\rightarrow$ `Sampler` $\rightarrow$ `HTTP Request`.
   * **Name:** `Heroku_01_Auth_CreateToken`
   * **Method:** `POST`, **Path:** `/auth`
   * **Body Data:**
     ```json
     {
       "username": "admin",
       "password": "password123"
     }
     ```
2. Thêm **JSON Extractor** dưới Sampler này (Chuột phải Sampler $\rightarrow$ `Add` $\rightarrow$ `Post Processors` $\rightarrow$ `JSON Extractor`):
   * **Names of created variables:** `BOOKER_TOKEN`
   * **JSON Path expressions:** `$.token`
   * **Match No. (0 for Random):** `1`
   * **Default Values:** `NOT_FOUND`

#### Bước 1.3: Cấu hình Ping Healthcheck (GET /ping)
1. Thêm `HTTP Request`: **Name:** `Heroku_02_Get_Ping`, **Method:** `GET`, **Path:** `/ping`.
2. Thêm **Response Assertion**:
   * **Field to Test:** `Response Code`
   * **Patterns to Test:** `201` (hoặc `200`)

#### Bước 1.4: Cấu hình Tra cứu danh sách Booking (GET /booking)
1. Thêm `HTTP Request`: **Name:** `Heroku_03_Get_BookingsList`, **Method:** `GET`, **Path:** `/booking`.
2. Trong tab **Parameters**, thêm:
   * Name: `checkin`, Value: `2026-09-01`
   * Name: `checkout`, Value: `2026-09-10`

#### Bước 1.5: Cấu hình Tạo mới Booking với Dữ liệu Động (POST /booking)
1. Thêm `HTTP Request`: **Name:** `Heroku_04_Post_CreateBooking`, **Method:** `POST`, **Path:** `/booking`.
2. Thêm **JSR223 PreProcessor** (Groovy) để tạo tên động:
   ```groovy
   String guestName = "Guest_" + System.currentTimeMillis() + "_" + ctx.getThreadNum();
   vars.put("guestName", guestName);
   ```
3. Trong tab **Body Data**, nhập:
   ```json
   {
     "firstname": "${guestName}",
     "lastname": "PerformanceBenchmark",
     "totalprice": ${__Random(150, 450)},
     "depositpaid": true,
     "bookingdates": {
       "checkin": "2026-10-01",
       "checkout": "2026-10-05"
     },
     "additionalneeds": "High Speed Wifi, Late Checkout"
   }
   ```
4. Thêm **JSON Extractor** để lấy `bookingid`:
   * **Variable Name:** `CREATED_BOOKING_ID`
   * **JSON Path:** `$.bookingid`

#### Bước 1.6: Cấu hình Xác thực Booking Detail (GET /booking/{id})
1. Thêm `HTTP Request`: **Name:** `Heroku_05_Get_BookingDetail`, **Method:** `GET`, **Path:** `/booking/${CREATED_BOOKING_ID}`.
2. Thêm **JSON Assertion** (Chuột phải Sampler $\rightarrow$ `Add` $\rightarrow$ `Assertions` $\rightarrow$ `JSON Assertion`):
   * **JSON Path:** `$.firstname`
   * **Expected Value:** `${guestName}`
   * Check vào ô: `Additionally assert value`

#### Bước 1.7: Cấu hình Cập nhật & Xóa Booking (PUT & DELETE)
1. Thêm `HTTP Header Manager` riêng cho request PUT/DELETE:
   * Name: `Cookie`, Value: `token=${BOOKER_TOKEN}`
2. Thêm `HTTP Request`: **Name:** `Heroku_06_Delete_Booking`, **Method:** `DELETE`, **Path:** `/booking/${CREATED_BOOKING_ID}`.

---

### MODULE 2: SWAGGER PETSTORE API
* **Base URL:** `https://petstore.swagger.io/v2`

```
Test Plan Structure for Petstore:
 ├── User Defined Variables: PETSTORE_HOST = petstore.swagger.io, BASE_PATH = /v2
 └── Thread Group: [Petstore_Performance_Suite]
      ├── 1. GET - Store Inventory (/v2/store/inventory)
      ├── 2. GET - Find Pets By Status (/v2/pet/findByStatus?status=available)
      ├── 3. POST - Create Pet (${RANDOM_PET_ID})
      ├── 4. GET - Get Pet By ID (/v2/pet/${RANDOM_PET_ID})
      └── 5. POST - Place Store Order (/v2/store/order)
```

#### Chi tiết từng bước cấu hình:

#### Bước 2.1: Cấu hình Endpoint Tra cứu Tồn kho (GET /store/inventory)
1. Thêm `HTTP Request`:
   * **Server Name:** `petstore.swagger.io`, **Protocol:** `https`
   * **Method:** `GET`, **Path:** `/v2/store/inventory`
2. Thêm **JSON Assertion**:
   * **JSON Path:** `$.available` (Xác nhận trường tồn kho `available` tồn tại).

#### Bước 2.2: Cấu hình Tìm kiếm Thú cưng theo Bộ lọc (GET /pet/findByStatus)
1. Thêm `HTTP Request`: **Method:** `GET`, **Path:** `/v2/pet/findByStatus`.
2. Thêm Parameter: `status` = `available`.
3. Thêm **Response Assertion**: Text Response chứa `"status":"available"`.

#### Bước 2.3: Cấu hình Tạo mới Thú cưng với ID ngẫu nhiên (POST /pet)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/v2/pet`.
2. Thêm **User Parameters** hoặc **JSR223 PreProcessor** sinh Pet ID:
   ```groovy
   int petId = org.apache.commons.lang3.RandomUtils.nextInt(1000000, 9999999);
   vars.put("RANDOM_PET_ID", String.valueOf(petId));
   vars.put("PET_NAME", "Husky_Perf_" + petId);
   ```
3. **Body Data:**
   ```json
   {
     "id": ${RANDOM_PET_ID},
     "category": { "id": 1, "name": "Dogs" },
     "name": "${PET_NAME}",
     "photoUrls": ["https://images.example.com/pet.jpg"],
     "tags": [{ "id": 101, "name": "load-test-tag" }],
     "status": "available"
   }
   ```

#### Bước 2.4: Cấu hình Tra cứu Thú cưng vừa tạo (GET /pet/{id})
1. Thêm `HTTP Request`: **Method:** `GET`, **Path:** `/v2/pet/${RANDOM_PET_ID}`.
2. Thêm **JSON Assertion**:
   * **JSON Path:** `$.name`
   * **Expected Value:** `${PET_NAME}`

#### Bước 2.5: Cấu hình Đặt đơn hàng Mua thú cưng (POST /store/order)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/v2/store/order`.
2. **Body Data:**
   ```json
   {
     "id": ${__Random(10000, 99999)},
     "petId": ${RANDOM_PET_ID},
     "quantity": 1,
     "shipDate": "${__time(yyyy-MM-dd'T'HH:mm:ss.SSS'Z')}",
     "status": "placed",
     "complete": true
   }
   ```
3. Thêm **JSON Assertion**: `$.status` phải bằng `placed`.

---

### MODULE 3: REQRES MOCK API
* **Base URL:** `https://reqres.in/api`

```
Test Plan Structure for ReqRes:
 ├── User Defined Variables: REQRES_HOST = reqres.in, BASE_PATH = /api
 └── Thread Group: [ReqRes_Performance_Suite]
      ├── 1. GET - List Users with Paging (/api/users?page=${__Random(1,4)})
      ├── 2. GET - Single User Details (/api/users/${__Random(1,12)})
      ├── 3. POST - Create User Profile (/api/users)
      └── 4. POST - User Login Simulation (/api/login)
```

#### Chi tiết từng bước cấu hình:

#### Bước 3.1: Cấu hình Danh sách Người dùng Phân trang (GET /api/users)
1. Thêm `HTTP Request`:
   * **Server Name:** `reqres.in`, **Protocol:** `https`
   * **Method:** `GET`, **Path:** `/api/users`
2. **Parameters:**
   * Name: `page`, Value: `${__Random(1,4)}` (Tạo tải ngẫu nhiên trên các trang khác nhau).
3. Thêm **JSON Assertion**:
   * **JSON Path:** `$.data[0].id` (Đảm bảo mảng data có phần tử).

#### Bước 3.2: Cấu hình Lấy thông tin Chi tiết Người dùng (GET /api/users/{id})
1. Thêm `HTTP Request`: **Method:** `GET`, **Path:** `/api/users/${__Random(1,12)}`.
2. Thêm **Duration Assertion**: 95% requests phải hoàn thành dưới `2000ms`.

#### Bước 3.3: Cấu hình Tạo Người dùng Mới Tốc độ cao (POST /api/users)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/api/users`.
2. **Body Data:**
   ```json
   {
     "name": "Perf_User_${__time()}_${__threadNum}",
     "job": "Senior QA Automation Engineer"
   }
   ```
3. Thêm **Response Assertion**: Response Code = `201`.
4. Thêm **JSON Extractor**: `$.id` lưu vào biến `NEW_USER_ID`.

#### Bước 3.4: Cấu hình Xác thực Đăng nhập (POST /api/login)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/api/login`.
2. **Body Data:**
   ```json
   {
     "email": "eve.holt@reqres.in",
     "password": "cityslicka"
   }
   ```
3. Thêm **JSON Assertion**:
   * **JSON Path:** `$.token` (Đảm bảo token được cấp phát).

---

### MODULE 4: TODOIST API
* **Base URL:** `https://api.todoist.com/api/v1` (hoặc `/rest/v2`)
* **Xác thực:** Yêu cầu `Authorization: Bearer <TOKEN>`

```
Test Plan Structure for Todoist:
 ├── HTTP Header Manager (Authorization: Bearer ${TODOIST_BEARER_TOKEN})
 └── Thread Group: [Todoist_Performance_Suite]
      ├── 1. GET - Sync Projects (/rest/v2/projects)
      ├── 2. GET - Sync Tasks (/rest/v2/tasks)
      ├── 3. POST - Create Task (${CREATED_TASK_ID})
      ├── 4. GET - Get Task Detail (/rest/v2/tasks/${CREATED_TASK_ID})
      └── 5. POST - Close Task (/rest/v2/tasks/${CREATED_TASK_ID}/close)
```

#### Chi tiết từng bước cấu hình:

#### Bước 4.1: Cấu hình Authorization Header
1. Chuột phải Thread Group Todoist $\rightarrow$ `Add` $\rightarrow$ `Config Element` $\rightarrow$ `HTTP Header Manager`.
2. Thêm Header:
   * **Name:** `Authorization`
   * **Value:** `Bearer ${__P(TODOIST_TOKEN,your_default_token_here)}` *(Hỗ trợ truyền token từ dòng lệnh qua `-JTODOIST_TOKEN=...`)*.
   * **Name:** `Content-Type`, **Value:** `application/json`.

#### Bước 4.2: Cấu hình Lấy Danh mục Dự án & Công việc (GET /projects & GET /tasks)
1. Thêm `HTTP Request`: **Server Name:** `api.todoist.com`, **Method:** `GET`, **Path:** `/rest/v2/projects`.
2. Thêm `HTTP Request`: **Method:** `GET`, **Path:** `/rest/v2/tasks`.

#### Bước 4.3: Cấu hình Tạo Task Mới (POST /tasks)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/rest/v2/tasks`.
2. **Body Data:**
   ```json
   {
     "content": "JMeter Task Performance Benchmark ${__time()}",
     "due_string": "tomorrow at 12:00",
     "priority": 4
   }
   ```
3. Thêm **JSON Extractor**:
   * **Variable Name:** `TODOIST_TASK_ID`
   * **JSON Path:** `$.id`

#### Bước 4.4: Cấu hình Đóng hoàn thành Task (POST /tasks/{id}/close)
1. Thêm `HTTP Request`: **Method:** `POST`, **Path:** `/rest/v2/tasks/${TODOIST_TASK_ID}/close`.
2. Thêm **Response Assertion**: Response Code = `204` (hoặc `200`).

#### Bước 4.5: Xử lý Kịch bản Stress & Rate Limiting (HTTP 429)
1. Với bài test Stress Todoist (TC_PERF_TODOIST_005), khi tần suất request quá cao, server sẽ trả về mã `429 Too Many Requests`.
2. Để JMeter không đánh dấu fail đỏ khi gặp 429 có chủ đích:
   * Thêm **Response Assertion** dưới request.
   * Check vào ô: **Ignore Status**.
   * Thêm điều kiện kiểm tra Response Code là `200` HOẶC `429`.

---

## 5. CẤU HÌNH ASSERTIONS, SLA & LISTENERS BÁO CÁO

### 5.1. Cấu hình Ngưỡng Chấp nhận SLA (Duration Assertion)
Thêm **Duration Assertion** vào cấp độ Thread Group hoặc từng Sampler để kiểm tra SLA tự động:
* Chuột phải Sampler $\rightarrow$ `Add` $\rightarrow$ `Assertions` $\rightarrow$ `Duration Assertion`.
* Nhập **Duration in milliseconds**:
  * Smoke Test: `2000` (2s)
  * Average Load Test: `3000` (3s)
  * Stress / Spike Test: `6000` (6s)

### 5.2. Cấu hình Think Time (Uniform Random Timer)
Giúp mô phỏng thời gian người dùng đọc màn hình, tránh việc gửi request dạng DoS liên tục:
* Chuột phải Thread Group $\rightarrow$ `Add` $\rightarrow$ `Timer` $\rightarrow$ `Uniform Random Timer`.
* **Random Delay Maximum:** `2000` (ms)
* **Constant Delay Offset:** `1000` (ms)
$\Rightarrow$ Think time sẽ dao động ngẫu nhiên từ **1.0 đến 3.0 giây**.

### 5.3. Cấu hình Listeners phục vụ Báo cáo & Phân tích
> ⚠️ **LƯU Ý:** Trong quá trình chạy Load Test thực tế, chỉ bật các Listeners dạng tổng hợp. **TẮT** `View Results Tree` để tránh tràn bộ nhớ RAM (OutOfMemoryError).

* **Aggregate Report:** Cung cấp thông tin chuẩn (Samples, Average, Median, 90% Line, 95% Line, 99% Line, Min, Max, Error %, Throughput RPS, KB/sec).
* **Summary Report:** Thống kê tổng quan nhanh.
* **Response Time Percentiles Graph:** Biểu đồ đường phân phối thời gian phản hồi.

---

## 6. QUY TRÌNH CHẠY TẢI THỰC TẾ QUA CLI (NON-GUI MODE)

### 6.1. Thiết lập JVM Heap Size (Tối ưu tài nguyên)
Trước khi chạy tải với số lượng VU lớn trên Windows hoặc Linux, chỉnh sửa file `bin/jmeter.bat` (Windows) hoặc `bin/jmeter` (Linux):

```bash
# Thiết lập RAM tối thiểu 2GB, tối đa 4GB cho JMeter
set HEAP=-Xms2g -Xmx4g -XX:MaxMetaspaceSize=512m
```

### 6.2. Câu lệnh Thực thi Chuẩn và Xuất HTML Dashboard Report

Mở Terminal / PowerShell và thực thi lệnh:

```bash
# 1. Chạy Load Test và tự động sinh Web HTML Dashboard Report
jmeter -n -t "manual_test_cases/Performance_Test_Suite.jmx" \
       -l "results/jmeter_run_results.jtl" \
       -e -o "results/html_report/"

# 2. Truyền tham số động từ dòng lệnh (Host, Token, Thread Count, Duration)
jmeter -n -t "manual_test_cases/Performance_Test_Suite.jmx" \
       -JHEROKU_HOST="restful-booker.herokuapp.com" \
       -JTODOIST_TOKEN="your_actual_bearer_token" \
       -JUSERS=20 \
       -JDURATION=180 \
       -l "results/load_test_results.jtl" \
       -e -o "results/html_dashboard/"
```

### 6.3. Giải thích các Cờ Lệnh (Command Flags)
* `-n`: Chạy ở chế độ Non-GUI (Bắt buộc khi chạy kiểm thử hiệu năng).
* `-t <file.jmx>`: Đường dẫn tới file JMeter Test Plan.
* `-l <file.jtl>`: Đường dẫn lưu file log kết quả dạng CSV/JTL thô.
* `-e`: Yêu cầu sinh HTML Dashboard Report sau khi hoàn tất bài test.
* `-o <folder>`: Thư mục đầu ra chứa trang Web Báo cáo trực quan (HTML Dashboard với biểu đồ Throughput, APDEX Score, Latency Over Time).
* `-J<property>=<value>`: Truyền biến toàn cục vào Test Plan.

---

## 7. BẢNG ĐỐI CHIẾU THAM SỐ (K6 VS JMETER CHEATSHEET)

| Khái niệm k6 | Thành phần tương đương trong JMeter |
| :--- | :--- |
| `vus` (Virtual Users) | `Number of Threads (users)` trong Thread Group |
| `stages` (Ramp-up / Hold / Ramp-down) | `Ultimate Thread Group` hoặc `Stepping Thread Group` |
| `http.get()` / `http.post()` | `HTTP Request Sampler` |
| `check(res, {...})` | `Response Assertion` / `JSON Assertion` |
| `thresholds` (p95 < 3000ms) | `Duration Assertion` / Web HTML Dashboard APDEX config |
| `sleep(random(1, 2))` | `Uniform Random Timer` (Constant: 1000ms, Random: 1000ms) |
| `JSON.parse(res.body).id` | `JSON Extractor` (`$.id`) |
| `__ENV.BASE_URL` | `User Defined Variables` / `${__P(PROPERTY_NAME)}` |
