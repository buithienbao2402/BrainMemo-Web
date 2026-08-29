// WebHoTroHocTap.Business/Services/IAuthService.cs
using WebHoTroHocTap.DataAccess.Entities;

namespace WebHoTroHocTap.Business.Services
{
    public interface IAuthService
    {
        Task<(string AccessToken, string RefreshToken, User User)> LoginAsync(string email, string password, string jwtKey, string issuer, string audience);
    }
}