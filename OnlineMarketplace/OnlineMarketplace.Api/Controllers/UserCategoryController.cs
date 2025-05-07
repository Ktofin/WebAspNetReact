using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Domain.Entities;

namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для управления связями между пользователями и категориями (привязка продавцов к категориям).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserCategoryController : ControllerBase
{
    private readonly UserCategoryService _userCategoryService;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserCategoryController(UserCategoryService userCategoryService, UserManager<ApplicationUser> userManager)
    {
        _userCategoryService = userCategoryService;
        _userManager = userManager;
    }
    /// <summary>
    /// Возвращает все связи между пользователями и категориями.
    /// </summary>
    /// <returns>Список всех связей.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserCategoryDto>>> GetAll()
    {
        var items = await _userCategoryService.GetAllAsync();
        return Ok(_userCategoryService.MapUserCategoriesToDto(items));
    }
    /// <summary>
    /// Возвращает категории, к которым привязан текущий продавец.
    /// </summary>
    /// <returns>Список категорий текущего продавца.</returns>
    [Authorize(Roles = "Seller")]
    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<UserCategoryDto>>> GetMyCategories()
    {
        var user = await _userManager.GetUserAsync(User);
        var all = await _userCategoryService.GetAllAsync();
        var mine = all.Where(uc => uc.UserId == user.Id);
        return Ok(_userCategoryService.MapUserCategoriesToDto(mine));
    }
    /// <summary>
    /// Возвращает конкретную связь между пользователем и категорией.
    /// </summary>
    /// <param name="userId">ID пользователя.</param>
    /// <param name="categoryId">ID категории.</param>
    /// <returns>Связь пользователь-категория.</returns>
    [HttpGet("{userId}/{categoryId}")]
    public async Task<ActionResult<UserCategoryDto>> GetById(string userId, int categoryId)
    {
        var item = await _userCategoryService.GetByIdAsync(userId, categoryId);
        if (item == null)
            return NotFound();

        return Ok(_userCategoryService.MapUserCategoryToDto(item));
    }
    /// <summary>
    /// Создаёт новую связь между продавцом и категорией.
    /// </summary>
    /// <param name="dto">Данные связи.</param>
    /// <returns>Созданная связь.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPost]
    public async Task<ActionResult<UserCategoryDto>> Create(UserCategoryDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        if (dto.UserId != user.Id)
            return Forbid();

        var entity = _userCategoryService.MapDtoToUserCategory(dto);
        var created = await _userCategoryService.AddAsync(entity);
        return CreatedAtAction(nameof(GetById), new { userId = created.UserId, categoryId = created.CategoryId }, _userCategoryService.MapUserCategoryToDto(created));
    }
    /// <summary>
    /// Обновляет связь между продавцом и категорией.
    /// </summary>
    /// <param name="userId">ID пользователя.</param>
    /// <param name="categoryId">ID категории.</param>
    /// <param name="dto">Новые данные связи.</param>
    /// <returns>Обновлённая связь.</returns>
    [Authorize(Roles = "Seller")]
    [HttpPut("{userId}/{categoryId}")]
    public async Task<ActionResult<UserCategoryDto>> Update(string userId, int categoryId, UserCategoryDto dto)
    {
        var user = await _userManager.GetUserAsync(User);

        if (userId != user.Id ||
            dto.UserId != user.Id ||
            categoryId != dto.CategoryId)
        {
            return Forbid();
        }

        var entity = _userCategoryService.MapDtoToUserCategory(dto);
        var updated = await _userCategoryService.UpdateAsync(entity);
        return Ok(_userCategoryService.MapUserCategoryToDto(updated));
    }
    /// <summary>
    /// Удаляет связь между продавцом и категорией.
    /// </summary>
    /// <param name="userId">ID пользователя.</param>
    /// <param name="categoryId">ID категории.</param>
    /// <returns>Результат удаления.</returns>
    [Authorize(Roles = "Seller")]
    [HttpDelete("{userId}/{categoryId}")]
    public async Task<IActionResult> Delete(string userId, int categoryId)
    {
        var user = await _userManager.GetUserAsync(User);

        if (userId != user.Id)
            return Forbid();

        await _userCategoryService.DeleteAsync(userId, categoryId);
        return NoContent();
    }
    }