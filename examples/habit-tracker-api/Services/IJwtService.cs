using HabitTracker.API.Models;

namespace HabitTracker.API.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    Guid? GetUserIdFromToken(string token);
}
