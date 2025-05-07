namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;
public interface IUserCategoryService
{
    Task<UserCategory> GetByIdAsync(string userId, int categoryId);
    Task<UserCategory> AddAsync(UserCategory userCategory);
    Task<UserCategory> UpdateAsync(UserCategory userCategory);
    Task DeleteAsync(string userId, int categoryId);
    Task<IEnumerable<UserCategory>> GetAllAsync();
}