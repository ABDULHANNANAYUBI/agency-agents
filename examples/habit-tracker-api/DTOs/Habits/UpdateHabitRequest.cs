namespace HabitTracker.API.DTOs.Habits;

public class UpdateHabitRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public string? Color { get; set; }
    public string? Emoji { get; set; }
    public string? Frequency { get; set; }
    public int[]? CustomDays { get; set; }
}
