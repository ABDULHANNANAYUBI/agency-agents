using HabitTracker.API.Data;
using HabitTracker.API.DTOs.Auth;
using HabitTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwtService;

    public AuthService(AppDbContext db, IJwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email == emailLower);
        if (exists)
            throw new InvalidOperationException("Email is already registered");

        var user = new User
        {
            Name = request.Name.Trim(),
            Email = emailLower,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 11),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id.ToString(),
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var emailLower = request.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == emailLower);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        var token = _jwtService.GenerateToken(user);
        return new AuthResponse
        {
            Token = token,
            UserId = user.Id.ToString(),
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
        };
    }

    public async Task<UserDto?> GetMeAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return null;

        return new UserDto
        {
            Id = user.Id.ToString(),
            Name = user.Name,
            Email = user.Email,
            CreatedAt = user.CreatedAt,
        };
    }
}
