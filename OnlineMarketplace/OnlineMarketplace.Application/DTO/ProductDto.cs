namespace OnlineMarketplace.Application.DTO;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public string SellerId { get; set; }
    public DateTime CreationDate { get; set; }
    public bool IsAvailable { get; set; }
    public byte[] ImageData { get; set; }
    
    // 🔗 Связанные данные:
    public string CategoryName { get; set; }
    public string SellerUsername { get; set; }
}