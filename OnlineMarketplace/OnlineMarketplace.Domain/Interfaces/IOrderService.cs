namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;
public interface IOrderService
{
    Task<Order> GetByIdAsync(int id);
    Task<Order> AddAsync(Order order);
    Task<Order> UpdateAsync(Order order);
    Task DeleteAsync(int id);
    Task<IEnumerable<Order>> GetAllAsync();
}