using System.ComponentModel.DataAnnotations;

namespace HabitTracker.API.DTOs.Habits;

public class CreateHabitRequest
{
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100, ErrorMessage = "Name must not exceed 100 characters")]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Category { get; set; } = "other";

    public string Color { get; set; } = "#6366f1";

    public string Emoji { get; set; } = "🎯";

    public string Frequency { get; set; } = "daily";

    public int[] CustomDays { get; set; } = Array.Empty<int>();
}
