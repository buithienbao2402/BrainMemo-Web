using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using WebHoTroHocTap.API.Json;
using WebHoTroHocTap.Business.Services;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Enums;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình kết nối CSDL MySQL (Tầng DataAccess)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// 2. Đăng ký các Service (Tầng Business)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IChapterService, ChapterService>();
builder.Services.AddScoped<IPageService, PageService>();
builder.Services.AddScoped<IBlockService, BlockService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<ICommentService, CommentService>();

// 3. Cấu hình xác thực JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// 4. Các dịch vụ mặc định của Web API
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new CaseInsensitiveEnumConverter<AccessType>());
        options.JsonSerializerOptions.Converters.Add(new CaseInsensitiveEnumConverter<CourseStatus>());
    });

// Nâng giới hạn tải file lên 100MB phục vụ đăng video/audio
builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100 MB
});

builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100 MB
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "WebHoTroHocTap.API",
        Version = "v1"
    });

    // Khắc phục triệt để lỗi Swagger 500 do xung đột tên Schema DTO giữa các namespace
    options.CustomSchemaIds(type => type.FullName ?? type.Name);

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Dán access token vào đây (không cần gõ chữ 'Bearer ' phía trước, Swagger tự thêm)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // URL Vite dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddMemoryCache();

var app = builder.Build();

// Tự động khởi tạo các thư mục lưu file local nếu chưa có
var uploadsRoot = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
foreach (var subFolder in new[] { "images", "audios", "videos" })
{
    var folderPath = Path.Combine(uploadsRoot, subFolder);
    if (!Directory.Exists(folderPath))
    {
        Directory.CreateDirectory(folderPath);
    }
}

// 5. Cấu hình HTTP Request Pipeline (Middleware)
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Cho phép CORS trước file tĩnh để trình duyệt đọc ảnh/audio/video không bị chặn
app.UseCors("AllowFrontend");

// Kích hoạt phục vụ file tĩnh từ thư mục wwwroot
app.UseStaticFiles();

// QUAN TRỌNG: UseAuthentication phải nằm TRƯỚC UseAuthorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();