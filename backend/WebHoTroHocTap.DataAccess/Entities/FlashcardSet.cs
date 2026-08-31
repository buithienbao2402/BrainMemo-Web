using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class FlashcardSet
{
    public int FlashcardSetId { get; set; }

    public int BlockId { get; set; }

    public virtual Block Block { get; set; } = null!;

    public virtual ICollection<Flashcard> Flashcards { get; set; } = new List<Flashcard>();
}
