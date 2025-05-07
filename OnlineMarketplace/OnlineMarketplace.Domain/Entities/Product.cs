namespace OnlineMarketplace.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
    public string SellerId { get; set; }
    public ApplicationUser Seller { get; set; }
    public DateTime CreationDate { get; set; }
    public bool IsAvailable { get; set; }
    public byte[] ImageData { get; set; } // Изображение в виде массива байтов
}