using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Application.DTO;
using Microsoft.AspNetCore.Identity;
namespace OnlineMarketplace.Api.Controllers;
/// <summary>
/// Контроллер для управления аккаунтами пользователей: регистрация, вход, выход, обновление профиля.
/// </summary>
[ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        /// <summary>
        /// Доступно только для покупателей.
        /// </summary>
        [Authorize(Roles = "Buyer")]
        [HttpGet("only-buyers")]
        public IActionResult OnlyBuyersCanSeeThis()
        {
            return Ok("Привет, покупатель!");
        }
        /// <summary>
        /// Доступно только для продавцов.
        /// </summary>
        [Authorize(Roles = "Seller")]
        [HttpGet("only-sellers")]
        public IActionResult OnlySellersCanSeeThis()
        {
            return Ok("Привет, продавец!");
        }
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
        }
        /// <summary>
        /// Регистрирует нового пользователя.
        /// </summary>
        /// <param name="model">Данные для регистрации (логин, пароль, email, роль).</param>
        /// <returns>Результат регистрации.</returns>
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            var user = new ApplicationUser
            {
                UserName = model.Username,
                Email = model.Email,
                RegistrationDate = DateTime.UtcNow,
                Role = model.Role
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync(model.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(model.Role));
            }

            await _userManager.AddToRoleAsync(user, model.Role);

            return Ok("Пользователь успешно зарегистрирован");
        }
        /// <summary>
        /// Выполняет вход пользователя.
        /// </summary>
        /// <param name="model">Имя пользователя и пароль.</param>
        /// <returns>Результат входа.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.Username);
            if (user == null)
                return Unauthorized("Неверный логин или пароль");

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: false, lockoutOnFailure: false);

            if (!result.Succeeded)
                return Unauthorized("Неверный логин или пароль");

            return Ok("Успешный вход");
        }
        /// <summary>
        /// Возвращает информацию о текущем пользователе.
        /// </summary>
        /// <returns>Профиль пользователя.</returns>
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.PasswordHash,
                user.Email,
                user.Role,
                user.RegistrationDate
            });
        }
        /// <summary>
        /// Выполняет выход пользователя.
        /// </summary>
        /// <returns>Результат выхода.</returns>
        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok("Вы вышли из системы");
        }
        /// <summary>
        /// Обновляет профиль текущего пользователя.
        /// </summary>
        /// <param name="dto">Новые данные пользователя (имя, email).</param>
        /// <returns>Результат обновления.</returns>
        [Authorize]
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateUserDto dto)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            user.UserName = dto.UserName ?? user.UserName;
            user.Email = dto.Email ?? user.Email;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Профиль обновлён");
        }
        /// <summary>
        /// Изменяет пароль текущего пользователя.
        /// </summary>
        /// <param name="model">Текущий и новый пароли.</param>
        /// <returns>Результат смены пароля.</returns>
        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDto model)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Unauthorized();

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok("Пароль успешно изменён");
        }


    }