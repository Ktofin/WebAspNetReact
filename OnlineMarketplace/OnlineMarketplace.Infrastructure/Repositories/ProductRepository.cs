namespace OnlineMarketplace.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Infrastructure.Data;
public class ProductRepository : IProductRepository
{
    private readonly OnlineMarketplaceDbContext _context;

    public ProductRepository(OnlineMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<Product> GetByIdAsync(int id)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Seller)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<Product> AddAsync(Product product)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync();
        return product;
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        var existing = await _context.Products.FindAsync(product.Id);
        if (existing == null) return null;

        // Обновляем только scalar-поля (не навигационные свойства!)
        existing.Name = product.Name;
        existing.Description = product.Description;
        existing.Price = product.Price;
        existing.CategoryId = product.CategoryId;
        existing.SellerId = product.SellerId;
        existing.IsAvailable = product.IsAvailable;
        existing.ImageData = product.ImageData;
        existing.CreationDate = product.CreationDate;

        // Навигационные свойства НЕ трогаем (Category, Seller)

        await _context.SaveChangesAsync();
        return existing;
    }


    public async Task DeleteAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product != null)
        {
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        return await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Seller) // если есть навигационное свойство
            .ToListAsync();
    }
    
    public async Task<IEnumerable<Product>> GetBySellerIdAsync(string sellerId)
    {
        return await _context.Products
            .Where(p => p.SellerId == sellerId)
            .ToListAsync();
    }

}