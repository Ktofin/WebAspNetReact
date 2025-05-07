namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
public class ProductService : IProductService
    {
        private readonly IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public async Task<Product> GetByIdAsync(int id)
        {
            return await _productRepository.GetByIdAsync(id);
        }

        public async Task<Product> AddAsync(Product product)
        {
            return await _productRepository.AddAsync(product);
        }

        public async Task<Product> UpdateAsync(Product product)
        {
            return await _productRepository.UpdateAsync(product);
        }

        public async Task DeleteAsync(int id)
        {
            await _productRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _productRepository.GetAllAsync();
        }

        public ProductDto MapProductToDto(Product product)
        {
            if (product == null) return null;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CategoryId = product.CategoryId,
                SellerId = product.SellerId,
                CreationDate = product.CreationDate,
                IsAvailable = product.IsAvailable,
                ImageData = product.ImageData,
                
                CategoryName = product.Category?.Name,
                SellerUsername = product.Seller?.UserName
            };
        }

        public Product MapDtoToProduct(ProductDto productDto)
        {
            if (productDto == null) return null;

            return new Product
            {
                Id = productDto.Id,
                Name = productDto.Name,
                Description = productDto.Description,
                Price = productDto.Price,
                CategoryId = productDto.CategoryId,
                SellerId = productDto.SellerId,
                CreationDate = productDto.CreationDate,
                IsAvailable = productDto.IsAvailable,
                ImageData = productDto.ImageData
            };
        }

        public IEnumerable<ProductDto> MapProductsToDto(IEnumerable<Product> products)
        {
            if (products == null) return new List<ProductDto>();

            var productDtos = new List<ProductDto>();
            foreach (var product in products)
            {
                productDtos.Add(MapProductToDto(product));
            }
            return productDtos;
        }
        public async Task<IEnumerable<Product>> GetBySellerIdAsync(string sellerId)
        {
            return await _productRepository.GetBySellerIdAsync(sellerId);
        }

    }
