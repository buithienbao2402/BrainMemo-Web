using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Block
{
    public int BlockId { get; set; }

    public int PageId { get; set; }

    public string BlockType { get; set; } = null!;

    public int OrderIndex { get; set; }

    public string? ContentText { get; set; }

    public string? MediaUrl { get; set; }

    public virtual FlashcardSet? FlashcardSet { get; set; }

    public virtual Page Page { get; set; } = null!;

    public virtual Quiz? Quiz { get; set; }
}
