namespace HabitTracker.API.Models;

public class HabitCompletion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HabitId { get; set; }
    public DateOnly Date { get; set; }
    public Habit Habit { get; set; } = null!;
}
