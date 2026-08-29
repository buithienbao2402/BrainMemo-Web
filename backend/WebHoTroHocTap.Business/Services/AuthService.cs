using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebHoTroHocTap.DataAccess;
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _dbContext;

        public AuthService(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<(string AccessToken, string RefreshToken, User User)> LoginAsync(string email, string password, string jwtKey, string issuer, string audience)
        {
            // Tìm kiếm user theo email trong CSDL
            var user = await _dbContext.Users.SingleOrDefaultAsync(u => u.Email == email);

            if (user == null || user.PasswordHash != password)
                throw new Exception("Tài khoản hoặc mật khẩu không chính xác");

            // Khởi tạo danh sách Claims tách biệt rõ ràng (đảm bảo đúng 2 tham số: type và value)
            var claims = new List<System.Security.Claims.Claim>
{
    new System.Security.Claims.Claim("userId", user.UserId.ToString()),
    new System.Security.Claims.Claim("email", user.Email)
};

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);

            // Tạo Access Token (hạn 30 phút)[cite: 1]
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(30),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = creds
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(token);

            // Tạo Refresh Token (30 ngày) lưu vào bảng refresh_token[cite: 1, 2]
            var refreshToken = Guid.NewGuid().ToString("N");
            _dbContext.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.UserId,
                TokenHash = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            });
            await _dbContext.SaveChangesAsync();

            return (accessToken, refreshToken, user);
        }
    }
}