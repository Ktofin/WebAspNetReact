namespace OnlineMarketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
public class OnlineMarketplaceDbContext : IdentityDbContext<ApplicationUser>
{
    public OnlineMarketplaceDbContext(DbContextOptions<OnlineMarketplaceDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<UserCategory> UserCategories { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Указание внешнего ключа BuyerId для Order
        modelBuilder.Entity<Order>()
            .HasOne(o => o.Buyer)
            .WithMany()
            .HasForeignKey(o => o.BuyerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Указание внешнего ключа SellerId для Product
        modelBuilder.Entity<Product>()
            .HasOne(p => p.Seller)
            .WithMany()
            .HasForeignKey(p => p.SellerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Составной ключ в UserCategory
        modelBuilder.Entity<UserCategory>()
            .HasKey(uc => new { uc.UserId, uc.CategoryId });
    }
}