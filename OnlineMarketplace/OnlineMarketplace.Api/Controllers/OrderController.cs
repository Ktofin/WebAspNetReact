using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Domain.Entities;

namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для оформления заказов и управления ими.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly OrderService _orderService;
    private readonly OrderItemService _orderItemService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ProductService _productService;


    public  OrderController(
        OrderService orderService,
        OrderItemService orderItemService,
        ProductService productService, // 👈 добавить сюда
        UserManager<ApplicationUser> userManager)
    {
        _orderService = orderService;
        _orderItemService = orderItemService;
        _productService = productService; // 👈 сохранить в поле
        _userManager = userManager;
    }

    /// <summary>
    /// Оформляет новый заказ от имени покупателя.
    /// Привязывает товары из корзины к заказу.
    /// </summary>
    /// <param name="input">Информация о заказе (адрес, сумма).</param>
    /// <returns>Созданный заказ с привязанными товарами.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] OrderDto input)
    {
        var user = await _userManager.GetUserAsync(User);

        // 1. Создаём пустой заказ
        var order = new OrderDto
        {
            BuyerId = user.Id,
            OrderDate = DateTime.UtcNow,
            OrderStatus = OrderStatus.Pending.ToString(),
            ShippingAddress = input.ShippingAddress,
            TotalAmount = input.TotalAmount
        };

        var createdOrder = await _orderService.AddAsync(_orderService.MapDtoToOrder(order));

        // 2. Получаем все товары пользователя в корзине
        var allItems = await _orderItemService.GetAllAsync();
        var cartItems = allItems
            .Where(oi => oi.UserId == user.Id && oi.OrderId == null)
            .ToList();

        // 3. Обновляем каждый товар: привязываем к заказу
        foreach (var item in cartItems)
        {
            item.OrderId = createdOrder.Id;

            var product = await _productService.GetByIdAsync(item.ProductId);
            if (product != null)
            {
                item.SellerId = product.SellerId;       // ✅ Привязываем продавца
            }

            item.UserId = user.Id;                       // ✅ Привязываем покупателя
            item.Status = OrderItemStatus.Waiting;       // ✅ Статус "Ожидание оплаты"

            await _orderItemService.UpdateAsync(item);   // ✅ Сохраняем изменения в БД
        }

        // 4. Ещё раз загружаем товары, теперь уже с назначенным OrderId
        var updatedItems = await _orderItemService.GetAllAsync();
        var itemsForThisOrder = updatedItems
            .Where(oi => oi.OrderId == createdOrder.Id)
            .Select(oi => _orderItemService.MapOrderItemToDto(oi))
            .ToList();

        // 5. Формируем финальный OrderDto
        var orderDto = _orderService.MapOrderToDto(createdOrder);
        orderDto.Items = itemsForThisOrder;

        // 6. Возвращаем клиенту готовый заказ
        return CreatedAtAction(nameof(GetById), new { id = orderDto.Id }, orderDto);
    }
    /// <summary>
    /// Возвращает заказы, в которых есть товары текущего продавца.
    /// </summary>
    /// <returns>Список заказов с товарами продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("seller")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetSellerOrders()
    {
        var user = await _userManager.GetUserAsync(User);

        var allOrders = await _orderService.GetAllAsync();

        var filteredOrders = allOrders
            .Where(o => o.OrderItems.Any(oi => oi.SellerId == user.Id))
            .ToList();

        // Оставляем только свои товары
        foreach (var order in filteredOrders)
        {
            order.OrderItems = order.OrderItems
                .Where(oi => oi.SellerId == user.Id)
                .ToList();
        }

        return Ok(_orderService.MapOrdersToDto(filteredOrders));
    }


    /// <summary>
    /// Возвращает список заказов текущего покупателя.
    /// </summary>
    /// <returns>Список заказов пользователя.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<OrderDto>>> GetMyOrders()
    {
        var user = await _userManager.GetUserAsync(User);
        var all = await _orderService.GetAllAsync();
        var myOrders = all.Where(o => o.BuyerId == user.Id);
        return Ok(_orderService.MapOrdersToDto(myOrders));
    }

    /// <summary>
    /// Возвращает заказ по идентификатору, если он принадлежит текущему покупателю.
    /// </summary>
    /// <param name="id">ID заказа.</param>
    /// <returns>Информация о заказе.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDto>> GetById(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        var order = await _orderService.GetByIdAsync(id);

        if (order == null || order.BuyerId != user.Id)
            return Forbid();

        return Ok(_orderService.MapOrderToDto(order));
    }
}
