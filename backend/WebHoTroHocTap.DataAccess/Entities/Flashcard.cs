using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Flashcard
{
    public int FlashcardId { get; set; }

    public int FlashcardSetId { get; set; }

    public string FrontText { get; set; } = null!;

    public string BackText { get; set; } = null!;

    public int OrderIndex { get; set; }

    public virtual FlashcardSet FlashcardSet { get; set; } = null!;
}
