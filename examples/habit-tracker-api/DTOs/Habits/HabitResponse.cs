namespace HabitTracker.API.DTOs.Habits;

public class HabitResponse
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Emoji { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public int[] CustomDays { get; set; } = Array.Empty<int>();
    public string[] Completions { get; set; } = Array.Empty<string>();
    public bool Archived { get; set; }
    public DateTime CreatedAt { get; set; }
}
