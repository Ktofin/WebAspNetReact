namespace OnlineMarketplace.Application.Services;
using OnlineMarketplace.Application.DTO;
using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(IReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    public async Task<IEnumerable<Review>> GetAllAsync()
        => await _reviewRepository.GetAllAsync();

    public async Task<Review?> GetByIdAsync(int id)
        => await _reviewRepository.GetByIdAsync(id);

    public async Task<Review> AddAsync(Review review)
        => await _reviewRepository.AddAsync(review);

    public async Task<Review> UpdateAsync(Review review)
        => await _reviewRepository.UpdateAsync(review);

    public async Task DeleteAsync(int id)
        => await _reviewRepository.DeleteAsync(id);

    public ReviewDto MapReviewToDto(Review review)
    {
        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.BuyerId,
            Text = review.Text,
            Rating = review.Rating,
            CreatedAt = review.CreatedAt,
            Reply = review.SellerReply,
            
        };
    }

    public Review MapDtoToReview(ReviewDto dto)
    {
        return new Review
        {
            Id = dto.Id,
            ProductId = dto.ProductId,
            BuyerId = dto.UserId,
            Text = dto.Text,
            Rating = dto.Rating,
            CreatedAt = dto.CreatedAt,
            SellerReply = dto.Reply
        };
    }

    public IEnumerable<ReviewDto> MapReviewsToDto(IEnumerable<Review> reviews)
        => reviews.Select(MapReviewToDto).ToList();
}