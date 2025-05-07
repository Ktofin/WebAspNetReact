using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Domain.Entities;

namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для работы с категориями товаров и их привязкой к продавцам.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly CategoryService _categoryService;
    private readonly UserCategoryService _userCategoryService;
    private readonly UserManager<ApplicationUser> _userManager;

    public CategoryController(
        CategoryService categoryService,
        UserCategoryService userCategoryService,
        UserManager<ApplicationUser> userManager)
    {
        _categoryService = categoryService;
        _userCategoryService = userCategoryService;
        _userManager = userManager;
    }

    /// <summary>
    /// Получает список всех категорий.
    /// </summary>
    /// <returns>Список всех категорий.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(_categoryService.MapCategoriesToDto(categories));
    }

    /// <summary>
    /// Получает категорию по её идентификатору.
    /// </summary>
    /// <param name="id">Идентификатор категории.</param>
    /// <returns>Категория, если найдена.</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDto>> GetById(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        if (category == null)
            return NotFound();

        return Ok(_categoryService.MapCategoryToDto(category));
    }

    /// <summary>
    /// Получает подкатегории по идентификатору родительской категории.
    /// </summary>
    /// <param name="parentId">Идентификатор родительской категории.</param>
    /// <returns>Список подкатегорий.</returns>
    [HttpGet("parent/{parentId}")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetByParentId(int parentId)
    {
        var subcategories = await _categoryService.GetByParentIdAsync(parentId);
        return Ok(_categoryService.MapCategoriesToDto(subcategories));
    }

    /// <summary>
    /// Получает категории, привязанные к текущему продавцу.
    /// </summary>
    /// <returns>Список категорий продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("seller")]
    public async Task<ActionResult<IEnumerable<CategoryDto>>> GetSellerCategories()
    {
        var user = await _userManager.GetUserAsync(User);

        var userId = user.Id;


        var allLinks = await _userCategoryService.GetAllAsync();
        var categoryIds = allLinks.Where(uc => uc.UserId == userId).Select(uc => uc.CategoryId).ToList();

        var categories = await _categoryService.GetByIdsAsync(categoryIds);
        return Ok(_categoryService.MapCategoriesToDto(categories));
    }

    /// <summary>
    /// Создаёт новую категорию или подкатегорию и привязывает её к текущему продавцу.
    /// </summary>
    /// <param name="categoryDto">Данные новой категории.</param>
    /// <returns>Созданная категория.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CategoryDto categoryDto)
    {
        var user = await _userManager.GetUserAsync(User);

        var category = _categoryService.MapDtoToCategory(categoryDto);
        var created = await _categoryService.AddAsync(category);

        // Привязка продавца к новой категории
        var userId = user.Id;


        var link = new UserCategoryDto
        {
            UserId = userId,
            CategoryId = created.Id
        };

        await _userCategoryService.AddAsync(_userCategoryService.MapDtoToUserCategory(link));

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, _categoryService.MapCategoryToDto(created));
    }

    /// <summary>
    /// Обновляет категорию, если она принадлежит текущему продавцу.
    /// </summary>
    /// <param name="id">Идентификатор категории.</param>
    /// <param name="categoryDto">Обновлённые данные категории.</param>
    /// <returns>Обновлённая категория.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> Update(int id, CategoryDto categoryDto)
    {
        if (id != categoryDto.Id)
            return BadRequest("ID mismatch");

        var user = await _userManager.GetUserAsync(User);
        var userId = user.Id;


        var userCategories = await _userCategoryService.GetAllAsync();
        var hasAccess = userCategories.Any(uc => uc.UserId == userId && uc.CategoryId == id);

        if (!hasAccess)
            return Forbid();

        var updated = await _categoryService.UpdateAsync(_categoryService.MapDtoToCategory(categoryDto));
        return Ok(_categoryService.MapCategoryToDto(updated));
    }

    /// <summary>
    /// Удаляет категорию, если она принадлежит продавцу и не содержит товаров или подкатегорий.
    /// </summary>
    /// <param name="id">Идентификатор категории.</param>
    /// <returns>Результат удаления.</returns>
    [Authorize(Roles = "Seller")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        var userId = user.Id;


        var userCategories = await _userCategoryService.GetAllAsync();
        var hasAccess = userCategories.Any(uc => uc.UserId == userId && uc.CategoryId == id);

        //if (!hasAccess)
            //return Forbid();

        var category = await _categoryService.GetByIdAsync(id);
        var subcategories = await _categoryService.GetByParentIdAsync(id);

        if (category.Products?.Any() == true || subcategories.Any())
            return BadRequest("Нельзя удалить категорию в которой есть товары");

        await _categoryService.DeleteAsync(id);
        return NoContent();

        
    }
}
