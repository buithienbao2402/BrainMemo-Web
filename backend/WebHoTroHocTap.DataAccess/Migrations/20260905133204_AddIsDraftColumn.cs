using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebHoTroHocTap.DataAccess.Migrations
{
    /// <inheritdoc />
    public partial class AddIsDraftColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            

            migrationBuilder.CreateTable(
                name: "chapter",
                columns: table => new
                {
                    chapter_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    course_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_index = table.Column<int>(type: "int", nullable: false),
                    access_type = table.Column<string>(type: "enum('PUBLIC','PRIVATE','PROTECTED')", nullable: false, defaultValueSql: "'PUBLIC'", collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    passcode = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_draft = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: false),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.chapter_id);
                    table.ForeignKey(
                        name: "fk_chapter_course",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "comment",
                columns: table => new
                {
                    comment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    course_id = table.Column<int>(type: "int", nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "text", nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.comment_id);
                    table.ForeignKey(
                        name: "fk_comment_course",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_comment_user",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "course_invitation",
                columns: table => new
                {
                    invitation_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    course_id = table.Column<int>(type: "int", nullable: false),
                    inviter_id = table.Column<int>(type: "int", nullable: false),
                    invitee_email = table.Column<string>(type: "varchar(255)", nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    invitee_user_id = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "enum('PENDING','ACCEPTED','DECLINED')", nullable: false, defaultValueSql: "'PENDING'", collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    responded_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.invitation_id);
                    table.ForeignKey(
                        name: "fk_invitation_course",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_invitation_invitee",
                        column: x => x.invitee_user_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_invitation_inviter",
                        column: x => x.inviter_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "course_tag",
                columns: table => new
                {
                    course_id = table.Column<int>(type: "int", nullable: false),
                    tag_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_course_tag", x => new { x.course_id, x.tag_id });
                    table.ForeignKey(
                        name: "fk_coursetag_course",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_coursetag_tag",
                        column: x => x.tag_id,
                        principalTable: "tag",
                        principalColumn: "tag_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "page",
                columns: table => new
                {
                    page_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    chapter_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.page_id);
                    table.ForeignKey(
                        name: "fk_page_chapter",
                        column: x => x.chapter_id,
                        principalTable: "chapter",
                        principalColumn: "chapter_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "block",
                columns: table => new
                {
                    block_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    page_id = table.Column<int>(type: "int", nullable: false),
                    block_type = table.Column<string>(type: "enum('TEXT','IMAGE','AUDIO','VIDEO','QUIZ','FLASHCARD')", nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_index = table.Column<int>(type: "int", nullable: false),
                    content_text = table.Column<string>(type: "text", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    media_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.block_id);
                    table.ForeignKey(
                        name: "fk_block_page",
                        column: x => x.page_id,
                        principalTable: "page",
                        principalColumn: "page_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "enrollment",
                columns: table => new
                {
                    enrollment_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    course_id = table.Column<int>(type: "int", nullable: false),
                    enrolled_at = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    status = table.Column<string>(type: "enum('LEARNING','COMPLETED')", nullable: false, defaultValueSql: "'LEARNING'", collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    progress_percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    last_page_id = table.Column<int>(type: "int", nullable: true),
                    last_accessed_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.enrollment_id);
                    table.ForeignKey(
                        name: "fk_enrollment_course",
                        column: x => x.course_id,
                        principalTable: "course",
                        principalColumn: "course_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_enrollment_lastpage",
                        column: x => x.last_page_id,
                        principalTable: "page",
                        principalColumn: "page_id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_enrollment_user",
                        column: x => x.user_id,
                        principalTable: "user",
                        principalColumn: "user_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "flashcard_set",
                columns: table => new
                {
                    flashcard_set_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    block_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.flashcard_set_id);
                    table.ForeignKey(
                        name: "fk_flashcardset_block",
                        column: x => x.block_id,
                        principalTable: "block",
                        principalColumn: "block_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "quiz",
                columns: table => new
                {
                    quiz_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    block_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.quiz_id);
                    table.ForeignKey(
                        name: "fk_quiz_block",
                        column: x => x.block_id,
                        principalTable: "block",
                        principalColumn: "block_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "page_progress",
                columns: table => new
                {
                    progress_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    enrollment_id = table.Column<int>(type: "int", nullable: false),
                    page_id = table.Column<int>(type: "int", nullable: false),
                    is_completed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    completed_at = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.progress_id);
                    table.ForeignKey(
                        name: "fk_progress_enrollment",
                        column: x => x.enrollment_id,
                        principalTable: "enrollment",
                        principalColumn: "enrollment_id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_progress_page",
                        column: x => x.page_id,
                        principalTable: "page",
                        principalColumn: "page_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "flashcard",
                columns: table => new
                {
                    flashcard_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    flashcard_set_id = table.Column<int>(type: "int", nullable: false),
                    front_text = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    back_text = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.flashcard_id);
                    table.ForeignKey(
                        name: "fk_flashcard_set",
                        column: x => x.flashcard_set_id,
                        principalTable: "flashcard_set",
                        principalColumn: "flashcard_set_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "quiz_question",
                columns: table => new
                {
                    question_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    quiz_id = table.Column<int>(type: "int", nullable: false),
                    question_text = table.Column<string>(type: "text", nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    explanation = table.Column<string>(type: "text", nullable: true, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.question_id);
                    table.ForeignKey(
                        name: "fk_question_quiz",
                        column: x => x.quiz_id,
                        principalTable: "quiz",
                        principalColumn: "quiz_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateTable(
                name: "quiz_option",
                columns: table => new
                {
                    option_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    question_id = table.Column<int>(type: "int", nullable: false),
                    option_text = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false, collation: "utf8mb4_unicode_ci")
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_correct = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PRIMARY", x => x.option_id);
                    table.ForeignKey(
                        name: "fk_option_question",
                        column: x => x.question_id,
                        principalTable: "quiz_question",
                        principalColumn: "question_id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4")
                .Annotation("Relational:Collation", "utf8mb4_unicode_ci");

            migrationBuilder.CreateIndex(
                name: "idx_block_page",
                table: "block",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "idx_block_type",
                table: "block",
                column: "block_type");

            migrationBuilder.CreateIndex(
                name: "idx_chapter_course",
                table: "chapter",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "idx_comment_course",
                table: "comment",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "idx_comment_user",
                table: "comment",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_access_type",
                table: "course",
                column: "access_type");

            migrationBuilder.CreateIndex(
                name: "idx_course_creator",
                table: "course",
                column: "creator_id");

            migrationBuilder.CreateIndex(
                name: "idx_course_status",
                table: "course",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "fk_invitation_invitee",
                table: "course_invitation",
                column: "invitee_user_id");

            migrationBuilder.CreateIndex(
                name: "fk_invitation_inviter",
                table: "course_invitation",
                column: "inviter_id");

            migrationBuilder.CreateIndex(
                name: "idx_invitation_course",
                table: "course_invitation",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "idx_invitation_invitee_email",
                table: "course_invitation",
                column: "invitee_email");

            migrationBuilder.CreateIndex(
                name: "idx_invitation_status",
                table: "course_invitation",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_course_tag_tag_id",
                table: "course_tag",
                column: "tag_id");

            migrationBuilder.CreateIndex(
                name: "idx_enrollment_course",
                table: "enrollment",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "idx_enrollment_lastpage",
                table: "enrollment",
                column: "last_page_id");

            migrationBuilder.CreateIndex(
                name: "idx_enrollment_user",
                table: "enrollment",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "uq_enrollment_user_course",
                table: "enrollment",
                columns: new[] { "user_id", "course_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_flashcard_set",
                table: "flashcard",
                column: "flashcard_set_id");

            migrationBuilder.CreateIndex(
                name: "uq_flashcardset_block",
                table: "flashcard_set",
                column: "block_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_notification_isread",
                table: "notification",
                column: "is_read");

            migrationBuilder.CreateIndex(
                name: "idx_notification_user",
                table: "notification",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_page_chapter",
                table: "page",
                column: "chapter_id");

            migrationBuilder.CreateIndex(
                name: "idx_progress_enrollment",
                table: "page_progress",
                column: "enrollment_id");

            migrationBuilder.CreateIndex(
                name: "idx_progress_page",
                table: "page_progress",
                column: "page_id");

            migrationBuilder.CreateIndex(
                name: "uq_progress_enrollment_page",
                table: "page_progress",
                columns: new[] { "enrollment_id", "page_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_quiz_block",
                table: "quiz",
                column: "block_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_option_question",
                table: "quiz_option",
                column: "question_id");

            migrationBuilder.CreateIndex(
                name: "idx_question_quiz",
                table: "quiz_question",
                column: "quiz_id");

            migrationBuilder.CreateIndex(
                name: "idx_refreshtoken_expiry",
                table: "refresh_token",
                column: "expires_at");

            migrationBuilder.CreateIndex(
                name: "idx_refreshtoken_user",
                table: "refresh_token",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "uq_refresh_token_hash",
                table: "refresh_token",
                column: "token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_tag_name",
                table: "tag",
                column: "tag_name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "uq_user_email",
                table: "user",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "comment");

            migrationBuilder.DropTable(
                name: "course_invitation");

            migrationBuilder.DropTable(
                name: "course_tag");

            migrationBuilder.DropTable(
                name: "flashcard");

            migrationBuilder.DropTable(
                name: "notification");

            migrationBuilder.DropTable(
                name: "page_progress");

            migrationBuilder.DropTable(
                name: "quiz_option");

            migrationBuilder.DropTable(
                name: "refresh_token");

            migrationBuilder.DropTable(
                name: "tag");

            migrationBuilder.DropTable(
                name: "flashcard_set");

            migrationBuilder.DropTable(
                name: "enrollment");

            migrationBuilder.DropTable(
                name: "quiz_question");

            migrationBuilder.DropTable(
                name: "quiz");

            migrationBuilder.DropTable(
                name: "block");

            migrationBuilder.DropTable(
                name: "page");

            migrationBuilder.DropTable(
                name: "chapter");

            migrationBuilder.DropTable(
                name: "course");

            migrationBuilder.DropTable(
                name: "user");
        }
    }
}
