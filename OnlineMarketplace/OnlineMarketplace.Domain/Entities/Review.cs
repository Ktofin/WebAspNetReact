namespace OnlineMarketplace.Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string BuyerId { get; set; }
    public string Text { get; set; }
    public int Rating { get; set; } // 1–5
    public DateTime CreatedAt { get; set; }

    public string? SellerReply { get; set; } // Ответ от продавца
}
