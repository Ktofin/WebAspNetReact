namespace OnlineMarketplace.Application.DTO;

public class OrderItemDto
{
    public int Id { get; set; }
    public int? OrderId { get; set; }

    public string? UserId { get; set; }          // 👈 теперь nullable
    public int ProductId { get; set; }
    public int Quantity { get; set; }

    public string? SellerId { get; set; }        // 👈
    public string? OrderItemStatus { get; set; } // 👈

    public decimal Price { get; set; }

    public string? ProductName { get; set; }
    public byte[]? ProductImage { get; set; }
}
