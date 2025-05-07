using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Domain.Entities;

namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для управления позициями заказов (товарами в корзине, статусами).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class OrderItemController : ControllerBase
{
    private readonly OrderItemService _orderItemService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ProductService _productService;
    private readonly OrderService _orderService;


    public OrderItemController(
        OrderItemService orderItemService,
        ProductService productService, OrderService orderService, // 👈 добавь сюда
        UserManager<ApplicationUser> userManager)
    {
        _orderItemService = orderItemService;
        _productService = productService; // 👈 сохранить в поле
        _userManager = userManager;
        _orderService = orderService;
    }


    /// <summary>
    /// Получает товары в корзине текущего покупателя.
    /// </summary>
    /// <returns>Список позиций заказа без привязки к заказу.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpGet("cart")]
    public async Task<ActionResult<IEnumerable<OrderItemDto>>> GetCart()
    {
        var user = await _userManager.GetUserAsync(User);
        var all = await _orderItemService.GetAllAsync();

        var cart = all
            .Where(oi => oi.OrderId == null && oi.UserId == user.Id)
            .ToList();

        return Ok(_orderItemService.MapOrderItemsToDto(cart));
    }

    /// <summary>
    /// Добавляет товар в корзину текущего пользователя.
    /// </summary>
    /// <param name="dto">Данные о товаре (ID товара, количество и т. д.).</param>
    /// <returns>Добавленная позиция заказа.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpPost("cart")]
    public async Task<ActionResult<OrderItemDto>> AddToCart(OrderItemDto dto)
    {
        var user = await _userManager.GetUserAsync(User);
        dto.OrderId = null;
        dto.UserId = user.Id;

        var product = await _productService.GetByIdAsync(dto.ProductId);
        if (product == null)
            return BadRequest("Товар не найден");
        
        

        // 🔄 Автоматическое заполнение важных данных
        dto.SellerId = product.SellerId;
        dto.ProductName = product.Name;
        dto.ProductImage = product.ImageData;
        dto.Price = product.Price;
        dto.OrderItemStatus = OrderItemStatus.Waiting.ToString();
        Console.WriteLine($"📦 Добавление в корзину:");
        Console.WriteLine($"🆔 ProductId: {dto.ProductId}");
        Console.WriteLine($"🧾 Name: {dto.ProductName}");
        Console.WriteLine($"💵 Price: {dto.Price}");
        Console.WriteLine($"📸 Image Length: {dto.ProductImage?.Length}");

        var entity = _orderItemService.MapDtoToOrderItem(dto);
        Console.WriteLine($"🎯 Готовим к сохранению: Name = {entity.ProductName}, Image Length = {entity.ProductImage?.Length}");
        Console.WriteLine($"📥 Перед сохранением: UserId={entity.UserId}, SellerId={entity.SellerId}, Status={entity.Status}");
        var created = await _orderItemService.AddAsync(entity);

        return CreatedAtAction(nameof(GetCart), new { }, _orderItemService.MapOrderItemToDto(created));
    }
    

    /// <summary>
    /// Удаляет товар из корзины текущего пользователя.
    /// </summary>
    /// <param name="id">ID позиции заказа.</param>
    /// <returns>Результат удаления.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpDelete("cart/{id}")]
    public async Task<IActionResult> RemoveFromCart(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        var item = await _orderItemService.GetByIdAsync(id);

        if (item == null || item.UserId != user.Id || item.OrderId != null)
            return Forbid();

        await _orderItemService.DeleteAsync(id);
        return NoContent();
    }
    
    /// <summary>
    /// Обновляет статус позиции заказа (только продавец).
    /// Также автоматически пересчитывает статус всего заказа.
    /// </summary>
    /// <param name="id">ID позиции заказа.</param>
    /// <param name="newStatus">Новый статус (в формате строки).</param>
    /// <returns>Результат обновления.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var user = await _userManager.GetUserAsync(User);
        var item = await _orderItemService.GetByIdAsync(id);

        if (item == null || item.SellerId != user.Id)
            return Forbid();

        // Парсим строку в OrderItemStatus (новый enum)
        if (!Enum.TryParse<OrderItemStatus>(newStatus, ignoreCase: true, out var parsedStatus))
            return BadRequest("Неверный статус");

        item.Status = parsedStatus;
        await _orderItemService.UpdateAsync(item);

        // 👇 Обновляем статус всего заказа
        if (item.OrderId != null)
        {
            await _orderService.RecalculateOrderStatusAsync(item.OrderId.Value);
        }

        return Ok();
    }


    
}
