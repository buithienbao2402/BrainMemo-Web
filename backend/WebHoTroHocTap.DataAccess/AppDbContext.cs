using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.DataAccess;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Block> Blocks { get; set; }
    public virtual DbSet<Chapter> Chapters { get; set; }
    public virtual DbSet<Comment> Comments { get; set; }
    public virtual DbSet<Course> Courses { get; set; }
    public virtual DbSet<CourseInvitation> CourseInvitations { get; set; }
    public virtual DbSet<Enrollment> Enrollments { get; set; }
    public virtual DbSet<Flashcard> Flashcards { get; set; }
    public virtual DbSet<FlashcardSet> FlashcardSets { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Page> Pages { get; set; }
    public virtual DbSet<PageProgress> PageProgresses { get; set; }
    public virtual DbSet<Quiz> Quizzes { get; set; }
    public virtual DbSet<QuizOption> QuizOptions { get; set; }
    public virtual DbSet<QuizQuestion> QuizQuestions { get; set; }
    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public virtual DbSet<CourseTag> CourseTags { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_unicode_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<Block>(entity =>
        {
            entity.HasKey(e => e.BlockId).HasName("PRIMARY");
            entity.ToTable("block");
            entity.HasIndex(e => e.PageId, "idx_block_page");
            entity.HasIndex(e => e.BlockType, "idx_block_type");
            entity.Property(e => e.BlockId).HasColumnName("block_id");
            entity.Property(e => e.BlockType)
                .HasColumnType("enum('TEXT','IMAGE','AUDIO','VIDEO','QUIZ','FLASHCARD')")
                .HasColumnName("block_type");
            entity.Property(e => e.ContentText)
                .HasColumnType("text")
                .HasColumnName("content_text");
            entity.Property(e => e.MediaUrl)
                .HasMaxLength(500)
                .HasColumnName("media_url");
            entity.Property(e => e.OrderIndex).HasColumnName("order_index");
            entity.Property(e => e.PageId).HasColumnName("page_id");

            entity.HasOne(d => d.Page).WithMany(p => p.Blocks)
                .HasForeignKey(d => d.PageId)
                .HasConstraintName("fk_block_page");
        });

        modelBuilder.Entity<Chapter>(entity =>
        {
            entity.HasKey(e => e.ChapterId).HasName("PRIMARY");
            entity.ToTable("chapter");
            entity.HasIndex(e => e.CourseId, "idx_chapter_course");
            entity.Property(e => e.ChapterId).HasColumnName("chapter_id");
            entity.Property(e => e.AccessType)
                .HasDefaultValueSql("'PUBLIC'")
                .HasColumnType("enum('PUBLIC','PRIVATE','PROTECTED')")
                .HasColumnName("access_type");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.OrderIndex).HasColumnName("order_index");
            entity.Property(e => e.Passcode)
                .HasMaxLength(100)
                .HasColumnName("passcode");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Course).WithMany(p => p.Chapters)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_chapter_course");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PRIMARY");
            entity.ToTable("comment");
            entity.HasIndex(e => e.CourseId, "idx_comment_course");
            entity.HasIndex(e => e.UserId, "idx_comment_user");
            entity.Property(e => e.CommentId).HasColumnName("comment_id");
            entity.Property(e => e.Content)
                .HasColumnType("text")
                .HasColumnName("content");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Course).WithMany(p => p.Comments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_comment_course");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_comment_user");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PRIMARY");
            entity.ToTable("course");
            entity.HasIndex(e => e.AccessType, "idx_course_access_type");
            entity.HasIndex(e => e.CreatorId, "idx_course_creator");
            entity.HasIndex(e => e.Status, "idx_course_status");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.AccessType)
                .HasConversion<string>()
                .HasDefaultValueSql("'PUBLIC'")
                .HasColumnType("enum('PUBLIC','PRIVATE','PROTECTED')")
                .HasColumnName("access_type");
            entity.Property(e => e.CoverImage)
                .HasMaxLength(500)
                .HasColumnName("cover_image");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.CreatorId).HasColumnName("creator_id");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.Passcode)
                .HasMaxLength(100)
                .HasColumnName("passcode");
            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasDefaultValueSql("'UPDATING'")
                .HasColumnType("enum('PAUSED','COMPLETED','UPDATING')")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");

            entity.HasOne(d => d.Creator).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CreatorId)
                .HasConstraintName("fk_course_creator");
        });

        // Bảng trung gian CourseTag đã tách thành Entity độc lập
        modelBuilder.Entity<CourseTag>(entity =>
        {
            entity.ToTable("course_tag");
            entity.HasKey(ct => new { ct.CourseId, ct.TagId });

            entity.Property(ct => ct.CourseId).HasColumnName("course_id");
            entity.Property(ct => ct.TagId).HasColumnName("tag_id");

            entity.HasOne(ct => ct.Course)
                  .WithMany(c => c.CourseTags)
                  .HasForeignKey(ct => ct.CourseId)
                  .HasConstraintName("fk_coursetag_course");

            entity.HasOne(ct => ct.Tag)
                  .WithMany(t => t.CourseTags)
                  .HasForeignKey(ct => ct.TagId)
                  .HasConstraintName("fk_coursetag_tag");
        });

        modelBuilder.Entity<CourseInvitation>(entity =>
        {
            entity.HasKey(e => e.InvitationId).HasName("PRIMARY");
            entity.ToTable("course_invitation");
            entity.HasIndex(e => e.InviteeUserId, "fk_invitation_invitee");
            entity.HasIndex(e => e.InviterId, "fk_invitation_inviter");
            entity.HasIndex(e => e.CourseId, "idx_invitation_course");
            entity.HasIndex(e => e.InviteeEmail, "idx_invitation_invitee_email");
            entity.HasIndex(e => e.Status, "idx_invitation_status");
            entity.Property(e => e.InvitationId).HasColumnName("invitation_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.InviteeEmail).HasColumnName("invitee_email");
            entity.Property(e => e.InviteeUserId).HasColumnName("invitee_user_id");
            entity.Property(e => e.InviterId).HasColumnName("inviter_id");
            entity.Property(e => e.RespondedAt)
                .HasColumnType("datetime")
                .HasColumnName("responded_at");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'PENDING'")
                .HasColumnType("enum('PENDING','ACCEPTED','DECLINED')")
                .HasColumnName("status");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseInvitations)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_invitation_course");

            entity.HasOne(d => d.InviteeUser).WithMany(p => p.CourseInvitationInviteeUsers)
                .HasForeignKey(d => d.InviteeUserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_invitation_invitee");

            entity.HasOne(d => d.Inviter).WithMany(p => p.CourseInvitationInviters)
                .HasForeignKey(d => d.InviterId)
                .HasConstraintName("fk_invitation_inviter");
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.EnrollmentId).HasName("PRIMARY");
            entity.ToTable("enrollment");
            entity.HasIndex(e => e.CourseId, "idx_enrollment_course");
            entity.HasIndex(e => e.LastPageId, "idx_enrollment_lastpage");
            entity.HasIndex(e => e.UserId, "idx_enrollment_user");
            entity.HasIndex(e => new { e.UserId, e.CourseId }, "uq_enrollment_user_course").IsUnique();
            entity.Property(e => e.EnrollmentId).HasColumnName("enrollment_id");
            entity.Property(e => e.CourseId).HasColumnName("course_id");
            entity.Property(e => e.EnrolledAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("enrolled_at");
            entity.Property(e => e.LastAccessedAt)
                .HasColumnType("datetime")
                .HasColumnName("last_accessed_at");
            entity.Property(e => e.LastPageId).HasColumnName("last_page_id");
            entity.Property(e => e.ProgressPercent)
                .HasPrecision(5, 2)
                .HasColumnName("progress_percent");
            entity.Property(e => e.Status)
                .HasDefaultValueSql("'LEARNING'")
                .HasColumnType("enum('LEARNING','COMPLETED')")
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Course).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("fk_enrollment_course");

            entity.HasOne(d => d.LastPage).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.LastPageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("fk_enrollment_lastpage");

            entity.HasOne(d => d.User).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_enrollment_user");
        });

        modelBuilder.Entity<Flashcard>(entity =>
        {
            entity.HasKey(e => e.FlashcardId).HasName("PRIMARY");
            entity.ToTable("flashcard");
            entity.HasIndex(e => e.FlashcardSetId, "idx_flashcard_set");
            entity.Property(e => e.FlashcardId).HasColumnName("flashcard_id");
            entity.Property(e => e.BackText)
                .HasMaxLength(500)
                .HasColumnName("back_text");
            entity.Property(e => e.FlashcardSetId).HasColumnName("flashcard_set_id");
            entity.Property(e => e.FrontText)
                .HasMaxLength(500)
                .HasColumnName("front_text");
            entity.Property(e => e.OrderIndex).HasColumnName("order_index");

            entity.HasOne(d => d.FlashcardSet).WithMany(p => p.Flashcards)
                .HasForeignKey(d => d.FlashcardSetId)
                .HasConstraintName("fk_flashcard_set");
        });

        modelBuilder.Entity<FlashcardSet>(entity =>
        {
            entity.HasKey(e => e.FlashcardSetId).HasName("PRIMARY");
            entity.ToTable("flashcard_set");
            entity.HasIndex(e => e.BlockId, "uq_flashcardset_block").IsUnique();
            entity.Property(e => e.FlashcardSetId).HasColumnName("flashcard_set_id");
            entity.Property(e => e.BlockId).HasColumnName("block_id");

            entity.HasOne(d => d.Block).WithOne(p => p.FlashcardSet)
                .HasForeignKey<FlashcardSet>(d => d.BlockId)
                .HasConstraintName("fk_flashcardset_block");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PRIMARY");
            entity.ToTable("notification");
            entity.HasIndex(e => e.IsRead, "idx_notification_isread");
            entity.HasIndex(e => e.UserId, "idx_notification_user");
            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.Content)
                .HasMaxLength(500)
                .HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead).HasColumnName("is_read");
            entity.Property(e => e.Type)
                .HasColumnType("enum('NEW_CHAPTER','NEW_COMMENT','NEW_ENROLLMENT','COURSE_INVITATION','INVITATION_ACCEPTED')")
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_notification_user");
        });

        modelBuilder.Entity<Page>(entity =>
        {
            entity.HasKey(e => e.PageId).HasName("PRIMARY");
            entity.ToTable("page");
            entity.HasIndex(e => e.ChapterId, "idx_page_chapter");
            entity.Property(e => e.PageId).HasColumnName("page_id");
            entity.Property(e => e.ChapterId).HasColumnName("chapter_id");
            entity.Property(e => e.OrderIndex).HasColumnName("order_index");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");

            entity.HasOne(d => d.Chapter).WithMany(p => p.Pages)
                .HasForeignKey(d => d.ChapterId)
                .HasConstraintName("fk_page_chapter");
        });

        modelBuilder.Entity<PageProgress>(entity =>
        {
            entity.HasKey(e => e.ProgressId).HasName("PRIMARY");
            entity.ToTable("page_progress");
            entity.HasIndex(e => e.EnrollmentId, "idx_progress_enrollment");
            entity.HasIndex(e => e.PageId, "idx_progress_page");
            entity.HasIndex(e => new { e.EnrollmentId, e.PageId }, "uq_progress_enrollment_page").IsUnique();
            entity.Property(e => e.ProgressId).HasColumnName("progress_id");
            entity.Property(e => e.CompletedAt)
                .HasColumnType("datetime")
                .HasColumnName("completed_at");
            entity.Property(e => e.EnrollmentId).HasColumnName("enrollment_id");
            entity.Property(e => e.IsCompleted).HasColumnName("is_completed");
            entity.Property(e => e.PageId).HasColumnName("page_id");

            entity.HasOne(d => d.Enrollment).WithMany(p => p.PageProgresses)
                .HasForeignKey(d => d.EnrollmentId)
                .HasConstraintName("fk_progress_enrollment");

            entity.HasOne(d => d.Page).WithMany(p => p.PageProgresses)
                .HasForeignKey(d => d.PageId)
                .HasConstraintName("fk_progress_page");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.QuizId).HasName("PRIMARY");
            entity.ToTable("quiz");
            entity.HasIndex(e => e.BlockId, "uq_quiz_block").IsUnique();
            entity.Property(e => e.QuizId).HasColumnName("quiz_id");
            entity.Property(e => e.BlockId).HasColumnName("block_id");

            entity.HasOne(d => d.Block).WithOne(p => p.Quiz)
                .HasForeignKey<Quiz>(d => d.BlockId)
                .HasConstraintName("fk_quiz_block");
        });

        modelBuilder.Entity<QuizOption>(entity =>
        {
            entity.HasKey(e => e.OptionId).HasName("PRIMARY");
            entity.ToTable("quiz_option");
            entity.HasIndex(e => e.QuestionId, "idx_option_question");
            entity.Property(e => e.OptionId).HasColumnName("option_id");
            entity.Property(e => e.IsCorrect).HasColumnName("is_correct");
            entity.Property(e => e.OptionText)
                .HasMaxLength(500)
                .HasColumnName("option_text");
            entity.Property(e => e.QuestionId).HasColumnName("question_id");

            entity.HasOne(d => d.Question).WithMany(p => p.QuizOptions)
                .HasForeignKey(d => d.QuestionId)
                .HasConstraintName("fk_option_question");
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.QuestionId).HasName("PRIMARY");
            entity.ToTable("quiz_question");
            entity.HasIndex(e => e.QuizId, "idx_question_quiz");
            entity.Property(e => e.QuestionId).HasColumnName("question_id");
            entity.Property(e => e.Explanation)
                .HasColumnType("text")
                .HasColumnName("explanation");
            entity.Property(e => e.OrderIndex).HasColumnName("order_index");
            entity.Property(e => e.QuestionText)
                .HasColumnType("text")
                .HasColumnName("question_text");
            entity.Property(e => e.QuizId).HasColumnName("quiz_id");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizQuestions)
                .HasForeignKey(d => d.QuizId)
                .HasConstraintName("fk_question_quiz");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.TokenId).HasName("PRIMARY");
            entity.ToTable("refresh_token");
            entity.HasIndex(e => e.ExpiresAt, "idx_refreshtoken_expiry");
            entity.HasIndex(e => e.UserId, "idx_refreshtoken_user");
            entity.HasIndex(e => e.TokenHash, "uq_refresh_token_hash").IsUnique();
            entity.Property(e => e.TokenId).HasColumnName("token_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.DeviceInfo)
                .HasMaxLength(255)
                .HasColumnName("device_info");
            entity.Property(e => e.ExpiresAt)
                .HasColumnType("datetime")
                .HasColumnName("expires_at");
            entity.Property(e => e.RevokedAt)
                .HasColumnType("datetime")
                .HasColumnName("revoked_at");
            entity.Property(e => e.TokenHash).HasColumnName("token_hash");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("fk_refreshtoken_user");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.TagId).HasName("PRIMARY");
            entity.ToTable("tag");
            entity.HasIndex(e => e.TagName, "uq_tag_name").IsUnique();
            entity.Property(e => e.TagId).HasColumnName("tag_id");
            entity.Property(e => e.TagName)
                .HasMaxLength(100)
                .HasColumnName("tag_name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");
            entity.ToTable("user");
            entity.HasIndex(e => e.Email, "uq_user_email").IsUnique();
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(500)
                .HasColumnName("avatar_url");
            entity.Property(e => e.Bio)
                .HasColumnType("text")
                .HasColumnName("bio");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("created_at");
            entity.Property(e => e.Email).HasColumnName("email");
            entity.Property(e => e.FullName)
                .HasMaxLength(150)
                .HasColumnName("full_name");
            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("is_active");
            entity.Property(e => e.NotificationEnabled)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("notification_enabled");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .HasColumnName("password_hash");
            entity.Property(e => e.ThemeMode)
                .HasDefaultValueSql("'LIGHT'")
                .HasColumnType("enum('LIGHT','DARK')")
                .HasColumnName("theme_mode");
            entity.Property(e => e.UpdatedAt)
                .ValueGeneratedOnAddOrUpdate()
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("updated_at");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}