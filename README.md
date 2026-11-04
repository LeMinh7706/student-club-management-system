# Hệ thống Quản lý Câu lạc bộ Sinh viên (SCMS)

## 1. Giới thiệu dự án

Hệ thống Quản lý Câu lạc bộ Sinh viên (Student Club Management System - SCMS) là nền tảng web được đề xuất nhằm hỗ trợ quản lý thành viên câu lạc bộ, tổ chức sự kiện, đăng ký tham gia và điểm danh bằng mã QR.

Dự án hướng đến việc đơn giản hóa hoạt động quản lý câu lạc bộ, giảm các thao tác thủ công và cải thiện trải nghiệm của sinh viên khi tham gia các hoạt động.

## 2. Mục tiêu dự án

- Đơn giản hóa quy trình đăng ký sự kiện.
- Hỗ trợ điểm danh bằng mã QR.
- Cải thiện việc quản lý thành viên và sự kiện.
- Giảm công việc quản lý thủ công cho ban tổ chức.

## 3. Chức năng dự kiến

Các chức năng chính của hệ thống bao gồm:

- **Quản lý thành viên:** Hỗ trợ quản lý thông tin và danh sách thành viên câu lạc bộ.
- **Quản lý câu lạc bộ:** Hỗ trợ hiển thị và quản lý thông tin câu lạc bộ.
- **Quản lý sự kiện:** Hỗ trợ tạo và quản lý thông tin sự kiện.
- **Đăng ký sự kiện:** Cho phép sinh viên đăng ký tham gia sự kiện.
- **Điểm danh QR:** Hỗ trợ điểm danh người tham gia bằng mã QR.

*Lưu ý: Đây là các chức năng dự kiến ban đầu. Phạm vi chi tiết sẽ được xác định trong quá trình phân tích yêu cầu và xây dựng MVP.*

## 4. Công nghệ dự kiến

| Thành phần | Công nghệ |
|---|---|
| Frontend | ReactJS |
| Backend | Node.js, Express |
| Cơ sở dữ liệu | MongoDB |

*Lưu ý: Công nghệ trên là đề xuất ban đầu và có thể thay đổi trong quá trình lập kế hoạch.*

## 5. Thành viên nhóm

| Thành viên | Vai trò |
|---|---|
| Nguyễn Thế Luân | Project Manager (PM), Business Analyst (BA), Quality Assurance (QA) |
| Lê Tô Nguyệt Minh | UI/UX Designer, Lead Developer (LD) |

## 6. Cấu trúc repository

```text
student-club-management-system/
│
├── backend/       # Mã nguồn xử lý nghiệp vụ và API
├── frontend/      # Mã nguồn giao diện người dùng
├── docs/          # Tài liệu phân tích và thiết kế dự án
├── planning/      # Kế hoạch và báo cáo công việc
├── tests/         # Tài liệu và mã nguồn kiểm thử
│
└── README.md      # Giới thiệu dự án
```

## 7. Tình trạng dự án

Dự án đang trong giai đoạn lập kế hoạch và phân tích yêu cầu. Các chức năng và công nghệ sẽ được xác nhận thêm trong quá trình thực hiện.

Repository hiện đang được sử dụng để quản lý tài liệu và kế hoạch dự án. Mã nguồn ứng dụng sẽ được bổ sung trong quá trình triển khai.

## 8. Tài liệu dự án

- [Phát biểu vấn đề](docs/problem-statement.md)
- [Điều lệ dự án](docs/project-charter.md)
- [Danh sách các bên liên quan](docs/stakeholder-register.md)
- [Quy ước làm việc nhóm](docs/team-charter.md)
- [Kế hoạch tuần 1](planning/week-01-plan.md)
