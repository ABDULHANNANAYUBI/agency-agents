namespace HabitTracker.API.DTOs.Stats;

public class StatsResponse
{
    public int TotalHabits { get; set; }
    public int DueToday { get; set; }
    public int CompletedToday { get; set; }
    public int CompletionRate { get; set; }
    public int TotalCompletionsThisWeek { get; set; }
    public int BestCurrentStreak { get; set; }
    public WeeklyDataPoint[] WeeklyData { get; set; } = Array.Empty<WeeklyDataPoint>();
    public CategoryDataPoint[] CategoryData { get; set; } = Array.Empty<CategoryDataPoint>();
}

public class WeeklyDataPoint
{
    public string Day { get; set; } = string.Empty;
    public int Completed { get; set; }
    public int Total { get; set; }
}

public class CategoryDataPoint
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}
