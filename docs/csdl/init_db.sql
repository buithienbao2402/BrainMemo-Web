-- =====================================================================
-- init_db_v2.sql — Web Hỗ Trợ Học Tập
-- Bản đầy đủ, khớp API Contract v2 (đã tích hợp sẵn 5 thay đổi schema:
-- explanation cho quiz_question, bảng course_invitation, mở rộng enum
-- notification.type, last_page_id/last_accessed_at cho enrollment,
-- bảng refresh_token).
--
-- CHỈ dùng để TẠO MỚI CSDL (chưa tồn tại). Script này DROP DATABASE nếu
-- trùng tên rồi tạo lại từ đầu — KHÔNG chạy script này lên CSDL đang có
-- dữ liệu thật, dùng migration_v2_api_contract.sql cho trường hợp đó.
-- =====================================================================

DROP DATABASE IF EXISTS web_ho_tro_hoc_tap;
CREATE DATABASE web_ho_tro_hoc_tap
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE web_ho_tro_hoc_tap;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. USER — tài khoản (bao gồm cả vai trò User/Student/Creator)
-- =====================================================================
CREATE TABLE `user` (
    user_id             INT AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(255) NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    full_name           VARCHAR(150) NOT NULL,
    avatar_url          VARCHAR(500) NULL,
    bio                 TEXT NULL,
    notification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    theme_mode          ENUM('LIGHT', 'DARK') NOT NULL DEFAULT 'LIGHT',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_email UNIQUE (email)
) ENGINE = InnoDB;

-- =====================================================================
-- 2. COURSE — khóa học
-- =====================================================================
CREATE TABLE course (
    course_id       INT AUTO_INCREMENT PRIMARY KEY,
    creator_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT NULL,
    cover_image     VARCHAR(500) NULL,
    access_type     ENUM('PUBLIC', 'PRIVATE', 'PROTECTED') NOT NULL DEFAULT 'PUBLIC',
    passcode        VARCHAR(100) NULL,
    status          ENUM('PAUSED', 'COMPLETED', 'UPDATING') NOT NULL DEFAULT 'UPDATING',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_creator
        FOREIGN KEY (creator_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_course_passcode
        CHECK (access_type <> 'PROTECTED' OR passcode IS NOT NULL)
) ENGINE = InnoDB;

CREATE INDEX idx_course_creator ON course(creator_id);
CREATE INDEX idx_course_access_type ON course(access_type);
CREATE INDEX idx_course_status ON course(status);

-- =====================================================================
-- 3. CHAPTER — chương (thuộc khóa học, phân quyền độc lập)
-- =====================================================================
CREATE TABLE chapter (
    chapter_id      INT AUTO_INCREMENT PRIMARY KEY,
    course_id       INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    access_type     ENUM('PUBLIC', 'PRIVATE', 'PROTECTED') NOT NULL DEFAULT 'PUBLIC',
    passcode        VARCHAR(100) NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chapter_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_chapter_passcode
        CHECK (access_type <> 'PROTECTED' OR passcode IS NOT NULL)
) ENGINE = InnoDB;

CREATE INDEX idx_chapter_course ON chapter(course_id);

-- =====================================================================
-- 4. PAGE — trang (thuộc chương; KHÔNG có access_type riêng — kế thừa
--    hoàn toàn quyền truy cập của chapter chứa nó)
-- =====================================================================
CREATE TABLE page (
    page_id         INT AUTO_INCREMENT PRIMARY KEY,
    chapter_id      INT NOT NULL,
    title           VARCHAR(255) NOT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_page_chapter
        FOREIGN KEY (chapter_id) REFERENCES chapter(chapter_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_page_chapter ON page(chapter_id);

-- =====================================================================
-- 5. BLOCK — khối nội dung (thuộc trang)
-- =====================================================================
CREATE TABLE block (
    block_id        INT AUTO_INCREMENT PRIMARY KEY,
    page_id         INT NOT NULL,
    block_type      ENUM('TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'QUIZ', 'FLASHCARD') NOT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    content_text    TEXT NULL,
    media_url       VARCHAR(500) NULL,
    CONSTRAINT fk_block_page
        FOREIGN KEY (page_id) REFERENCES page(page_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_block_page ON block(page_id);
CREATE INDEX idx_block_type ON block(block_type);

-- =====================================================================
-- 6. QUIZ — mở rộng 1-1 của BLOCK khi block_type = 'QUIZ'
-- =====================================================================
CREATE TABLE quiz (
    quiz_id         INT AUTO_INCREMENT PRIMARY KEY,
    block_id        INT NOT NULL,
    CONSTRAINT uq_quiz_block UNIQUE (block_id),
    CONSTRAINT fk_quiz_block
        FOREIGN KEY (block_id) REFERENCES block(block_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================================
-- 7. QUIZ_QUESTION — câu hỏi trong quiz
--    [API Contract v2] + explanation: giải thích cho đáp án đúng
-- =====================================================================
CREATE TABLE quiz_question (
    question_id     INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id         INT NOT NULL,
    question_text   TEXT NOT NULL,
    explanation     TEXT NULL,
    order_index     INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_question_quiz
        FOREIGN KEY (quiz_id) REFERENCES quiz(quiz_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_question_quiz ON quiz_question(quiz_id);

-- =====================================================================
-- 8. QUIZ_OPTION — đáp án của câu hỏi
-- =====================================================================
CREATE TABLE quiz_option (
    option_id       INT AUTO_INCREMENT PRIMARY KEY,
    question_id     INT NOT NULL,
    option_text     VARCHAR(500) NOT NULL,
    is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_option_question
        FOREIGN KEY (question_id) REFERENCES quiz_question(question_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_option_question ON quiz_option(question_id);

-- =====================================================================
-- 9. FLASHCARD_SET — mở rộng 1-1 của BLOCK khi block_type = 'FLASHCARD'
-- =====================================================================
CREATE TABLE flashcard_set (
    flashcard_set_id INT AUTO_INCREMENT PRIMARY KEY,
    block_id         INT NOT NULL,
    CONSTRAINT uq_flashcardset_block UNIQUE (block_id),
    CONSTRAINT fk_flashcardset_block
        FOREIGN KEY (block_id) REFERENCES block(block_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================================
-- 10. FLASHCARD — thẻ ghi nhớ trong bộ
-- =====================================================================
CREATE TABLE flashcard (
    flashcard_id     INT AUTO_INCREMENT PRIMARY KEY,
    flashcard_set_id INT NOT NULL,
    front_text       VARCHAR(500) NOT NULL,
    back_text        VARCHAR(500) NOT NULL,
    order_index      INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_flashcard_set
        FOREIGN KEY (flashcard_set_id) REFERENCES flashcard_set(flashcard_set_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_flashcard_set ON flashcard(flashcard_set_id);

-- =====================================================================
-- 11. ENROLLMENT — bảng trung gian USER <-> COURSE (vai trò Student)
--     [API Contract v2] + last_page_id / last_accessed_at: phục vụ
--     mục "Tiếp tục học" (trang dở dang gần nhất)
-- =====================================================================
CREATE TABLE enrollment (
    enrollment_id    INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    course_id        INT NOT NULL,
    enrolled_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status           ENUM('LEARNING', 'COMPLETED') NOT NULL DEFAULT 'LEARNING',
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    last_page_id     INT NULL,
    last_accessed_at DATETIME NULL,
    CONSTRAINT uq_enrollment_user_course UNIQUE (user_id, course_id),
    CONSTRAINT fk_enrollment_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enrollment_lastpage
        FOREIGN KEY (last_page_id) REFERENCES page(page_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_progress_percent
        CHECK (progress_percent BETWEEN 0 AND 100)
) ENGINE = InnoDB;

CREATE INDEX idx_enrollment_user ON enrollment(user_id);
CREATE INDEX idx_enrollment_course ON enrollment(course_id);
CREATE INDEX idx_enrollment_lastpage ON enrollment(last_page_id);

-- =====================================================================
-- 12. PAGE_PROGRESS — bảng trung gian ENROLLMENT <-> PAGE (tiến độ học)
-- =====================================================================
CREATE TABLE page_progress (
    progress_id      INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id    INT NOT NULL,
    page_id          INT NOT NULL,
    is_completed     BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at     DATETIME NULL,
    CONSTRAINT uq_progress_enrollment_page UNIQUE (enrollment_id, page_id),
    CONSTRAINT fk_progress_enrollment
        FOREIGN KEY (enrollment_id) REFERENCES enrollment(enrollment_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_page
        FOREIGN KEY (page_id) REFERENCES page(page_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_progress_enrollment ON page_progress(enrollment_id);
CREATE INDEX idx_progress_page ON page_progress(page_id);

-- =====================================================================
-- 13. COMMENT — bình luận độc lập trong khóa học
-- =====================================================================
CREATE TABLE `comment` (
    comment_id       INT AUTO_INCREMENT PRIMARY KEY,
    course_id        INT NOT NULL,
    user_id          INT NOT NULL,
    content          TEXT NOT NULL,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_comment_course ON `comment`(course_id);
CREATE INDEX idx_comment_user ON `comment`(user_id);

-- =====================================================================
-- 14. NOTIFICATION — thông báo hệ thống
--     [API Contract v2] + COURSE_INVITATION, INVITATION_ACCEPTED
-- =====================================================================
CREATE TABLE notification (
    notification_id  INT AUTO_INCREMENT PRIMARY KEY,
    user_id          INT NOT NULL,
    type             ENUM(
                        'NEW_CHAPTER',
                        'NEW_COMMENT',
                        'NEW_ENROLLMENT',
                        'COURSE_INVITATION',
                        'INVITATION_ACCEPTED'
                     ) NOT NULL,
    content          VARCHAR(500) NOT NULL,
    is_read          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_isread ON notification(is_read);

-- =====================================================================
-- 15. TAG — danh mục thẻ
-- =====================================================================
CREATE TABLE tag (
    tag_id      INT AUTO_INCREMENT PRIMARY KEY,
    tag_name    VARCHAR(100) NOT NULL,
    CONSTRAINT uq_tag_name UNIQUE (tag_name)
) ENGINE = InnoDB;

-- =====================================================================
-- 16. COURSE_TAG — bảng trung gian COURSE <-> TAG
-- =====================================================================
CREATE TABLE course_tag (
    course_id   INT NOT NULL,
    tag_id      INT NOT NULL,
    PRIMARY KEY (course_id, tag_id),
    CONSTRAINT fk_coursetag_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_coursetag_tag
        FOREIGN KEY (tag_id) REFERENCES tag(tag_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- =====================================================================
-- 17. COURSE_INVITATION — [API Contract v2, MỚI]
--     Lời mời học viên qua email (creator chủ động mời, user accept/decline)
-- =====================================================================
CREATE TABLE course_invitation (
    invitation_id    INT AUTO_INCREMENT PRIMARY KEY,
    course_id        INT NOT NULL,
    inviter_id       INT NOT NULL,
    invitee_email    VARCHAR(255) NOT NULL,
    invitee_user_id  INT NULL,
    status           ENUM('PENDING', 'ACCEPTED', 'DECLINED') NOT NULL DEFAULT 'PENDING',
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at     DATETIME NULL,
    CONSTRAINT fk_invitation_course
        FOREIGN KEY (course_id) REFERENCES course(course_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_invitation_inviter
        FOREIGN KEY (inviter_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_invitation_invitee
        FOREIGN KEY (invitee_user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_invitation_course ON course_invitation(course_id);
CREATE INDEX idx_invitation_invitee_email ON course_invitation(invitee_email);
CREATE INDEX idx_invitation_status ON course_invitation(status);

-- =====================================================================
-- 18. REFRESH_TOKEN — [API Contract v2, MỚI]
--     Whitelist refresh token — phục vụ "đăng xuất tất cả thiết bị" và
--     thu hồi token khi đổi mật khẩu (JWT thuần không tự thu hồi được)
-- =====================================================================
CREATE TABLE refresh_token (
    token_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    token_hash    VARCHAR(255) NOT NULL,
    device_info   VARCHAR(255) NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at    DATETIME NOT NULL,
    revoked_at    DATETIME NULL,
    CONSTRAINT uq_refresh_token_hash UNIQUE (token_hash),
    CONSTRAINT fk_refreshtoken_user
        FOREIGN KEY (user_id) REFERENCES `user`(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_refreshtoken_user ON refresh_token(user_id);
CREATE INDEX idx_refreshtoken_expiry ON refresh_token(expires_at);

SET FOREIGN_KEY_CHECKS = 1;