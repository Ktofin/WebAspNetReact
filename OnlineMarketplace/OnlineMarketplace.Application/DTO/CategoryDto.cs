namespace OnlineMarketplace.Application.DTO;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int? ParentCategoryId { get; set; }
    
    public List<ProductDto> Products { get; set; }
}