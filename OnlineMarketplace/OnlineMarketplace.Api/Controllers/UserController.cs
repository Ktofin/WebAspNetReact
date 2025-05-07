using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Application.Services;
using OnlineMarketplace.Domain.Entities;
/// <summary>
/// Контроллер для управления данными текущего пользователя (просмотр, обновление, удаление).
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly UserService _userService;
    private readonly UserManager<ApplicationUser> _userManager;

    public UserController(UserService userService, UserManager<ApplicationUser> userManager)
    {
        _userService = userService;
        _userManager = userManager;
    }

    /// <summary>
    /// Получает информацию о текущем пользователе по ID.
    /// Только сам пользователь может получить свои данные.
    /// </summary>
    /// <param name="id">ID пользователя.</param>
    /// <returns>Данные пользователя.</returns>
    [Authorize]
    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        var dto = await _userService.GetByIdAsync(id);

        if (dto == null || dto.Id.ToString() != user.Id)
            return Forbid();

        return Ok(_userService.MapUserToDto(dto));
    }

    /// <summary>
    /// Обновляет профиль текущего пользователя.
    /// </summary>
    /// <param name="id">ID пользователя.</param>
    /// <param name="userDto">Обновлённые данные пользователя.</param>
    /// <returns>Обновлённый профиль.</returns>
    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> Update(int id, UserDto userDto)
    {
        var user = await _userManager.GetUserAsync(User);

        if (id != userDto.Id || userDto.Id.ToString() != user.Id)
            return Forbid();

        var userEntity = _userService.MapDtoToUser(userDto);
        var updated = await _userService.UpdateAsync(userEntity);
        return Ok(_userService.MapUserToDto(updated));
    }

    /// <summary>
    /// Удаляет профиль текущего пользователя.
    /// </summary>
    /// <param name="id">ID пользователя.</param>
    /// <returns>Результат удаления.</returns>
    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var user = await _userManager.GetUserAsync(User);
        if (id.ToString() != user.Id)
            return Forbid();

        await _userService.DeleteAsync(id);
        await _userManager.DeleteAsync(user); // чтобы убрать из Identity тоже, если нужно

        return Ok("Профиль успешно удалён");
    }
}