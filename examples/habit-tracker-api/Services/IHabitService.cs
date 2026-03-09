using HabitTracker.API.DTOs.Habits;

namespace HabitTracker.API.Services;

public interface IHabitService
{
    Task<List<HabitResponse>> GetAllAsync(Guid userId);
    Task<HabitResponse?> GetByIdAsync(Guid userId, Guid habitId);
    Task<HabitResponse> CreateAsync(Guid userId, CreateHabitRequest request);
    Task<HabitResponse?> UpdateAsync(Guid userId, Guid habitId, UpdateHabitRequest request);
    Task<bool> DeleteAsync(Guid userId, Guid habitId);
    Task<HabitResponse?> ToggleArchiveAsync(Guid userId, Guid habitId);
    Task<HabitResponse?> ToggleCompletionAsync(Guid userId, Guid habitId, string date);
}
