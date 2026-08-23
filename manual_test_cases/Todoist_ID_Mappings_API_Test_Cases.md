# API Test Case Specification: Todoist ID Mappings Endpoint

## 1. Executive Summary & Context

- **Endpoint**: `GET /api/v1/id_mappings/{obj_name}/{obj_ids}`
- **Base URL**: `https://api.todoist.com/api/v1` (or `https://developer.todoist.com/api/v1`)
- **Authentication**: Bearer Token (`Authorization: Bearer <API_TOKEN>`)
- **Format**: `application/json`
- **Purpose**: Translates object IDs from Todoist v1 to v2 or vice versa. IDs are not unique across object types, hence `obj_name` must be specified. Returns array of mapped ID pairs (`old_id` and `new_id`), or an empty list `[]` if no mappings exist.

---

## 2. Parameter Specifications & Data Matrix

### Path Parameters

| Parameter | Type | Required | Enum / Constraints | Description & Examples |
|---|---|---|---|---|
| `obj_name` | String | Yes | `"sections"`, `"tasks"`, `"comments"`, `"reminders"`, `"location_reminders"`, `"projects"` | The object type for the IDs to translate. |
| `obj_ids` | String | Yes | Comma-separated list of IDs | Single ID (e.g. `918273645`), or multi IDs (e.g. `6VfWjjjFg2xqX6Pa,6WMVPf8Hn8JP6mC8`). |

---

## 3. Comprehensive Test Cases Matrix

### 3.1. HTTP 200 Successful Response (Happy Path & Data Provider)

| TC ID | Test Scenario | Path Parameters | Expected HTTP Status | Expected Response Body & Headers | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|---|
| `TC_IDMAP_200_001` | Translate single ID for valid `obj_name` = `"tasks"` | `obj_name`="tasks"<br>`obj_ids`="918273645" | **200 OK** | Array of `IdMapping` objects:<br>`[{"old_id": "918273645", "new_id": "6VfWjjjFg2xqX6Pa"}]`<br>Header `Content-Type: application/json` | < 2.0s | Positive | P1 |
| `TC_IDMAP_200_002` | Data Provider: Translate single ID for valid `obj_name` = `"projects"` | `obj_name`="projects"<br>`obj_ids`="2203306160" | **200 OK** | Array of mapped objects.<br>Header `Content-Type: application/json` | < 2.0s | Positive / Data Provider | P1 |
| `TC_IDMAP_200_003` | Data Provider: Translate single ID for valid `obj_name` = `"sections"` | `obj_name`="sections"<br>`obj_ids`="7025" | **200 OK** | Array of mapped objects.<br>Header `Content-Type: application/json` | < 2.0s | Positive / Data Provider | P1 |
| `TC_IDMAP_200_004` | Data Provider: Translate single ID for valid `obj_name` = `"comments"` | `obj_name`="comments"<br>`obj_ids`="300129" | **200 OK** | Array of mapped objects.<br>Header `Content-Type: application/json` | < 2.0s | Positive / Data Provider | P2 |
| `TC_IDMAP_200_005` | Data Provider: Translate single ID for valid `obj_name` = `"reminders"` | `obj_name`="reminders"<br>`obj_ids`="40091" | **200 OK** | Array of mapped objects.<br>Header `Content-Type: application/json` | < 2.0s | Positive / Data Provider | P2 |
| `TC_IDMAP_200_006` | Data Provider: Translate single ID for valid `obj_name` = `"location_reminders"` | `obj_name`="location_reminders"<br>`obj_ids`="50012" | **200 OK** | Array of mapped objects.<br>Header `Content-Type: application/json` | < 2.0s | Positive / Data Provider | P2 |
| `TC_IDMAP_200_007` | Translate multiple comma-separated IDs | `obj_name`="tasks"<br>`obj_ids`="6VfWjjjFg2xqX6Pa,6WMVPf8Hn8JP6mC8,918273645" | **200 OK** | Array containing mappings for each matched ID.<br>Header `Content-Type: application/json` | < 2.0s | Positive | P1 |
| `TC_IDMAP_200_008` | Non-existent IDs return an empty array | `obj_name`="tasks"<br>`obj_ids`="non_existent_id_999999" | **200 OK** | Empty Array: `[]`<br>Header `Content-Type: application/json` | < 2.0s | Boundary | P2 |

---

### 3.2. HTTP 400 Bad Request (Validation Errors)

| TC ID | Test Scenario | Path Parameters | Expected HTTP Status | Expected Response Body & Headers | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|---|
| `TC_IDMAP_400_001` | Invalid `obj_name` string outside Enum | `obj_name`="invalid_type"<br>`obj_ids`="918273645" | **400 Bad Request** | Error JSON detailing invalid parameter `obj_name`. | < 2.0s | Negative | P1 |
| `TC_IDMAP_400_002` | Unsupported `obj_name` string (e.g. `"users"`, `"labels"`) | `obj_name`="users"<br>`obj_ids`="918273645" | **400 Bad Request** | Error JSON indicating unsupported object type. | < 2.0s | Negative | P1 |
| `TC_IDMAP_400_003` | Uppercase enum string (Case Sensitivity) | `obj_name`="TASKS"<br>`obj_ids`="918273645" | **400 Bad Request** | Error JSON indicating enum value must be lowercase. | < 2.0s | Negative | P2 |
| `TC_IDMAP_400_004` | Numeric string as `obj_name` | `obj_name`="12345"<br>`obj_ids`="918273645" | **400 Bad Request** | Error JSON indicating type validation error. | < 2.0s | Negative | P2 |
| `TC_IDMAP_400_005` | Space-padded or empty string `obj_ids` | `obj_name`="tasks"<br>`obj_ids`="   " | **400 Bad Request** or **404 Not Found** | Validation error for empty ID parameter. | < 2.0s | Boundary | P2 |

---

### 3.3. HTTP 401 Unauthorized (Authentication Errors)

| TC ID | Test Scenario | Headers & Auth | Expected HTTP Status | Expected Response Body | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|---|
| `TC_IDMAP_401_001` | Request without `Authorization` header | No `Authorization` header | **401 Unauthorized** | Error message indicating authentication required. | < 2.0s | Security / Auth | P1 |
| `TC_IDMAP_401_002` | Request with invalid or expired Bearer Token | `Authorization: Bearer invalid_token_xyz_999` | **401 Unauthorized** | Error message indicating invalid token. | < 2.0s | Security / Auth | P1 |
| `TC_IDMAP_401_003` | Request with malformed header (Missing 'Bearer' prefix) | `Authorization: Token_Without_Bearer_Prefix` | **401 Unauthorized** | Error message indicating malformed auth header. | < 2.0s | Security / Auth | P2 |

---

### 3.4. HTTP 403 Forbidden (Permission Errors)

| TC ID | Test Scenario | Auth Context | Expected HTTP Status | Expected Response Body | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|---|
| `TC_IDMAP_403_001` | Revoked or scope-restricted Bearer Token | Token with revoked permissions | **403 Forbidden** (or 401) | Error message indicating access forbidden for restricted scope. | < 2.0s | Security / Auth | P2 |

---

### 3.5. HTTP 404 Not Found (Missing Route / Parameters)

| TC ID | Test Scenario | Request Path | Expected HTTP Status | Expected Response Body | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|---|
| `TC_IDMAP_404_001` | Non-existent route path | `/api/v1/invalid_id_mappings/tasks/918273645` | **404 Not Found** | HTML or JSON 404 Not Found error. | < 2.0s | Boundary | P2 |
| `TC_IDMAP_404_002` | Missing `obj_ids` parameter from URL path | `/api/v1/id_mappings/tasks` | **404 Not Found** or **400 Bad Request** | Error indicating path parameter missing. | < 2.0s | Boundary | P1 |

---

### 3.6. Security & Injection Test Cases

| TC ID | Test Scenario | Malicious Input Payload | Target Field | Expected Behavior | Test Type | Priority |
|---|---|---|---|---|---|---|
| `TC_IDMAP_SEC_001` | SQL Injection (OR 1=1) | `' OR '1'='1` | `obj_name` | Rejected safely with **400 Bad Request** or **404 Not Found** (No 500 error, no DB dump). | Security (SQLi) | P1 |
| `TC_IDMAP_SEC_002` | SQL Injection (DROP TABLE) | `'; DROP TABLE id_mappings;--` | `obj_ids` | Handled safely without executing SQL commands (Returns **200 OK** empty array `[]` or **400/404**). | Security (SQLi) | P1 |
| `TC_IDMAP_SEC_003` | Cross-Site Scripting (XSS) | `<script>alert('XSS')</script>` | `obj_name` & `obj_ids` | Input sanitized or safely rejected with **400/404** (No code execution). | Security (XSS) | P1 |
| `TC_IDMAP_SEC_004` | Path Traversal Attack | `../../etc/passwd` | `obj_name` | Blocked safely with **400 Bad Request** or **404 Not Found** (No file system leak). | Security (Path Traversal) | P1 |

---

### 3.7. HTTP 500 Internal Server Error (Boundary & Stress Safety)

| TC ID | Test Scenario | Request Condition | Expected Behavior | SLA Response Time | Test Type | Priority |
|---|---|---|---|---|---|---|
| `TC_IDMAP_500_001` | Heavy payload with 500 comma-separated IDs | `obj_ids` containing 500 concatenated ID values | Server handles request gracefully without throwing **500 Internal Server Error** (Returns 200 or 400). | < 5.0s | Stress / Boundary | P2 |

---

## 4. Playwright TypeScript Automation Architecture

### Project Files Created:
1. Model Interface: [`src/api/todoist/models/id-mapping.model.ts`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/src/api/todoist/models/id-mapping.model.ts)
2. API Client Helper: [`src/api/todoist/helpers/id-mapping-api.ts`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/src/api/todoist/helpers/id-mapping-api.ts)
3. Test Suite Spec: [`src/tests/api/todoist/id-mapping.api.spec.ts`](file:///e:/Kun/Antigravity%20Demo/Antigravity%20Testing%20kit%20demo/src/tests/api/todoist/id-mapping.api.spec.ts)
