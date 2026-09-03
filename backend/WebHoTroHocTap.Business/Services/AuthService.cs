using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using WebHoTroHocTap.Business.DTOs;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;
using Microsoft.Extensions.Caching.Memory;

namespace WebHoTroHocTap.Business.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IMemoryCache _cache;
    private readonly IEmailService _emailService;

    public AuthService(AppDbContext context, IConfiguration configuration, IMemoryCache cache, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _cache = cache;
        _emailService = emailService;
    }

    public async Task<LoginResponseDto?> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
        {
            return null;
        }

        var jwtKey = _configuration["Jwt:Key"] ?? "WebHoTroHocTap_Secret_Key_For_JWT_Authentication_2026";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

        var claims = new List<Claim>
        {
            new Claim("userId", user.UserId.ToString()),
            new Claim("email", user.Email)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(30),
            SigningCredentials = creds,
            Issuer = _configuration["Jwt:Issuer"],
            Audience = _configuration["Jwt:Audience"],
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        string tokenString = tokenHandler.WriteToken(token);

        var rawRefreshToken = Guid.NewGuid().ToString();
        var tokenHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken)));

        _context.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.UserId,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(30)
        });
        await _context.SaveChangesAsync();

        return new LoginResponseDto
        {
            AccessToken = tokenString,
            RefreshToken = rawRefreshToken,
            User = new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName ?? user.Email
            }
        };
    }

    // ==========================================
    // LUỒNG ĐĂNG KÝ (REQUEST OTP & VERIFY OTP)[cite: 1]
    // ==========================================

    public async Task<(bool IsSuccess, string ErrorMessage)> RequestOtpAsync(string email, string password, string fullName)
    {
        // 1. Kiểm tra email đã tồn tại trong Database chưa[cite: 2]
        var isEmailExist = await _context.Users.AnyAsync(u => u.Email == email);
        if (isEmailExist)
        {
            return (false, "Email này đã được đăng ký.");
        }

        // 2. Sinh OTP ngẫu nhiên 6 số
        string otp = new Random().Next(100000, 999999).ToString();

        // 3. Lưu thông tin tạm vào Cache trong 5 phút
        var cacheData = (Email: email, Password: password, FullName: fullName, Otp: otp);
        _cache.Set($"RegisterOTP_{email}", cacheData, TimeSpan.FromMinutes(5));

        // 4. Gửi email thực tế qua IEmailService
        string subject = "Mã OTP xác thực tài khoản WebHoTroHocTap";
        string body = $"<h3>Mã OTP của bạn là: <b style='color:blue;'>{otp}</b></h3><p>Mã này có hiệu lực trong vòng 5 phút.</p>";

        await _emailService.SendEmailAsync(email, subject, body);

        return (true, string.Empty);
    }

    public async Task<(bool IsSuccess, string ErrorMessage)> VerifyOtpAsync(string email, string otp)
    {
        // 1. Lấy dữ liệu từ Cache ra để kiểm tra
        if (!_cache.TryGetValue($"RegisterOTP_{email}", out (string Email, string Password, string FullName, string Otp) cachedData))
        {
            return (false, "Mã OTP đã hết hạn hoặc không tồn tại.");
        }

        if (cachedData.Otp != otp)
        {
            return (false, "Mã OTP không chính xác.");
        }

        // 2. Băm mật khẩu bằng BCrypt[cite: 1]
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(cachedData.Password);

        // 3. Tạo User mới lưu vào Database[cite: 1, 2]
        var newUser = new User
        {
            Email = cachedData.Email,
            PasswordHash = passwordHash,
            FullName = cachedData.FullName
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        // 4. Xóa cache sau khi tạo thành công
        _cache.Remove($"RegisterOTP_{email}");

        return (true, string.Empty);
    }
}