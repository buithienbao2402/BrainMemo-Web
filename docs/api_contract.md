## 0. Quy chuẩn chung

- **Không versioning** (`/api/...`, không `/api/v1/...`) — MVP, đơn giản hóa. Có thể thêm sau nếu cần.
- **Auth header:** `Authorization: Bearer <access_token>` cho mọi request cần xác thực.
- **Refresh token:** gửi ngầm qua `HttpOnly Cookie`, không lộ ra JS.
- **JWT payload:** chỉ chứa `userId`, `email`, `iat`, `exp` — **không nhúng role**. Role
  (Creator/Student) được backend tự suy ra bằng cách so `userId` với `creator_id` của course hoặc
  tra bảng `enrollment`, tùy theo resource đang truy cập.
- **Thời hạn token:** Access Token = **30 phút** · Refresh Token = **30 ngày**.
- **Response envelope (giữ nguyên bản cũ):**
  ```json
  { "success": true, "message": "string", "data": {}, "errors": null }
  ```
  `errors` khi có lỗi validate: `[{ "field": "title", "code": "REQUIRED", "message": "..." }]`
- **Phân trang** (mọi API dạng danh sách): request `?page=1&pageSize=20`; response:
  ```json
  { "items": [...], "page": 1, "pageSize": 20, "totalItems": 57, "totalPages": 3 }
  ```
- **Passcode cho nội dung PROTECTED:** hệ thống **không lưu lại trạng thái đã mở khóa**. Mọi
  request lấy nội dung PROTECTED (trừ Creator) phải đính kèm header:
  `X-Access-Passcode: <passcode>` — dùng header (không dùng query param) để tránh lộ passcode
  trong access log / lịch sử trình duyệt. Không đúng/thiếu → `403` kèm
  `errors: [{ code: "PASSCODE_REQUIRED" | "PASSCODE_INVALID" }]`.
- **Quy tắc PRIVATE vs PROTECTED (áp dụng riêng cho Course và cho Chapter, không kế thừa nhau):**
  - `PUBLIC`: ai cũng xem được.
  - `PRIVATE`: chỉ Creator hoặc Student đã enroll khóa học đó.
  - `PROTECTED`: Creator vào thẳng; tất cả người khác (kể cả Student đã enroll) **luôn** phải kèm
    `X-Access-Passcode` đúng ở mọi lần gọi, vì hệ thống không nhớ.

---

## 1. Yêu cầu thay đổi Schema DB (bắt buộc để hỗ trợ contract này)

| # | Thay đổi | Lý do |
|---|---|---|
| 1 | `ALTER TABLE quiz_question ADD COLUMN explanation TEXT NULL;` | Luồng tạo quiz yêu cầu "giải thích" cho đáp án nhưng cột này chưa tồn tại. |
| 2 | Bảng mới `course_invitation` (`invitation_id` PK, `course_id` FK, `inviter_id` FK→user, `invitee_email` VARCHAR, `invitee_user_id` FK→user NULL, `status` ENUM('PENDING','ACCEPTED','DECLINED'), `created_at`, `responded_at` NULL) | Cần lưu trạng thái lời mời (chờ/chấp nhận/từ chối) — không thể ghi đè lên `enrollment` vì bảng đó chỉ có 2 trạng thái LEARNING/COMPLETED. |
| 3 | `ALTER TABLE notification MODIFY type ENUM('NEW_CHAPTER','NEW_COMMENT','NEW_ENROLLMENT','COURSE_INVITATION','INVITATION_ACCEPTED');` | Thêm loại thông báo cho lời mời tham gia khóa học. |
| 4 | `ALTER TABLE enrollment ADD COLUMN last_page_id INT NULL, ADD COLUMN last_accessed_at DATETIME NULL, ADD CONSTRAINT fk_enrollment_lastpage FOREIGN KEY (last_page_id) REFERENCES page(page_id) ON DELETE SET NULL;` | Cần để xác định "trang dở dang" cho mục Tiếp tục học. |
| 5 | Bảng mới `refresh_token` (`token_id` PK, `user_id` FK, `token_hash` VARCHAR, `device_info` VARCHAR NULL, `created_at`, `expires_at`, `revoked_at` NULL) | Bắt buộc để hỗ trợ "đăng xuất tất cả thiết bị" và "thu hồi token khi đổi mật khẩu" — JWT thuần không tự thu hồi được, cần whitelist ở DB. |

> `quiz_option`, `flashcard`, `page`, `block` giữ nguyên như `init_db.sql` hiện tại — không cần đổi.
> **Page cố tình không có `access_type`/`passcode`** (đúng theo xác nhận: Page kế thừa hoàn toàn quyền của Chapter chứa nó).

---

## 2. Auth & Session

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| POST | `/api/auth/register/request-otp` | `{ email, password, fullName }` → gửi OTP qua email |
| POST | `/api/auth/register/verify` | `{ email, otp }` → hash password, tạo user |
| POST | `/api/auth/login` | `{ email, password }` → access token + Set-Cookie refresh token |
| POST | `/api/auth/refresh-token` | Đọc cookie → access token mới |
| POST | `/api/auth/logout` | Thu hồi refresh token ở cookie hiện tại, xóa cookie |
| POST | `/api/auth/logout-all` | *(auth)* Thu hồi **toàn bộ** refresh token của user (đánh dấu `revoked_at` hết trong bảng `refresh_token`) |
| POST | `/api/auth/forgot-password/request-otp` | `{ email }` → gửi OTP (dùng lại cơ chế OTP như đăng ký) |
| POST | `/api/auth/forgot-password/verify` | `{ email, otp, newPassword }` → đổi mật khẩu, thu hồi toàn bộ token cũ |
| PUT | `/api/auth/change-password` | *(auth)* `{ oldPassword, newPassword }` → xác thực mật khẩu cũ, đổi mật khẩu, thu hồi toàn bộ refresh token (kể cả phiên hiện tại) → FE bắt buộc đăng nhập lại |

---

## 3. User

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/users/me` | Thông tin cá nhân hiện tại |
| PUT | `/api/users/me` | `{ fullName, avatarUrl, bio, notificationEnabled, themeMode }` |

---

## 4. Media (MinIO — Presigned URL)

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| POST | `/api/media/presigned-url` | `{ fileName, contentType, mediaType: "IMAGE"\|"AUDIO"\|"VIDEO" }` → `{ uploadUrl, objectKey, expiresAt }`. Client `PUT` file thẳng lên `uploadUrl` (MinIO), **không qua backend**. |

**Luồng dùng:** FE gọi `presigned-url` → nhận `uploadUrl` + `objectKey` → FE `PUT` file trực tiếp lên MinIO → FE dùng `objectKey` (không phải URL public) khi tạo/sửa block hoặc course/avatar. Backend tự resolve `objectKey` → URL công khai khi trả dữ liệu, tránh nhận URL tùy ý từ client (an toàn hơn).

**Giới hạn định dạng/dung lượng (đề xuất, có thể chỉnh cấu hình sau):**
| Loại | Định dạng | Giới hạn |
|---|---|---|
| Ảnh (bìa khóa học, avatar, block IMAGE) | jpg, png, webp, gif | 5 MB |
| Audio | mp3, wav, m4a | 20 MB |
| Video | mp4, webm | 200 MB |

**Xóa file:** không có endpoint xóa media riêng. Khi gọi `DELETE /api/blocks/{id}` với `block_type` là IMAGE/AUDIO/VIDEO, backend tự xóa object tương ứng trên MinIO.

---

## 5. Course

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/courses` | Query: `scope=public\|owned\|enrolled` (mặc định `public`), `search`, `tag`, `sort=updated\|participants\|newest\|comments`, `status`, `page`, `pageSize` |
| GET | `/api/courses/{id}` | Chi tiết khóa học (kèm danh sách chương dạng tóm tắt: `id, title, orderIndex, accessType`). Bị chặn theo `access_type` của **chính course** (xem mục 0). |
| POST | `/api/courses` | *(auth)* `{ title, description, coverImageObjectKey, accessType, passcode?, tags: string[] }` — `tags` tự tạo mới nếu tag chưa tồn tại (free text) |
| PUT | `/api/courses/{id}` | *(Creator)* cùng payload như POST |
| DELETE | `/api/courses/{id}` | *(Creator)* Xóa cứng — cascade toàn bộ chapter/page/block/enrollment/progress/comment liên quan (đúng theo `ON DELETE CASCADE` hiện có trong DB) |
| POST | `/api/courses/{id}/access` | `{ passcode }` → kiểm tra nhanh, không trả nội dung (dùng để UX hiện nút "Vào học") |
| GET | `/api/courses/{id}/dashboard` | *(Creator)* `{ participantsCount, completedCount, commentsCount, students: [{ userId, fullName, avatarUrl, progressPercent, enrolledAt }] }` — **không có điểm số**, chỉ % tiến độ |
| GET | `/api/tags` | Danh sách tag hiện có (phục vụ filter/autocomplete) |

---

## 6. Enrollment & Lời mời (Invitation)

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| POST | `/api/courses/{id}/enroll` | *(auth)* Tự ghi danh. `{ passcode? }` nếu course PROTECTED |
| POST | `/api/courses/{id}/invitations` | *(Creator)* `{ email }` → tạo lời mời `PENDING`, gửi `notification` type `COURSE_INVITATION` tới user đó (nếu email đã có tài khoản) |
| GET | `/api/invitations/me` | *(auth)* Danh sách lời mời đang chờ mình phản hồi |
| POST | `/api/invitations/{id}/accept` | *(auth)* Tạo `enrollment`, set invitation `ACCEPTED`, gửi notification `INVITATION_ACCEPTED` cho Creator |
| POST | `/api/invitations/{id}/decline` | *(auth)* Set invitation `DECLINED` |
| GET | `/api/courses/{id}/invitations` | *(Creator)* Xem danh sách lời mời đã gửi + trạng thái |

---

## 7. Chapter

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/courses/{id}/chapters` | Danh sách chương tóm tắt (`id, title, orderIndex, accessType`) — không cần passcode ở mức tóm tắt, chỉ hiển thị icon khóa |
| POST | `/api/courses/{id}/chapters` | *(Creator)* `{ title, accessType, passcode? }` |
| GET | `/api/chapters/{id}` | Chi tiết chương + danh sách trang (tab bar). Bị chặn theo `access_type` **của chính chapter** |
| PUT | `/api/chapters/{id}` | *(Creator)* cùng payload như POST |
| DELETE | `/api/chapters/{id}` | *(Creator)* |
| POST | `/api/chapters/{id}/access` | `{ passcode }` → kiểm tra nhanh |
| PATCH | `/api/courses/{id}/chapters/reorder` | *(Creator)* `{ orderedChapterIds: [3, 1, 2] }` — cập nhật lại `order_index` hàng loạt cho thao tác kéo-thả |

---

## 8. Page

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/chapters/{id}/pages` | Danh sách trang tóm tắt (cho tab bar) |
| POST | `/api/chapters/{id}/pages` | *(Creator)* `{ title }` |
| GET | `/api/pages/{id}` | Chi tiết trang + toàn bộ block. **Side effect:** nếu người gọi là Student đã enroll, cập nhật `enrollment.last_page_id` + `last_accessed_at` (phục vụ "Tiếp tục học") |
| PUT | `/api/pages/{id}` | *(Creator)* `{ title }` |
| DELETE | `/api/pages/{id}` | *(Creator)* |
| PATCH | `/api/chapters/{id}/pages/reorder` | *(Creator)* `{ orderedPageIds: [] }` |

---

## 9. Block (Text / Media / Quiz / Flashcard)

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| POST | `/api/pages/{id}/blocks` | *(Creator)* Payload đa hình theo `block_type` (đã chuẩn hóa đúng enum DB) — xem chi tiết bên dưới |
| PUT | `/api/blocks/{id}` | *(Creator)* Sửa nội dung — **thay thế toàn bộ** (full-replace): với QUIZ/FLASHCARD, mảng `questions`/`cards` gửi lên sẽ ghi đè toàn bộ danh sách cũ (đơn giản hơn cho MVP so với patch từng phần tử) |
| DELETE | `/api/blocks/{id}` | *(Creator)* Nếu là IMAGE/AUDIO/VIDEO → xóa luôn object trên MinIO |
| PATCH | `/api/pages/{id}/blocks/reorder` | *(Creator)* `{ orderedBlockIds: [] }` |

**Payload theo `block_type` (đã đồng bộ đúng enum DB: `TEXT, IMAGE, AUDIO, VIDEO, QUIZ, FLASHCARD`):**
```json
// TEXT
{ "blockType": "TEXT", "contentText": "..." }

// IMAGE / AUDIO / VIDEO
{ "blockType": "IMAGE", "mediaObjectKey": "uploads/xyz.png" }

// QUIZ  (ràng buộc: mỗi câu hỏi ≥ 2 đáp án, đúng 1 đáp án is_correct)
{
  "blockType": "QUIZ",
  "questions": [
    {
      "questionText": "...",
      "explanation": "...",
      "options": [
        { "optionText": "...", "isCorrect": true },
        { "optionText": "...", "isCorrect": false }
      ]
    }
  ]
}

// FLASHCARD
{ "blockType": "FLASHCARD", "cards": [{ "frontText": "...", "backText": "..." }] }
```

---

## 10. Học tập & Tiến độ (Learning)

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| POST | `/api/pages/{id}/quiz/submit` | *(Student)* `{ answers: [{ questionId, selectedOptionId }] }` → backend chấm điểm tức thời, **không lưu lại đáp án đã chọn**, chỉ trả kết quả `{ scorePercent, passed, requiredPercent: 70 }`. Nếu `passed = true` → đánh dấu `page_progress.is_completed = true`, cập nhật lại `enrollment.progress_percent`, và nếu tất cả trang/chương đã hoàn thành → `enrollment.status = COMPLETED`. Có thể nộp lại nhiều lần nếu chưa đạt. |
| POST | `/api/pages/{id}/complete` | *(Student)* Dùng cho trang **không chứa block QUIZ** (TEXT/MEDIA/FLASHCARD) — chỉ cần truy cập trang là đủ điều kiện hoàn thành, gọi API này để đánh dấu |
| GET | `/api/learning/dashboard` | *(Student)* `{ courses: [{ courseId, title, progressPercent }], continueLearning: [{ courseId, courseTitle, pageId, pageTitle, lastAccessedAt }] }` — "tiếp tục học" lấy theo `enrollment.last_page_id` |
| GET | `/api/courses/{id}/progress` | *(Student)* Map trạng thái hoàn thành theo từng chương/trang của khóa học đó — phục vụ hiển thị tick xanh trên tab bar |

> **Ngưỡng đạt quiz mặc định: 70%** (giả định MVP, áp dụng chung toàn hệ thống — chưa cho phép Creator tùy chỉnh theo từng quiz; có thể mở rộng sau).

---

## 11. Comment

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/courses/{id}/comments` | Phân trang |
| POST | `/api/courses/{id}/comments` | *(auth)* `{ content }` |
| PUT | `/api/comments/{id}` | *(Tác giả bình luận)* `{ content }` |
| DELETE | `/api/comments/{id}` | *(Tác giả bình luận)* |

---

## 12. Notification

| Method | Endpoint | Mô tả & Payload |
|---|---|---|
| GET | `/api/notifications` | *(auth)* Phân trang, kèm `unreadCount` trong response meta |
| GET | `/api/notifications/unread-count` | *(auth)* Chỉ trả số lượng chưa đọc — dùng riêng cho badge chấm đỏ trên icon, gọi nhẹ hơn polling cả danh sách |
| PATCH | `/api/notifications/read-all` | *(auth)* Đánh dấu toàn bộ đã đọc — gọi khi user mở dropdown thông báo |

> Không có endpoint xóa thông báo, không cần đánh dấu đọc từng cái riêng lẻ, không real-time (WebSocket/SSE) — chỉ hiển thị chấm báo tin mới trên icon, client polling `unread-count` định kỳ.

---

## 13. Bảng Enum tổng hợp

| Enum | Giá trị |
|---|---|
| `AccessType` | `PUBLIC`, `PRIVATE`, `PROTECTED` |
| `CourseStatus` | `PAUSED`, `COMPLETED`, `UPDATING` |
| `BlockType` | `TEXT`, `IMAGE`, `AUDIO`, `VIDEO`, `QUIZ`, `FLASHCARD` |
| `EnrollmentStatus` | `LEARNING`, `COMPLETED` |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `DECLINED` |
| `NotificationType` | `NEW_CHAPTER`, `NEW_COMMENT`, `NEW_ENROLLMENT`, `COURSE_INVITATION`, `INVITATION_ACCEPTED` |
