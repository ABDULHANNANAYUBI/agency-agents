namespace HabitTracker.API.Models;

public class Habit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "other";
    public string Color { get; set; } = "#6366f1";
    public string Emoji { get; set; } = "🎯";
    public string Frequency { get; set; } = "daily";
    public string CustomDays { get; set; } = "[]";
    public bool Archived { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public ICollection<HabitCompletion> Completions { get; set; } = new List<HabitCompletion>();
}
