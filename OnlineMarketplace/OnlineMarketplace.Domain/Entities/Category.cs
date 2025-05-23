﻿namespace OnlineMarketplace.Domain.Entities;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public int? ParentCategoryId { get; set; }
    
    public ICollection<Product> Products { get; set; }
}