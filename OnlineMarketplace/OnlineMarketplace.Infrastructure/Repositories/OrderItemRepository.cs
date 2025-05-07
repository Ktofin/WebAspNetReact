namespace OnlineMarketplace.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Infrastructure.Data;
public class OrderItemRepository : IOrderItemRepository
{
    private readonly OnlineMarketplaceDbContext _context;

    public OrderItemRepository(OnlineMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<OrderItem> GetByIdAsync(int id)
    {
        return await _context.OrderItems.FindAsync(id);
    }

    public async Task<OrderItem> AddAsync(OrderItem orderItem)
    {
        _context.OrderItems.Add(orderItem);
        await _context.SaveChangesAsync();
        return orderItem;
    }

    public async Task<OrderItem> UpdateAsync(OrderItem orderItem)
    {
        _context.OrderItems.Update(orderItem);
        await _context.SaveChangesAsync();
        return orderItem;
    }

    public async Task DeleteAsync(int id)
    {
        var orderItem = await _context.OrderItems.FindAsync(id);
        if (orderItem != null)
        {
            _context.OrderItems.Remove(orderItem);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<OrderItem>> GetAllAsync()
    {
        return await _context.OrderItems.ToListAsync();
    }
}