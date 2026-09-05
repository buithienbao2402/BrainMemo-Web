using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebHoTroHocTap.Business.DTOs.Page;

public class PageRequestDto
{
    public string Title { get; set; } = string.Empty;
    public int OrderIndex { get; set; } = 1;
}
