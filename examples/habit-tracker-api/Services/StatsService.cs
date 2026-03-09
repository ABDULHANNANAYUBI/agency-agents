using System.Text.Json;
using HabitTracker.API.Data;
using HabitTracker.API.DTOs.Stats;
using HabitTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.API.Services;

public class StatsService : IStatsService
{
    private readonly AppDbContext _db;

    public StatsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<StatsResponse> GetStatsAsync(Guid userId)
    {
        var habits = await _db.Habits
            .Where(h => h.UserId == userId)
            .Include(h => h.Completions)
            .AsNoTracking()
            .ToListAsync();

        var activeHabits = habits.Where(h => !h.Archived).ToList();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var todayStr = today.ToString("yyyy-MM-dd");

        // Due today
        var dueToday = activeHabits.Count(h => IsHabitDueOnDate(h, today));

        // Completed today
        var completedToday = activeHabits.Count(h =>
            IsHabitDueOnDate(h, today) &&
            h.Completions.Any(c => c.Date == today));

        // Completion rate
        var completionRate = dueToday > 0
            ? (int)Math.Round((completedToday / (double)dueToday) * 100)
            : 0;

        // This week completions (Sun-Sat week containing today)
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(6);
        var totalCompletionsThisWeek = habits
            .SelectMany(h => h.Completions)
            .Count(c => c.Date >= startOfWeek && c.Date <= endOfWeek);

        // Best current streak across all active habits
        var bestCurrentStreak = activeHabits.Count > 0
            ? activeHabits.Max(h => GetCurrentStreak(h, today))
            : 0;

        // Weekly data — last 7 days
        var weeklyData = new List<WeeklyDataPoint>();
        for (int i = 6; i >= 0; i--)
        {
            var date = today.AddDays(-i);
            var dayCompleted = activeHabits.Count(h =>
                IsHabitDueOnDate(h, date) &&
                h.Completions.Any(c => c.Date == date));
            var dayTotal = activeHabits.Count(h => IsHabitDueOnDate(h, date));

            weeklyData.Add(new WeeklyDataPoint
            {
                Day = date.DayOfWeek.ToString()[..3],
                Completed = dayCompleted,
                Total = dayTotal,
            });
        }

        // Category data
        var categoryData = activeHabits
            .GroupBy(h => h.Category)
            .Select(g => new CategoryDataPoint
            {
                Name = g.Key,
                Count = g.Count(),
            })
            .OrderByDescending(c => c.Count)
            .ToArray();

        return new StatsResponse
        {
            TotalHabits = activeHabits.Count,
            DueToday = dueToday,
            CompletedToday = completedToday,
            CompletionRate = completionRate,
            TotalCompletionsThisWeek = totalCompletionsThisWeek,
            BestCurrentStreak = bestCurrentStreak,
            WeeklyData = weeklyData.ToArray(),
            CategoryData = categoryData,
        };
    }

    private static bool IsHabitDueOnDate(Habit habit, DateOnly date)
    {
        var dayOfWeek = (int)date.DayOfWeek;  // 0=Sun ... 6=Sat

        return habit.Frequency switch
        {
            "daily" => true,
            "weekdays" => dayOfWeek >= 1 && dayOfWeek <= 5,
            "weekends" => dayOfWeek == 0 || dayOfWeek == 6,
            "weekly" => dayOfWeek == 1,  // Monday
            "custom" => IsCustomDayMatch(habit.CustomDays, dayOfWeek),
            _ => true,
        };
    }

    private static bool IsCustomDayMatch(string customDaysJson, int dayOfWeek)
    {
        try
        {
            var days = JsonSerializer.Deserialize<int[]>(customDaysJson) ?? Array.Empty<int>();
            return days.Contains(dayOfWeek);
        }
        catch
        {
            return false;
        }
    }

    private static int GetCurrentStreak(Habit habit, DateOnly today)
    {
        var completionDates = habit.Completions
            .Select(c => c.Date)
            .ToHashSet();

        int streak = 0;
        var date = today;

        // If not completed today and not due today, start checking from yesterday
        if (!completionDates.Contains(today) && IsHabitDueOnDate(habit, today))
        {
            return 0;
        }

        // Walk backwards counting consecutive completed due days
        while (true)
        {
            if (IsHabitDueOnDate(habit, date))
            {
                if (completionDates.Contains(date))
                {
                    streak++;
                }
                else
                {
                    // Allow skipping today if not yet checked
                    if (date == today) { date = date.AddDays(-1); continue; }
                    break;
                }
            }
            date = date.AddDays(-1);

            // Safety guard to prevent infinite loop
            if (date < today.AddDays(-3650)) break;
        }

        return streak;
    }
}
