using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class Quiz
{
    public int QuizId { get; set; }

    public int BlockId { get; set; }

    public virtual Block Block { get; set; } = null!;

    public virtual ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
}
