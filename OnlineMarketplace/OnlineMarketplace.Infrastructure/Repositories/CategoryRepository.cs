namespace OnlineMarketplace.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Infrastructure.Data;
public class CategoryRepository : ICategoryRepository
{
    private readonly OnlineMarketplaceDbContext _context;

    public CategoryRepository(OnlineMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<Category> GetByIdAsync(int id)
    {
        return await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<Category> AddAsync(Category category)
    {
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories
            .Include(c => c.Products)
            .ToListAsync();
    }
    public async Task<IEnumerable<Category>> GetByParentIdAsync(int parentCategoryId)
    {
        return await _context.Categories
            .Where(c => c.ParentCategoryId == parentCategoryId)
            .Include(c => c.Products)
            .ToListAsync();
    }
    public async Task<IEnumerable<Category>> GetByIdsAsync(IEnumerable<int> ids)
    {
        return await _context.Categories
            .Where(c => ids.Contains(c.Id))
            .Include(c => c.Products) // если ты хочешь возвращать продукты сразу
            .ToListAsync();
    }


}