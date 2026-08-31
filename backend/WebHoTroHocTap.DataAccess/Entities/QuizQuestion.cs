using System;
using System.Collections.Generic;

namespace WebHoTroHocTap.DataAccess.Entities;

public partial class QuizQuestion
{
    public int QuestionId { get; set; }

    public int QuizId { get; set; }

    public string QuestionText { get; set; } = null!;

    public string? Explanation { get; set; }

    public int OrderIndex { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual ICollection<QuizOption> QuizOptions { get; set; } = new List<QuizOption>();
}
