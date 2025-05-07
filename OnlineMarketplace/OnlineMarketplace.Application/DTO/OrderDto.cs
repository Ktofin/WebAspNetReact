namespace OnlineMarketplace.Application.DTO;

public class OrderDto
{
    public int Id { get; set; }
    public string? BuyerId { get; set; }
    public DateTime OrderDate { get; set; }
    public string? OrderStatus { get; set; }
    public string ShippingAddress { get; set; }
    public decimal TotalAmount { get; set; }
    
    public string? BuyerUsername { get; set; }    // 🔗 добавлено
    public string? BuyerEmail { get; set; }       // 🔗 добавлено
    
    public List<OrderItemDto> Items { get; set; }
}