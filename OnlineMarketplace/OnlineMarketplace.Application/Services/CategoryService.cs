namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ProductService _productService;

    public CategoryService(ICategoryRepository categoryRepository, ProductService productService)
    {
        _categoryRepository = categoryRepository;
        _productService = productService;
    }


        public async Task<Category> GetByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public async Task<Category> AddAsync(Category category)
        {
            return await _categoryRepository.AddAsync(category);
        }

        public async Task<Category> UpdateAsync(Category category)
        {
            return await _categoryRepository.UpdateAsync(category);
        }

        public async Task DeleteAsync(int id)
        {
            await _categoryRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _categoryRepository.GetAllAsync();
        }

        public CategoryDto MapCategoryToDto(Category category)
        {
            if (category == null) return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentCategoryId = category.ParentCategoryId,
                Products = category.Products?
                    .Select(p => _productService.MapProductToDto(p))
                    .ToList()
            };
        }

        public Category MapDtoToCategory(CategoryDto categoryDto)
        {
            if (categoryDto == null) return null;

            return new Category
            {
                Id = categoryDto.Id,
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                ParentCategoryId = categoryDto.ParentCategoryId
            };
        }

        public IEnumerable<CategoryDto> MapCategoriesToDto(IEnumerable<Category> categories)
        {
            if (categories == null) return new List<CategoryDto>();

            var categoryDtos = new List<CategoryDto>();
            foreach (var category in categories)
            {
                categoryDtos.Add(MapCategoryToDto(category));
            }
            return categoryDtos;
        }
        
        public async Task<IEnumerable<Category>> GetByParentIdAsync(int parentCategoryId)
        {
            return await _categoryRepository.GetByParentIdAsync(parentCategoryId);
        }
        
        public async Task<IEnumerable<Category>> GetByIdsAsync(IEnumerable<int> ids)
        {
            return await _categoryRepository.GetByIdsAsync(ids);
        }


}