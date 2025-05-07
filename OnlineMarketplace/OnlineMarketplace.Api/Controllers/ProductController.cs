using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;


namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для управления товарами: создание, редактирование, просмотр и удаление.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ProductService _productService;

    public ProductController(ProductService productService, UserManager<ApplicationUser> userManager)
    {
        _productService = productService;
        _userManager = userManager;
    }
    /// <summary>
    /// Получает список всех товаров.
    /// </summary>
    /// <returns>Список товаров.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        var products = await _productService.GetAllAsync();
        return Ok(_productService.MapProductsToDto(products));
    }
    /// <summary>
    /// Получает товар по его идентификатору.
    /// </summary>
    /// <param name="id">ID товара.</param>
    /// <returns>Информация о товаре.</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        return Ok(_productService.MapProductToDto(product));
    }
    /// <summary>
    /// Создаёт новый товар от имени текущего продавца.
    /// </summary>
    /// <param name="productDto">Информация о товаре.</param>
    /// <returns>Созданный товар.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(ProductDto productDto)
    {
        var user = await _userManager.GetUserAsync(User);
        productDto.SellerId = user.Id;

        var product = _productService.MapDtoToProduct(productDto);
        var created = await _productService.AddAsync(product);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, _productService.MapProductToDto(created));
    }
    /// <summary>
    /// Обновляет товар, если он принадлежит текущему продавцу.
    /// </summary>
    /// <param name="id">ID товара.</param>
    /// <param name="productDto">Обновлённые данные товара.</param>
    /// <returns>Обновлённый товар.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(int id, ProductDto productDto)
    {
        if (id != productDto.Id)
            return BadRequest("ID mismatch");

        var existing = await _productService.GetByIdAsync(id);
        var user = await _userManager.GetUserAsync(User);

        if (existing == null || existing.SellerId != user.Id)
            return Forbid();

        productDto.SellerId = user.Id;

        var updated = await _productService.UpdateAsync(_productService.MapDtoToProduct(productDto));
        return Ok(_productService.MapProductToDto(updated));
    }
    
    /// <summary>
    /// Удаляет товар, если он принадлежит текущему продавцу.
    /// </summary>
    /// <param name="id">ID товара.</param>
    /// <returns>Результат удаления.</returns>
    [Authorize(Roles = "Seller")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _productService.GetByIdAsync(id);
        var user = await _userManager.GetUserAsync(User);

        if (existing == null || existing.SellerId != user.Id)
            return Forbid();

        await _productService.DeleteAsync(id);
        return NoContent();
    }
    /// <summary>
    /// Получает список товаров, созданных текущим продавцом.
    /// </summary>
    /// <returns>Список товаров продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetMyProducts()
    {
        var user = await _userManager.GetUserAsync(User);
        var products = await _productService.GetBySellerIdAsync(user.Id);
        return Ok(_productService.MapProductsToDto(products));
    }
}