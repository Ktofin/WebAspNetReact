namespace OnlineMarketplace.Application.DTO;

public class MessageDto
{
    public int Id { get; set; }

    public string? SenderId { get; set; }
    public string ReceiverId { get; set; }

    public string Content { get; set; }
    public DateTime SentAt { get; set; }

    public bool IsRead { get; set; }

    public int? ProductId { get; set; }          // 👈 для связи
    public string? ProductName { get; set; }     // 👈 для отображения
}