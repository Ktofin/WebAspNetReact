namespace OnlineMarketplace.Application.DTO;

public class ReviewDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string? UserId { get; set; }
    public string Text { get; set; }
    public int Rating { get; set; } // от 1 до 5
    public DateTime CreatedAt { get; set; }

    public string? Reply { get; set; } // ответ продавца
   
}