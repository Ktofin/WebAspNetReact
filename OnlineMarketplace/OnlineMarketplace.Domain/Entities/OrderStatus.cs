namespace OnlineMarketplace.Domain.Entities;

public enum OrderStatus
{
    Pending,
    Confirmed,
    Shipped,
    Delivered,
    Canceled,
    Processing
}