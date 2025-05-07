namespace OnlineMarketplace.Api.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using OnlineMarketplace.Domain;
using OnlineMarketplace.Application.Services;
/// <summary>
/// Контроллер для работы с отзывами: добавление, просмотр, ответы продавца.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly ReviewService _reviewService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IOrderService _orderService;
    private readonly IProductService _productService;

    public ReviewController(ReviewService reviewService, UserManager<ApplicationUser> userManager, IOrderService orderService, IProductService productService)
    {
        _reviewService = reviewService;
        _userManager = userManager;
        _orderService = orderService;
        _productService = productService;
    }

    /// <summary>
    /// Получает список всех отзывов.
    /// </summary>
    /// <returns>Список отзывов.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetAll()
    {
        var reviews = await _reviewService.GetAllAsync();
        return Ok(reviews.Select(r => _reviewService.MapReviewToDto(r)));
    }

    /// <summary>
    /// Получает отзывы по определённому товару.
    /// </summary>
    /// <param name="productId">ID товара.</param>
    /// <returns>Список отзывов.</returns>
    [HttpGet("product/{productId}")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetByProduct(int productId)
    {
        var reviews = await _reviewService.GetAllAsync();
        var filtered = reviews
            .Where(r => r.ProductId == productId)
            .Select(r => _reviewService.MapReviewToDto(r));
        return Ok(filtered);
    }
    
    /// <summary>
    /// Проверяет, может ли пользователь оставить отзыв о товаре.
    /// </summary>
    /// <param name="productId">ID товара.</param>
    /// <returns>True, если пользователь ранее заказывал этот товар и заказ завершён или отменён.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpGet("can-review/{productId}")]
    public async Task<ActionResult<bool>> CanLeaveReview(int productId)
    {
        var user = await _userManager.GetUserAsync(User);
        var orders = await _orderService.GetAllAsync();

        var hasBought = orders
            .Where(o => o.BuyerId == user.Id)
            .Any(o => o.OrderItems.Any(i => i.ProductId == productId &&
                                            (i.Status == OrderItemStatus. Canceled || i.Status == OrderItemStatus.Completed)));

        return Ok(hasBought);
    }

    /// <summary>
    /// Добавляет новый отзыв к товару от имени покупателя.
    /// </summary>
    /// <param name="dto">Информация об отзыве.</param>
    /// <returns>Созданный отзыв.</returns>
    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> AddReview([FromBody] ReviewDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        var review = new Review
        {
            ProductId = dto.ProductId,
            Text = dto.Text,
            Rating = dto.Rating,
            BuyerId = user.Id, // 👈 сюда
            CreatedAt = DateTime.UtcNow
        };

        var created = await _reviewService.AddAsync(review);
        return Ok(_reviewService.MapReviewToDto(created));
    }
    
    /// <summary>
    /// Получает все отзывы на товары текущего продавца.
    /// </summary>
    /// <returns>Список отзывов на товары продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("seller")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetSellerReviews()
    {
        var user = await _userManager.GetUserAsync(User);
        var allReviews = await _reviewService.GetAllAsync();

        // Получаем все товары продавца (по Product.SellerId)
        var products = await _productService.GetAllAsync();
        var sellerProductIds = products
            .Where(p => p.SellerId == user.Id)
            .Select(p => p.Id)
            .ToHashSet();

        var filtered = allReviews
            .Where(r => sellerProductIds.Contains(r.ProductId))
            .Select(r => _reviewService.MapReviewToDto(r));

        return Ok(filtered);
    }


    /// <summary>
    /// Добавляет ответ продавца к отзыву.
    /// </summary>
    /// <param name="id">ID отзыва.</param>
    /// <param name="reply">Текст ответа.</param>
    /// <returns>Обновлённый отзыв с ответом продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPut("{id}/reply")]
    public async Task<IActionResult> Reply(int id, [FromBody] string reply)
    {
        var review = await _reviewService.GetByIdAsync(id);
        if (review == null) return NotFound();

        review.SellerReply = reply;
        await _reviewService.UpdateAsync(review);

        return Ok(_reviewService.MapReviewToDto(review));
    }
}