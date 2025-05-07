namespace OnlineMarketplace.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using OnlineMarketplace.Domain.Entities;
public static class DbInitializer
    {
        public static async Task InitializeAsync(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            OnlineMarketplaceDbContext context)
        {
            // 1. Создание ролей
            string[] roles = { "Buyer", "Seller" };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // 2. Создание пользователей по умолчанию

            if (await userManager.FindByNameAsync("buyer") == null)
            {
                var buyer = new ApplicationUser
                {
                    UserName = "buyer",
                    Email = "buyer@example.com",
                    Role = "Buyer",
                    RegistrationDate = DateTime.UtcNow
                };

                await userManager.CreateAsync(buyer, "Buyer123!");
                await userManager.AddToRoleAsync(buyer, "Buyer");
            }

            if (await userManager.FindByNameAsync("seller") == null)
            {
                var seller = new ApplicationUser
                {
                    UserName = "seller",
                    Email = "seller@example.com",
                    Role = "Seller",
                    RegistrationDate = DateTime.UtcNow
                };

                await userManager.CreateAsync(seller, "Seller123!");
                await userManager.AddToRoleAsync(seller, "Seller");
            }

            // 3. Добавление начальных категорий/товаров, если нужно
            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Электроника", Description = "Гаджеты и техника" },
                    new Category { Name = "Одежда", Description = "Мужская и женская одежда" }
                );

                await context.SaveChangesAsync();
            }
        }
    }