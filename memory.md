# Project Memory & Operating Rules

## Quy tắc bắt buộc khi làm việc:
1. **Không merge thẳng vào `main`**: Luôn đẩy code lên branch riêng và tạo Pull Request (PR) để review và chạy CI/CD, không merge trực tiếp vào `main`.
2. **Tạo nhánh riêng cho từng bug để fix**: Mỗi lỗi phải được tách riêng trên một branch tương ứng theo chuẩn Conventional Commits (ví dụ: `fix/<tên-bug>`).
3. **Luôn tóm tắt ngắn gọn lại sau khi fix**: Sau khi hoàn thành việc sửa lỗi, luôn cung cấp bản tóm tắt ngắn gọn, rõ ràng về nguyên nhân gốc rễ và những thay đổi đã thực hiện.
