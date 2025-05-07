namespace OnlineMarketplace.Domain.Interfaces;

using OnlineMarketplace.Domain.Entities;

public interface IMessageService
{
    Task<IEnumerable<Message>> GetAllAsync();
    Task<Message?> GetByIdAsync(int id);
    Task<Message> AddAsync(Message message);
    Task<Message> UpdateAsync(Message message);
    Task DeleteAsync(int id);
}
