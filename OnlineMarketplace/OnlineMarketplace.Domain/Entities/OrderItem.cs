namespace OnlineMarketplace.Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }

    public int? OrderId { get; set; }
    public Order? Order { get; set; }
    public OrderItemStatus Status { get; set; } // новый enum
    public string SellerId { get; set; } // 👈 ДОБАВИТЬ
    public ApplicationUser Seller { get; set; } // (опционально)

    public string ProductName { get; set; }
    public byte[]? ProductImage { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; }

    public int Quantity { get; set; }
    public decimal Price { get; set; }

    public string UserId { get; set; }   // 👈 связка с пользователем
    public ApplicationUser User { get; set; } // (опционально) навигация
}
