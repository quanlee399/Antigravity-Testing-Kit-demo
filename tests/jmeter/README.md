# 🚀 Hướng Dẫn Sử Dụng Apache JMeter & JMeter MCP Server

Thư mục này chứa cấu hình và ví dụ kiểm thử hiệu năng với Apache JMeter và JMeter MCP Server.

---

## 📁 Cấu trúc Cài đặt trong Workspace

- **Apache JMeter 5.6.3**: `tools/apache-jmeter-5.6.3/`
- **JMeter MCP Server**: `tools/jmeter-mcp/`
- **Cấu hình MCP Workspace**: `.mcp.json` và `.vscode/mcp.json`
- **Kịch bản mẫu**: `tests/jmeter/sample_api_test.jmx`

---

## 🛠️ Danh sách Công cụ MCP (JMeter Architect Tools)

JMeter MCP Server cung cấp 8 công cụ chính cho AI Agent & IDE:

1. `jmeter_init_plan`: Khởi tạo file kịch bản `.jmx` mới.
2. `jmeter_add_thread_group`: Thêm Thread Group (số lượng Virtual Users, Ramp-up time, Loop count).
3. `jmeter_add_sampler`: Thêm HTTP Sampler (Domain, Path, Method, Parameters).
4. `jmeter_add_header`: Thêm HTTP Header Manager (Authorization, Content-Type, ...).
5. `jmeter_add_timer`: Thêm Delay giữa các request.
6. `jmeter_add_assertion`: Thêm Response Assertion (kiểm tra Response Status Code, Body content, ...).
7. `jmeter_add_listener`: Thêm Listener (Summary Report, Aggregate Report, Results Tree).
8. `jmeter_run_test`: Thực thi test plan ở chế độ non-GUI và xuất kết quả summary.

---

## 🖥️ Chạy kịch bản từ Command Line (Non-GUI Mode)

Để thực thi kịch bản kiểm thử từ terminal:

```bash
cmd /c "tools\apache-jmeter-5.6.3\bin\jmeter.bat -n -t tests/jmeter/sample_api_test.jmx -l tests/jmeter/results.jtl -j tests/jmeter/jmeter.log"
```

## 📊 Mở JMeter GUI

Nếu cần mở giao diện đồ họa GUI để chỉnh sửa kịch bản:

```bash
cmd /c "tools\apache-jmeter-5.6.3\bin\jmeter.bat"
```
