namespace WebHoTroHocTap.Business.DTOs.Invitation;

public class InviteRequestDto
{
    public string EmailOrUsername { get; set; } = string.Empty;
}

public class InvitationRespondDto
{
    public bool Accept { get; set; }
}
