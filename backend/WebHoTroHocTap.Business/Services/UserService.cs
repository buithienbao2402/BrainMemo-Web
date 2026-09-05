using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebHoTroHocTap.Business.DTOs.User;
using WebHoTroHocTap.DataAccess;

namespace WebHoTroHocTap.Business.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<UserProfileResponseDto?> GetProfileAsync(int userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) return null;

        return new UserProfileResponseDto
        {
            UserId = user.UserId,
            Email = user.Email,
            FullName = user.FullName,
            AvatarUrl = user.AvatarUrl,
            Bio = user.Bio,
            ThemeMode = user.ThemeMode,
            NotificationEnabled = user.NotificationEnabled ?? true,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> UpdateProfileAsync(int userId, UpdateProfileRequestDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) return false;

        user.FullName = dto.FullName;
        user.Bio = dto.Bio;
        if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
        {
            user.AvatarUrl = dto.AvatarUrl;
        }
        user.NotificationEnabled = dto.NotificationEnabled;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdateThemeAsync(int userId, string themeMode)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) return false;

        string normalized = themeMode.ToUpper() == "DARK" ? "DARK" : "LIGHT";
        user.ThemeMode = normalized;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
        if (user == null) return false;

        if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
        {
            throw new ArgumentException("Mật khẩu hiện tại không chính xác.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> LogoutAsync(int userId, string? refreshToken)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            // Thu hồi token cụ thể
            var token = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.UserId == userId && t.TokenHash == refreshToken && t.RevokedAt == null);

            if (token != null)
            {
                token.RevokedAt = DateTime.UtcNow;
            }
        }
        else
        {
            // Hoặc thu hồi tất cả session của user nếu không gửi token cụ thể
            var activeTokens = await _context.RefreshTokens
                .Where(t => t.UserId == userId && t.RevokedAt == null)
                .ToListAsync();

            foreach (var t in activeTokens)
            {
                t.RevokedAt = DateTime.UtcNow;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }
}