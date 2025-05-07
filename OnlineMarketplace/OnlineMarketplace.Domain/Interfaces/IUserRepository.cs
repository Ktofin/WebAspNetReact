namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
    Task<User> AddAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task<IEnumerable<User>> GetAllAsync();
}