namespace OnlineMarketplace.Application.Services;

using OnlineMarketplace.Domain.Entities;
using OnlineMarketplace.Domain.Interfaces;
using OnlineMarketplace.Application.DTO;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _messageRepository;

    public MessageService(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public async Task<IEnumerable<Message>> GetAllAsync()
        => await _messageRepository.GetAllAsync();

    public async Task<Message?> GetByIdAsync(int id)
        => await _messageRepository.GetByIdAsync(id);

    public async Task<Message> AddAsync(Message message)
        => await _messageRepository.AddAsync(message);

    public async Task<Message> UpdateAsync(Message message)
        => await _messageRepository.UpdateAsync(message);

    public async Task DeleteAsync(int id)
        => await _messageRepository.DeleteAsync(id);

    public MessageDto MapMessageToDto(Message message)
    {
        if (message == null) return null;

        return new MessageDto
        {
            Id = message.Id,
            SenderId = message.SenderId,
            ReceiverId = message.ReceiverId,
            Content = message.Content,
            SentAt = message.SentAt,
            IsRead = message.IsRead,
            ProductId = message.ProductId,
            ProductName = message.Product?.Name
        };
    }

    public Message MapDtoToMessage(MessageDto dto)
    {
        if (dto == null) return null;

        return new Message
        {
            Id = dto.Id,
            SenderId = dto.SenderId,
            ReceiverId = dto.ReceiverId,
            Content = dto.Content,
            SentAt = dto.SentAt,
            IsRead = dto.IsRead,
            ProductId = dto.ProductId
        };
    }

    public IEnumerable<MessageDto> MapMessagesToDto(IEnumerable<Message> messages)
        => messages.Select(MapMessageToDto).ToList();
}