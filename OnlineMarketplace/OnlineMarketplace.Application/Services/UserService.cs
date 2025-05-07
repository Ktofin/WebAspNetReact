namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<User> GetByIdAsync(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        public async Task<User> AddAsync(User user)
        {
            return await _userRepository.AddAsync(user);
        }

        public async Task<User> UpdateAsync(User user)
        {
            return await _userRepository.UpdateAsync(user);
        }

        public async Task DeleteAsync(int id)
        {
            await _userRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        // Методы преобразования DTO в сущности и обратно
        public UserDto MapUserToDto(User user)
        {
            if (user == null) return null;

            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Password = user.Password,
                Role = user.Role,
                RegistrationDate = user.RegistrationDate
            };
        }

        public User MapDtoToUser(UserDto userDto)
        {
            if (userDto == null) return null;

            return new User
            {
                Id = userDto.Id,
                Username = userDto.Username,
                Email = userDto.Email,
                Password = userDto.Password,
                Role = userDto.Role,
                RegistrationDate = userDto.RegistrationDate
            };
        }

        public IEnumerable<UserDto> MapUsersToDto(IEnumerable<User> users)
        {
            if (users == null) return new List<UserDto>();

            var userDtos = new List<UserDto>();
            foreach (var user in users)
            {
                userDtos.Add(MapUserToDto(user));
            }
            return userDtos;
        }
}