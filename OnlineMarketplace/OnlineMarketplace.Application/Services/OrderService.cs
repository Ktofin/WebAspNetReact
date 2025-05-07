namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;

    public OrderService(IOrderRepository orderRepository)
    {
        _orderRepository = orderRepository;
    }

    public async Task<Order> GetByIdAsync(int id)
    {
        return await _orderRepository.GetByIdAsync(id);
    }

    public async Task<Order> AddAsync(Order order)
    {
        return await _orderRepository.AddAsync(order);
    }

    public async Task<Order> UpdateAsync(Order order)
    {
        return await _orderRepository.UpdateAsync(order);
    }

    public async Task DeleteAsync(int id)
    {
        await _orderRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        return await _orderRepository.GetAllAsync();
    }

    public OrderDto MapOrderToDto(Order order)
    {
        if (order == null) return null;

        return new OrderDto
        {
            Id = order.Id,
            BuyerId = order.BuyerId,
            OrderDate = order.OrderDate,
            OrderStatus = order.OrderStatus.ToString(),
            ShippingAddress = order.ShippingAddress,
            TotalAmount = order.TotalAmount,

            BuyerUsername = order.Buyer?.UserName,
            BuyerEmail = order.Buyer?.Email,

            Items = order.OrderItems?.Select(oi => new OrderItemDto
            {
                Id = oi.Id,
                OrderId = oi.OrderId,
                ProductId = oi.ProductId,
                Quantity = oi.Quantity,
                Price = oi.Price,
                UserId = oi.UserId,
                SellerId = oi.SellerId,
                OrderItemStatus = oi.Status.ToString(),
                ProductName = oi.ProductName,       // ✅ используем сохранённое
                ProductImage = oi.ProductImage      // ✅ используем сохранённое
            }).ToList()

        };
    }
    public async Task RecalculateOrderStatusAsync(int orderId)
    {
        var order = await _orderRepository.GetByIdAsync(orderId);
        if (order == null || order.OrderItems == null || !order.OrderItems.Any())
            return;

        var statuses = order.OrderItems.Select(oi => oi.Status).Distinct().ToList();

        if (statuses.All(s => s == OrderItemStatus.Completed))
            order.OrderStatus = OrderStatus.Delivered;
        else if (statuses.All(s => s == OrderItemStatus.Shipped || s == OrderItemStatus.Completed))
            order.OrderStatus = OrderStatus.Shipped;
        else if (statuses.All(s => s == OrderItemStatus.Confirmed || s == OrderItemStatus.Waiting))
            order.OrderStatus = OrderStatus.Confirmed;
        else if (statuses.All(s => s == OrderItemStatus.Waiting))
            order.OrderStatus = OrderStatus.Pending;
        else if (statuses.All(s => s == OrderItemStatus.Canceled))
            order.OrderStatus = OrderStatus.Canceled;
        else
            order.OrderStatus = OrderStatus.Processing; // промежуточный, если всё вперемешку

        await _orderRepository.UpdateAsync(order);
    }


    public Order MapDtoToOrder(OrderDto orderDto)
    {
        if (orderDto == null) return null;

        return new Order
            {
                Id = orderDto.Id,
                BuyerId = orderDto.BuyerId,
                OrderDate = orderDto.OrderDate,
                OrderStatus = !string.IsNullOrEmpty(orderDto.OrderStatus)
                    ? Enum.Parse<OrderStatus>(orderDto.OrderStatus)
                    : OrderStatus.Pending
                ,
                ShippingAddress = orderDto.ShippingAddress,
                TotalAmount = orderDto.TotalAmount
            };
    }

    public IEnumerable<OrderDto> MapOrdersToDto(IEnumerable<Order> orders)
    {
        if (orders == null) return new List<OrderDto>();

        var orderDtos = new List<OrderDto>();
        foreach (var order in orders)
        {
            orderDtos.Add(MapOrderToDto(order));
        }
        return orderDtos;
    }
}