using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Api.Controllers;
using System.Security.Principal;
using System.Text.Json;

public class AccountControllerTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<SignInManager<ApplicationUser>> _signInManagerMock;
    private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
    private readonly AccountController _controller;

    public AccountControllerTests()
    {
        var userStore = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(userStore.Object, null, null, null, null, null, null, null, null);

        var contextAccessor = new Mock<IHttpContextAccessor>();
        var userPrincipalFactory = new Mock<IUserClaimsPrincipalFactory<ApplicationUser>>();
        _signInManagerMock = new Mock<SignInManager<ApplicationUser>>(_userManagerMock.Object,
            contextAccessor.Object, userPrincipalFactory.Object, null, null, null, null);

        var roleStore = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStore.Object, null, null, null, null);

        _controller = new AccountController(_userManagerMock.Object, _signInManagerMock.Object, _roleManagerMock.Object);
    }

    [Fact]
    public async Task Register_ReturnsOk_WhenSuccessful()
    {
        var dto = new RegisterDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123!",
            Role = "Buyer"
        };

        _userManagerMock.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), dto.Password))
            .ReturnsAsync(IdentityResult.Success);
        _roleManagerMock.Setup(x => x.RoleExistsAsync(dto.Role))
            .ReturnsAsync(false);
        _roleManagerMock.Setup(x => x.CreateAsync(It.IsAny<IdentityRole>()))
            .ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(x => x.AddToRoleAsync(It.IsAny<ApplicationUser>(), dto.Role))
            .ReturnsAsync(IdentityResult.Success);

        var result = await _controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Пользователь успешно зарегистрирован", okResult.Value);
    }

    [Fact]
    public async Task Login_ReturnsUnauthorized_WhenUserNotFound()
    {
        var dto = new LoginDto { Username = "notfound", Password = "wrong" };
        _userManagerMock.Setup(x => x.FindByNameAsync(dto.Username))
            .ReturnsAsync((ApplicationUser)null!);

        var result = await _controller.Login(dto);

        var unauthorized = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("Неверный логин или пароль", unauthorized.Value);
    }

    [Fact]
    public async Task ChangePassword_ReturnsOk_WhenSuccessful()
    {
        var user = new ApplicationUser { UserName = "user1" };
        var dto = new ChangePasswordDto { CurrentPassword = "old", NewPassword = "new" };

        SetupControllerWithUser(user);
        _userManagerMock.Setup(x => x.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword))
            .ReturnsAsync(IdentityResult.Success);

        var result = await _controller.ChangePassword(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Пароль успешно изменён", okResult.Value);
    }

    [Fact]
    public async Task UpdateProfile_ReturnsOk_WhenSuccessful()
    {
        var user = new ApplicationUser { UserName = "oldname", Email = "old@email.com" };
        var dto = new UpdateUserDto { UserName = "newname", Email = "new@email.com" };

        SetupControllerWithUser(user);
        _userManagerMock.Setup(x => x.UpdateAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(IdentityResult.Success);

        var result = await _controller.UpdateProfile(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Профиль обновлён", okResult.Value);
    }

    

    [Fact]
    public async Task GetCurrentUser_ReturnsUserInfo_WhenAuthenticated()
    {
        var user = new ApplicationUser
        {
            Id = "1",
            UserName = "testuser",
            Email = "email@example.com",
            Role = "Buyer",
            RegistrationDate = DateTime.UtcNow
        };

        SetupControllerWithUser(user);
        _userManagerMock.Setup(x => x.GetUserAsync(It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(user);

        var result = await _controller.GetCurrentUser();
        var okResult = Assert.IsType<OkObjectResult>(result);

        var json = JsonSerializer.Serialize(okResult.Value);
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        Assert.Equal(user.UserName, root.GetProperty("UserName").GetString());
        Assert.Equal(user.Email, root.GetProperty("Email").GetString());
        Assert.Equal(user.Role, root.GetProperty("Role").GetString());
    }



    private void SetupControllerWithUser(ApplicationUser user)
    {
        var identity = new ClaimsIdentity(new Claim[] { new Claim(ClaimTypes.Name, user.UserName) }, "mock");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };

        _userManagerMock.Setup(x => x.GetUserAsync(claimsPrincipal)).ReturnsAsync(user);
    }
}
