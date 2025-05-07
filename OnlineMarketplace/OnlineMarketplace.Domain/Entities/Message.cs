namespace OnlineMarketplace.Domain.Entities;

public class Message
{
    public int Id { get; set; }
    public string SenderId { get; set; }
    public string ReceiverId { get; set; }
    public string Content { get; set; }
    public DateTime SentAt { get; set; }
    public bool IsRead { get; set; }
    
    public int? ProductId { get; set; } // 👈 Добавлено

    public Product? Product { get; set; } // 👈 Навигационное свойство
}
