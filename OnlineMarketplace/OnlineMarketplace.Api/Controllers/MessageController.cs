namespace OnlineMarketplace.Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Application.Services;
using Microsoft.AspNetCore.Identity;

/// <summary>
/// Контроллер для управления сообщениями между пользователями (покупателями и продавцами).
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MessageController : ControllerBase
{
    private readonly MessageService _messageService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IOrderService _orderService;
    private readonly IProductService _productService;

    public MessageController(MessageService messageService, UserManager<ApplicationUser> userManager, IOrderService orderService, IProductService productService)
    {
        _messageService = messageService;
        _userManager = userManager;
        _orderService = orderService;
        _productService = productService;
    }

    /// <summary>
    /// Получает все сообщения между текущим пользователем и указанным собеседником.
    /// Можно фильтровать по товару.
    /// </summary>
    /// <param name="receiverId">ID другого пользователя (собеседника).</param>
    /// <param name="productId">Необязательный ID товара для фильтрации.</param>
    /// <returns>Список сообщений в переписке.</returns>
    [HttpGet("with/{receiverId}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(
        string receiverId,
        [FromQuery] int? productId = null)
    {
        var user = await _userManager.GetUserAsync(User);
        var allMessages = await _messageService.GetAllAsync();

        var filtered = allMessages
            .Where(m =>
                (m.SenderId == user.Id && m.ReceiverId == receiverId) ||
                (m.SenderId == receiverId && m.ReceiverId == user.Id))
            .Where(m => !productId.HasValue || m.ProductId == productId)
            .Select(m => _messageService.MapMessageToDto(m));

        return Ok(filtered);
    }
    
    /// <summary>
    /// Получает список переписок продавца с покупателями по каждому товару.
    /// </summary>
    /// <returns>Список тем (переписок) с последними сообщениями.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("threads")]
    public async Task<ActionResult<IEnumerable<object>>> GetSellerThreads()
    {
        var seller = await _userManager.GetUserAsync(User);
        var allMessages = await _messageService.GetAllAsync();

        var productDict = (await _productService.GetAllAsync())
            .Where(p => p.SellerId == seller.Id)
            .ToDictionary(p => p.Id);

        // Группируем по покупателю и товару
        var threads = allMessages
            .Where(m => m.ReceiverId == seller.Id || m.SenderId == seller.Id)
            .Where(m => m.ProductId.HasValue && productDict.ContainsKey(m.ProductId.Value))
            .GroupBy(m => new { m.ProductId, BuyerId = m.SenderId == seller.Id ? m.ReceiverId : m.SenderId })
            .Select(g => new
            {
                productId = g.Key.ProductId,
                productName = productDict[g.Key.ProductId!.Value].Name,
                buyerId = g.Key.BuyerId,
                lastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                lastDate = g.Max(m => m.SentAt)
            })
            .OrderByDescending(t => t.lastDate);

        return Ok(threads);
    }

    /// <summary>
    /// Получает чат между продавцом и покупателем по конкретному товару.
    /// </summary>
    /// <param name="buyerId">ID покупателя.</param>
    /// <param name="sellerId">ID продавца.</param>
    /// <param name="productId">ID товара.</param>
    /// <returns>Список сообщений.</returns>
    [HttpGet("chat")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetChat(
        [FromQuery] string buyerId,
        [FromQuery] string sellerId,
        [FromQuery] int productId)
    {
        var user = await _userManager.GetUserAsync(User);
        var allMessages = await _messageService.GetAllAsync();

        var filtered = allMessages
            .Where(m =>
                m.ProductId == productId &&
                (
                    (m.SenderId == buyerId && m.ReceiverId == sellerId) ||
                    (m.SenderId == sellerId && m.ReceiverId == buyerId)
                ))
            .Select(m => _messageService.MapMessageToDto(m));

        return Ok(filtered);
    }


    /// <summary>
    /// Отправляет новое сообщение от текущего пользователя.
    /// </summary>
    /// <param name="dto">Объект сообщения (получатель, содержимое, товар).</param>
    /// <returns>Отправленное сообщение.</returns>
    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage([FromBody] MessageDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        var message = new Message
        {
            SenderId = user.Id,
            ReceiverId = dto.ReceiverId,
            Content = dto.Content,
            SentAt = DateTime.UtcNow,
            IsRead = false,
            ProductId = dto.ProductId
        };

        var created = await _messageService.AddAsync(message);
        return Ok(_messageService.MapMessageToDto(created));
    }
}