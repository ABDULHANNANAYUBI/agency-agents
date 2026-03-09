using HabitTracker.API.DTOs.Auth;

namespace HabitTracker.API.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<UserDto?> GetMeAsync(Guid userId);
}
