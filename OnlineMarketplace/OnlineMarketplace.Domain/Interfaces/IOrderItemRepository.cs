namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;
public interface IOrderItemRepository
{
    Task<OrderItem> GetByIdAsync(int id);
    Task<OrderItem> AddAsync(OrderItem orderItem);
    Task<OrderItem> UpdateAsync(OrderItem orderItem);
    Task DeleteAsync(int id);
    Task<IEnumerable<OrderItem>> GetAllAsync();
}