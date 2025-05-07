namespace OnlineMarketplace.Domain.Entities;

public class UserCategory
{
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    public int CategoryId { get; set; }
    public Category Category { get; set; }
}