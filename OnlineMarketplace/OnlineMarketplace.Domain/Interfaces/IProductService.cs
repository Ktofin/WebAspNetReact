namespace OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Domain.Entities;

public interface IProductService
{
    Task<Product> GetByIdAsync(int id);
    Task<Product> AddAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task DeleteAsync(int id);
    
    Task<IEnumerable<Product>> GetAllAsync();
    Task<IEnumerable<Product>> GetBySellerIdAsync(string sellerId);

    
    
}