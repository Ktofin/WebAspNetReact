namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;
public interface ICategoryService
{
    Task<Category> GetByIdAsync(int id);
    Task<Category> AddAsync(Category category);
    Task<Category> UpdateAsync(Category category);
    Task DeleteAsync(int id);
    Task<IEnumerable<Category>> GetAllAsync();
    Task<IEnumerable<Category>> GetByIdsAsync(IEnumerable<int> ids);
    
    

}