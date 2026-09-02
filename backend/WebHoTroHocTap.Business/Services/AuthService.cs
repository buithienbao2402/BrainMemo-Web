using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using WebHoTroHocTap.Business.DTOs;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.Business.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto?> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        // Kiểm tra mật khẩu (chỉnh lại thuộc tính mật khẩu khớp với Entity User của bạn: user.Password hoặc user.PasswordHash)
        if (user == null || user.PasswordHash != password)
        {
            return null;
        }

        // Lấy secret key từ cấu hình Jwt:Key (hoặc chuỗi mặc định tối thiểu 32 ký tự)
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
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        string tokenString = tokenHandler.WriteToken(token);

        return new LoginResponseDto
        {
            AccessToken = tokenString,
            User = new UserDto
            {
                UserId = user.UserId,
                Email = user.Email,
                FullName = user.FullName ?? user.Email // Đổi sang đúng tên cột Họ tên nếu trong DB đặt khác
            }
        };
    }
}