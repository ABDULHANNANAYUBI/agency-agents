using HabitTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HabitTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Habit> Habits => Set<Habit>();
    public DbSet<HabitCompletion> HabitCompletions => Set<HabitCompletion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).HasMaxLength(255).IsRequired();
            entity.Property(u => u.Name).HasMaxLength(100).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.HasMany(u => u.Habits)
                  .WithOne(h => h.User)
                  .HasForeignKey(h => h.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Habit>(entity =>
        {
            entity.HasKey(h => h.Id);
            entity.HasIndex(h => h.UserId);
            entity.Property(h => h.Name).HasMaxLength(100).IsRequired();
            entity.Property(h => h.Description).HasDefaultValue(string.Empty);
            entity.Property(h => h.Category).HasMaxLength(50).HasDefaultValue("other");
            entity.Property(h => h.Color).HasMaxLength(20).HasDefaultValue("#6366f1");
            entity.Property(h => h.Emoji).HasMaxLength(10).HasDefaultValue("🎯");
            entity.Property(h => h.Frequency).HasMaxLength(20).HasDefaultValue("daily");
            entity.Property(h => h.CustomDays).HasDefaultValue("[]");
            entity.HasMany(h => h.Completions)
                  .WithOne(c => c.Habit)
                  .HasForeignKey(c => c.HabitId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<HabitCompletion>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.HasIndex(c => new { c.HabitId, c.Date }).IsUnique();
            entity.Property(c => c.Date).IsRequired();
        });
    }
}
