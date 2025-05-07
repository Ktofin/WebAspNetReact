namespace OnlineMarketplace.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Infrastructure.Data;
public class UserCategoryRepository : IUserCategoryRepository
{
    private readonly OnlineMarketplaceDbContext _context;

    public UserCategoryRepository(OnlineMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<UserCategory> GetByIdAsync(string userId, int categoryId)
    {
        return await _context.UserCategories.FindAsync(userId, categoryId);
    }

    public async Task<UserCategory> AddAsync(UserCategory userCategory)
    {
        _context.UserCategories.Add(userCategory);
        await _context.SaveChangesAsync();
        return userCategory;
    }

    public async Task<UserCategory> UpdateAsync(UserCategory userCategory)
    {
        _context.UserCategories.Update(userCategory);
        await _context.SaveChangesAsync();
        return userCategory;
    }

    public async Task DeleteAsync(string userId, int categoryId)
    {
        var userCategory = await _context.UserCategories.FindAsync(userId, categoryId);
        if (userCategory != null)
        {
            _context.UserCategories.Remove(userCategory);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<UserCategory>> GetAllAsync()
    {
        return await _context.UserCategories.ToListAsync();
    }
}