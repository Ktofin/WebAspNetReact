namespace OnlineMarketplace.Domain.Entities;
using Microsoft.AspNetCore.Identity;
public class ApplicationUser : IdentityUser
{
    public string Role { get; set; } // buyer или seller
    public DateTime RegistrationDate { get; set; } = DateTime.UtcNow;
}