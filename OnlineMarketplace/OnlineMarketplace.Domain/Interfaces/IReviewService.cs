namespace OnlineMarketplace.Domain.Interfaces;

using OnlineMarketplace.Domain.Entities;

public interface IReviewService
{
    Task<IEnumerable<Review>> GetAllAsync();
    Task<Review?> GetByIdAsync(int id);
    Task<Review> AddAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(int id);
}
