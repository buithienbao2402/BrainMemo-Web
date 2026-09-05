using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WebHoTroHocTap.Business.DTOs.Home;

namespace WebHoTroHocTap.Business.Services;

public interface IHomeService
{
    Task<HomeDashboardDto> GetHomeDashboardAsync(int? userId);
    Task<List<string>> GetPopularTagsAsync(int limit = 15);
}
