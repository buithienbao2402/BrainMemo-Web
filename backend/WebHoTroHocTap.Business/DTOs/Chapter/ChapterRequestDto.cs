using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebHoTroHocTap.Business.DTOs.Chapter;

public class ChapterRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
    public string AccessType { get; set; } = "PUBLIC";
    public string? Passcode { get; set; }
    public bool IsDraft { get; set; } = false;
}
