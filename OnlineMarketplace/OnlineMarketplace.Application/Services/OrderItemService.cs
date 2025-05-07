namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class OrderItemService : IOrderItemService
    {
        private readonly IOrderItemRepository _orderItemRepository;

        public OrderItemService(IOrderItemRepository orderItemRepository)
        {
            _orderItemRepository = orderItemRepository;
        }

        public async Task<OrderItem> GetByIdAsync(int id)
        {
            return await _orderItemRepository.GetByIdAsync(id);
        }

        public async Task<OrderItem> AddAsync(OrderItem orderItem)
        {
            return await _orderItemRepository.AddAsync(orderItem);
        }

        public async Task<OrderItem> UpdateAsync(OrderItem orderItem)
        {
            return await _orderItemRepository.UpdateAsync(orderItem);
        }

        public async Task DeleteAsync(int id)
        {
            await _orderItemRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<OrderItem>> GetAllAsync()
        {
            return await _orderItemRepository.GetAllAsync();
        }

        public OrderItemDto MapOrderItemToDto(OrderItem orderItem)
        {
            if (orderItem == null) return null;

            return new OrderItemDto
            {
                Id = orderItem.Id,
                OrderId = orderItem.OrderId,
                ProductId = orderItem.ProductId,
                Quantity = orderItem.Quantity,
                Price = orderItem.Price,
                UserId = orderItem.UserId,
                SellerId = orderItem.SellerId,
                OrderItemStatus = orderItem.Status.ToString(),

                // 👇 Добавь эти поля!
                ProductName = orderItem.ProductName,
                ProductImage = orderItem.ProductImage
            };
        }


        public OrderItem MapDtoToOrderItem(OrderItemDto orderItemDto)
        {
            if (orderItemDto == null) return null;

            return new OrderItem
            {
                Id = orderItemDto.Id,
                OrderId = orderItemDto.OrderId,
                ProductId = orderItemDto.ProductId,
                Quantity = orderItemDto.Quantity,
                Price = orderItemDto.Price,
                UserId = orderItemDto.UserId,
                SellerId = orderItemDto.SellerId,
                Status = Enum.TryParse<OrderItemStatus>(orderItemDto.OrderItemStatus, out var parsed)
                    ? parsed
                    : OrderItemStatus.Waiting,
                ProductName = orderItemDto.ProductName,
                ProductImage = orderItemDto.ProductImage
            };
        }

        public IEnumerable<OrderItemDto> MapOrderItemsToDto(IEnumerable<OrderItem> orderItems)
        {
            if (orderItems == null) return new List<OrderItemDto>();

            var orderItemDtos = new List<OrderItemDto>();
            foreach (var orderItem in orderItems)
            {
                orderItemDtos.Add(MapOrderItemToDto(orderItem));
            }
            return orderItemDtos;
        }
        
    }