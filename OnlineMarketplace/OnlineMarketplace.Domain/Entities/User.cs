namespace OnlineMarketplace.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; } // Храните хеш пароля
    public string Role { get; set; } // "buyer" или "seller"
    public DateTime RegistrationDate { get; set; }
}