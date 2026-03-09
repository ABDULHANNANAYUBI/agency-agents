using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HabitTracker.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace HabitTracker.API.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key is not configured");
        var issuer = _configuration["Jwt:Issuer"] ?? "HabitTracker.API";
        var audience = _configuration["Jwt:Audience"] ?? "HabitTracker.Client";
        var expiryDays = int.TryParse(_configuration["Jwt:ExpiryDays"], out var days) ? days : 7;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                ClaimValueTypes.Integer64),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(expiryDays),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public Guid? GetUserIdFromToken(string token)
    {
        try
        {
            var key = _configuration["Jwt:Key"]
                ?? throw new InvalidOperationException("JWT Key is not configured");
            var issuer = _configuration["Jwt:Issuer"] ?? "HabitTracker.API";
            var audience = _configuration["Jwt:Audience"] ?? "HabitTracker.Client";

            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            var idClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (idClaim != null && Guid.TryParse(idClaim, out var userId))
                return userId;

            return null;
        }
        catch
        {
            return null;
        }
    }
}
