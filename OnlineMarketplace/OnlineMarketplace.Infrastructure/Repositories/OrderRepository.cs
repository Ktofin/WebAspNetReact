namespace OnlineMarketplace.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Infrastructure.Data;
public class OrderRepository : IOrderRepository
{
    private readonly OnlineMarketplaceDbContext _context;
    

    public OrderRepository(OnlineMarketplaceDbContext context)
    {
        _context = context;
    }

    public async Task<Order> GetByIdAsync(int id)
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.Buyer)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Order> AddAsync(Order order)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        _context.Orders.Update(order);
        await _context.SaveChangesAsync();
        return order;
    }

    public async Task DeleteAsync(int id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order != null)
        {
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .Include(o => o.Buyer)
            .ToListAsync();
    }
}