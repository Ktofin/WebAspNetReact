namespace OnlineMarketplace.Domain.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public string BuyerId { get; set; }
        
        public ApplicationUser Buyer { get; set; }
        public DateTime OrderDate { get; set; }
        public OrderStatus OrderStatus { get; set; }
        public string ShippingAddress { get; set; }
        public decimal TotalAmount { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; }
    }
}