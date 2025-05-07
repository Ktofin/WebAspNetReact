namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class UserCategoryService : IUserCategoryService
    {
        private readonly IUserCategoryRepository _userCategoryRepository;

        public UserCategoryService(IUserCategoryRepository userCategoryRepository)
        {
            _userCategoryRepository = userCategoryRepository;
        }

        public async Task<UserCategory> GetByIdAsync(string userId, int categoryId)
        {
            return await _userCategoryRepository.GetByIdAsync(userId, categoryId);
        }

        public async Task<UserCategory> AddAsync(UserCategory userCategory)
        {
            return await _userCategoryRepository.AddAsync(userCategory);
        }

        public async Task<UserCategory> UpdateAsync(UserCategory userCategory)
        {
            return await _userCategoryRepository.UpdateAsync(userCategory);
        }

        public async Task DeleteAsync(string userId, int categoryId)
        {
            await _userCategoryRepository.DeleteAsync(userId, categoryId);
        }

        public async Task<IEnumerable<UserCategory>> GetAllAsync()
        {
            return await _userCategoryRepository.GetAllAsync();
        }

        public UserCategoryDto MapUserCategoryToDto(UserCategory userCategory)
        {
            if (userCategory == null) return null;

            return new UserCategoryDto
            {
                UserId = userCategory.UserId,
                CategoryId = userCategory.CategoryId
            };
        }

        public UserCategory MapDtoToUserCategory(UserCategoryDto userCategoryDto)
        {
            if (userCategoryDto == null) return null;

            return new UserCategory
            {
                UserId = userCategoryDto.UserId,
                CategoryId = userCategoryDto.CategoryId
            };
        }

        public IEnumerable<UserCategoryDto> MapUserCategoriesToDto(IEnumerable<UserCategory> userCategories)
        {
            if (userCategories == null) return new List<UserCategoryDto>();

            var userCategoryDtos = new List<UserCategoryDto>();
            foreach (var userCategory in userCategories)
            {
                userCategoryDtos.Add(MapUserCategoryToDto(userCategory));
            }
            return userCategoryDtos;
        }
    }