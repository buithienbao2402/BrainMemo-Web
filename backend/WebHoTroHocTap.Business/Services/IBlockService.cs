using WebHoTroHocTap.Business.DTOs.Block;

namespace WebHoTroHocTap.Business.Services;

public interface IBlockService
{
    Task<int> CreateBlockAsync(int pageId, int userId, BlockRequestDto dto);
    Task<bool> UpdateBlockAsync(int blockId, int userId, BlockRequestDto dto);
    Task<bool> DeleteBlockAsync(int blockId, int userId);
}