# Kết nối Claude Code với Power BI (qua MCP Server)

Tài liệu này hướng dẫn **từng bước** cách để **Claude Code** (trợ lý AI chạy trong terminal)
truy vấn và làm việc trực tiếp với dữ liệu **Power BI** trên máy tính của bạn, thông qua
**MCP Server chính thức của Microsoft** (`@microsoft/powerbi-modeling-mcp`).

> **MCP là gì?** Model Context Protocol — một "cầu nối" tiêu chuẩn để trợ lý AI (Claude)
> gọi được các công cụ bên ngoài. Ở đây, MCP server đóng vai trò cầu nối giữa Claude Code
> và mô hình dữ liệu (semantic model) trong Power BI.

Sau khi cài xong, bạn có thể **hỏi bằng tiếng Việt** những câu như:
- *"Chạy DAX tính tổng sản lượng theo ca trong tháng này."*
- *"Liệt kê các measure và bảng trong model đang mở."*
- *"Tạo measure OEE = Availability × Performance × Quality."*
- *"Kiểm tra quan hệ (relationship) giữa bảng ProductionLog và WorkCenter."*

---

## 0. Chọn đúng loại MCP server

Microsoft cung cấp 2 loại (bản public preview, đầu 2026):

| Loại | Chạy ở đâu | Dùng khi nào | Package |
|---|---|---|---|
| **Power BI Modeling MCP** *(khuyến nghị)* | **Cục bộ** trên máy bạn | Có **Power BI Desktop** đang mở model, hoặc file `.pbix` / `.pbip`. Chạy DAX, sửa/tạo measure, xem schema. | `@microsoft/powerbi-modeling-mcp` |
| **Remote Power BI MCP** | Microsoft host (cloud) | Hỏi-đáp dữ liệu trên **semantic model đã publish** lên Power BI Service (cần Fabric/PPU). | *(Xem mục 8)* |

Hướng dẫn chính bên dưới dùng **Power BI Modeling MCP** (cục bộ) vì khớp với "Power BI trên máy tính".

---

## 1. Yêu cầu chuẩn bị (làm 1 lần)

Thực hiện các bước này **trên máy tính của bạn** (Windows khuyến nghị vì Power BI Desktop chỉ có trên Windows):

1. **Node.js** (phiên bản 18 trở lên) — dùng để chạy MCP server.
   - Tải tại: <https://nodejs.org> → chọn bản **LTS** → cài đặt.
   - Kiểm tra: mở PowerShell/Terminal, gõ `node -v` (phải ra số phiên bản, ví dụ `v20.x.x`).

2. **Claude Code CLI** — nếu chưa cài:
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
   Kiểm tra: `claude --version`. Đăng nhập lần đầu bằng `claude` rồi làm theo hướng dẫn.

3. **Power BI Desktop** — cài từ Microsoft Store hoặc trang Microsoft, và **mở sẵn một file model**
   (`.pbix` hoặc `.pbip`) mà bạn muốn Claude làm việc cùng. Server sẽ kết nối vào model đang mở.

4. **Tài khoản Microsoft (Entra ID / Azure AD)** có quyền truy cập dữ liệu Power BI. Lần đầu chạy,
   server sẽ yêu cầu bạn **đăng nhập** (xác thực tương tác — không cần cấu hình gì thêm).

---

## 2. Thêm MCP server vào Claude Code

Có 2 cách. **Chọn 1 trong 2.**

### Cách A — Dùng file `.mcp.json` có sẵn trong repo (đơn giản nhất)

Repo này đã có sẵn file [`.mcp.json`](../.mcp.json) ở thư mục gốc với nội dung:

```json
{
  "mcpServers": {
    "powerbi-modeling-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@microsoft/powerbi-modeling-mcp@latest", "--start"],
      "env": {}
    }
  }
}
```

Khi bạn mở Claude Code **trong thư mục dự án này**, Claude sẽ tự phát hiện file và hỏi bạn có
muốn bật server `powerbi-modeling-mcp` không → chọn **Yes/Approve**. Xong.

> File `.mcp.json` là cấu hình **theo dự án** (project scope) — chia sẻ được cho cả nhóm qua git.
> Claude Code luôn hỏi phê duyệt trước khi chạy nên an toàn.

### Cách B — Thêm bằng lệnh (nếu muốn dùng ở mọi thư mục)

```bash
# Thêm cho riêng dự án hiện tại (ghi vào .mcp.json)
claude mcp add powerbi-modeling --scope project -- npx -y @microsoft/powerbi-modeling-mcp@latest --start

# HOẶC thêm cho tài khoản của bạn, dùng được ở mọi dự án
claude mcp add powerbi-modeling --scope user -- npx -y @microsoft/powerbi-modeling-mcp@latest --start
```

---

## 3. Khởi động và xác thực

1. Mở **Power BI Desktop** với model bạn muốn dùng (bước 1.3).
2. Mở terminal tại thư mục dự án, chạy:
   ```bash
   claude
   ```
3. Trong phiên Claude Code, gõ:
   ```
   /mcp
   ```
   → Bạn sẽ thấy server `powerbi-modeling-mcp`. Lần đầu, nó có thể mở trình duyệt yêu cầu
   **đăng nhập tài khoản Microsoft** — đăng nhập để cấp quyền. Sau khi trạng thái hiển thị
   **connected**, là đã sẵn sàng.

> Lần đầu `npx` sẽ tự tải package `@microsoft/powerbi-modeling-mcp` (mất vài phút). Các lần sau nhanh hơn.

---

## 4. Kiểm tra hoạt động

Trong Claude Code, thử hỏi:

```
Liệt kê tất cả các bảng và measure trong Power BI model đang mở.
```

hoặc chạy DAX:

```
Chạy câu DAX: EVALUATE TOPN(10, 'ProductionLog')
```

Nếu Claude trả về dữ liệu từ model của bạn → **kết nối thành công**. 🎉

---

## 5. Các khả năng của server (23 nhóm công cụ)

MCP server này cho phép Claude (qua ngôn ngữ tự nhiên):

- **Truy vấn dữ liệu:** viết & chạy DAX, kiểm tra cú pháp DAX, xem kết quả.
- **Đọc mô hình:** liệt kê bảng, cột, measure, quan hệ, phân cấp (hierarchy), metadata schema.
- **Chỉnh sửa mô hình:** tạo/sửa/xóa measure, cột, bảng, quan hệ; đổi tên hàng loạt (bulk).
- **Nâng cao:** calculation group, user-defined function, Row-Level Security (RLS),
  đa ngôn ngữ (translation), tham số Power Query.

Ví dụ ứng dụng cho **nền tảng quản lý nhà máy WCM** của bạn:
- *"Tạo measure OEE = DIVIDE([Good Units] * [Cycle Time], [Planned Time])."*
- *"Tính MTBF và MTTR theo từng máy từ bảng MaintenanceLog."*
- *"Tạo measure Scrap Rate (%) và Production vs Plan (%) theo tuần."*

> ⚠️ **Lưu ý:** Server có thể **thay đổi** model (tạo/sửa/xóa measure...). Hãy **lưu bản sao** file
> `.pbix` trước khi cho Claude chỉnh sửa, và luôn xem kỹ trước khi phê duyệt thao tác ghi.

---

## 6. Xác thực nâng cao — Service Principal (tùy chọn, cho tự động hóa)

Nếu chạy tự động/không có người đăng nhập, dùng **Service Principal** (Azure App Registration).
Thêm biến môi trường vào phần `env` trong `.mcp.json`:

```json
{
  "mcpServers": {
    "powerbi-modeling-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@microsoft/powerbi-modeling-mcp@latest", "--start", "--authmode=serviceprincipal"],
      "env": {
        "AZURE_TENANT_ID": "<tenant-id-cua-ban>",
        "AZURE_CLIENT_ID": "<client-id-cua-ban>",
        "AZURE_CLIENT_SECRET": "<client-secret-cua-ban>"
      }
    }
  }
}
```

- Chế độ mặc định là `--authmode=interactive` (đăng nhập bằng tay — không cần các biến trên).
- Cũng hỗ trợ chứng chỉ: `AZURE_CLIENT_CERTIFICATE_PATH`.

> 🔒 **KHÔNG** commit client secret vào git. Giữ file `.mcp.json` chứa secret ở máy cục bộ, hoặc
> dùng biến môi trường của hệ điều hành. Xem mục 9.

---

## 7. Xử lý sự cố

| Triệu chứng | Cách khắc phục |
|---|---|
| `npx: command not found` | Chưa cài Node.js đúng, hoặc chưa khởi động lại terminal. Cài lại Node.js LTS. |
| Server báo **không tìm thấy model** | Chưa mở Power BI Desktop, hoặc chưa mở file `.pbix`/`.pbip`. Mở model rồi thử lại. |
| Kẹt ở màn hình đăng nhập | Đăng xuất/đăng nhập lại tài khoản Microsoft có quyền truy cập dữ liệu Power BI. |
| `/mcp` không thấy server | Kiểm tra file `.mcp.json` đúng thư mục gốc; chạy `claude mcp list` để xem server đã đăng ký. |
| Tải package chậm/timeout | Kiểm tra mạng/proxy công ty. Thử `npm install -g @microsoft/powerbi-modeling-mcp` trước. |
| Muốn gỡ server | `claude mcp remove powerbi-modeling` |

Lệnh hữu ích:
```bash
claude mcp list                 # xem các MCP server đã cấu hình
claude mcp get powerbi-modeling # xem chi tiết cấu hình 1 server
```

---

## 8. (Tùy chọn) Remote Power BI MCP Server — cho dữ liệu đã publish lên cloud

Nếu dữ liệu của bạn nằm trên **Power BI Service / Microsoft Fabric** (semantic model đã publish),
Microsoft có **Remote Power BI MCP Server** (Microsoft host sẵn, dạng chat-với-dữ-liệu).
Yêu cầu license Fabric hoặc Premium-Per-User (PPU). Tham khảo tài liệu chính thức ở mục Nguồn.

Điểm khác: bản **remote** không cần Power BI Desktop trên máy, nhưng cần dữ liệu đã ở trên cloud
và quyền phù hợp. Bản **local** (hướng dẫn chính) phù hợp khi làm việc với file trên máy.

---

## 9. Bảo mật & lưu ý

- File `.mcp.json` trong repo **chỉ chứa cấu hình chạy `npx`**, **không chứa** thông tin đăng nhập.
- **Tuyệt đối không** commit `AZURE_CLIENT_SECRET`, mật khẩu hay token vào git.
- Claude Code luôn **hỏi phê duyệt** trước khi bật MCP server và trước mỗi thao tác ghi dữ liệu.
- Sao lưu file `.pbix` trước khi cho AI chỉnh sửa model.

---

## Nguồn tham khảo

- Power BI Modeling MCP Server (Microsoft, chính thức): <https://github.com/microsoft/powerbi-modeling-mcp>
- Tổng quan các Power BI MCP server (Microsoft Learn): <https://learn.microsoft.com/en-us/power-bi/developer/mcp/mcp-servers-overview>
- Bắt đầu với Remote Power BI MCP server: <https://learn.microsoft.com/en-us/power-bi/developer/mcp/remote-mcp-server-get-started>
- Hướng dẫn triển khai (RADACAD): <https://radacad.com/no-code-power-bi-how-to-use-claude-and-the-power-bi-modeling-mcp-server/>
