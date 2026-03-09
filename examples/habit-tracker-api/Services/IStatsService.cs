using HabitTracker.API.DTOs.Stats;

namespace HabitTracker.API.Services;

public interface IStatsService
{
    Task<StatsResponse> GetStatsAsync(Guid userId);
}
