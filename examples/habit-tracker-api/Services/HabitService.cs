using System.Text.Json;
using HabitTracker.API.Data;
using HabitTracker.API.DTOs.Habits;
using HabitTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.API.Services;

public class HabitService : IHabitService
{
    private readonly AppDbContext _db;

    public HabitService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<HabitResponse>> GetAllAsync(Guid userId)
    {
        var habits = await _db.Habits
            .Where(h => h.UserId == userId)
            .Include(h => h.Completions)
            .OrderByDescending(h => h.CreatedAt)
            .AsNoTracking()
            .ToListAsync();

        return habits.Select(MapToResponse).ToList();
    }

    public async Task<HabitResponse?> GetByIdAsync(Guid userId, Guid habitId)
    {
        var habit = await _db.Habits
            .Where(h => h.UserId == userId && h.Id == habitId)
            .Include(h => h.Completions)
            .AsNoTracking()
            .FirstOrDefaultAsync();

        return habit == null ? null : MapToResponse(habit);
    }

    public async Task<HabitResponse> CreateAsync(Guid userId, CreateHabitRequest request)
    {
        var habit = new Habit
        {
            UserId = userId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            Category = request.Category,
            Color = request.Color,
            Emoji = request.Emoji,
            Frequency = request.Frequency,
            CustomDays = JsonSerializer.Serialize(request.CustomDays),
            CreatedAt = DateTime.UtcNow,
        };

        _db.Habits.Add(habit);
        await _db.SaveChangesAsync();

        habit.Completions = new List<HabitCompletion>();
        return MapToResponse(habit);
    }

    public async Task<HabitResponse?> UpdateAsync(Guid userId, Guid habitId, UpdateHabitRequest request)
    {
        var habit = await _db.Habits
            .Where(h => h.UserId == userId && h.Id == habitId)
            .Include(h => h.Completions)
            .FirstOrDefaultAsync();

        if (habit == null) return null;

        if (request.Name != null) habit.Name = request.Name.Trim();
        if (request.Description != null) habit.Description = request.Description.Trim();
        if (request.Category != null) habit.Category = request.Category;
        if (request.Color != null) habit.Color = request.Color;
        if (request.Emoji != null) habit.Emoji = request.Emoji;
        if (request.Frequency != null) habit.Frequency = request.Frequency;
        if (request.CustomDays != null) habit.CustomDays = JsonSerializer.Serialize(request.CustomDays);

        await _db.SaveChangesAsync();
        return MapToResponse(habit);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid habitId)
    {
        var habit = await _db.Habits
            .Where(h => h.UserId == userId && h.Id == habitId)
            .FirstOrDefaultAsync();

        if (habit == null) return false;

        _db.Habits.Remove(habit);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<HabitResponse?> ToggleArchiveAsync(Guid userId, Guid habitId)
    {
        var habit = await _db.Habits
            .Where(h => h.UserId == userId && h.Id == habitId)
            .Include(h => h.Completions)
            .FirstOrDefaultAsync();

        if (habit == null) return null;

        habit.Archived = !habit.Archived;
        await _db.SaveChangesAsync();
        return MapToResponse(habit);
    }

    public async Task<HabitResponse?> ToggleCompletionAsync(Guid userId, Guid habitId, string date)
    {
        var habit = await _db.Habits
            .Where(h => h.UserId == userId && h.Id == habitId)
            .Include(h => h.Completions)
            .FirstOrDefaultAsync();

        if (habit == null) return null;

        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out var parsedDate))
            throw new ArgumentException($"Invalid date format '{date}'. Expected YYYY-MM-DD.");

        var existingCompletion = habit.Completions
            .FirstOrDefault(c => c.Date == parsedDate);

        if (existingCompletion != null)
        {
            _db.HabitCompletions.Remove(existingCompletion);
            habit.Completions.Remove(existingCompletion);
        }
        else
        {
            var completion = new HabitCompletion
            {
                HabitId = habitId,
                Date = parsedDate,
            };
            _db.HabitCompletions.Add(completion);
            habit.Completions.Add(completion);
        }

        await _db.SaveChangesAsync();
        return MapToResponse(habit);
    }

    private static HabitResponse MapToResponse(Habit habit)
    {
        int[] customDays;
        try
        {
            customDays = JsonSerializer.Deserialize<int[]>(habit.CustomDays) ?? Array.Empty<int>();
        }
        catch
        {
            customDays = Array.Empty<int>();
        }

        return new HabitResponse
        {
            Id = habit.Id.ToString(),
            UserId = habit.UserId.ToString(),
            Name = habit.Name,
            Description = habit.Description,
            Category = habit.Category,
            Color = habit.Color,
            Emoji = habit.Emoji,
            Frequency = habit.Frequency,
            CustomDays = customDays,
            Completions = habit.Completions
                .OrderBy(c => c.Date)
                .Select(c => c.Date.ToString("yyyy-MM-dd"))
                .ToArray(),
            Archived = habit.Archived,
            CreatedAt = habit.CreatedAt,
        };
    }
}
