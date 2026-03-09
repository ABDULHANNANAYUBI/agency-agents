using System.Security.Claims;
using HabitTracker.API.DTOs.Habits;
using HabitTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HabitTracker.API.Controllers;

[ApiController]
[Route("api/habits")]
[Authorize]
[Produces("application/json")]
public class HabitsController : ControllerBase
{
    private readonly IHabitService _habitService;

    public HabitsController(IHabitService habitService)
    {
        _habitService = habitService;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    [SwaggerOperation(Summary = "Get all habits for the current user")]
    [ProducesResponseType(typeof(List<HabitResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll()
    {
        var habits = await _habitService.GetAllAsync(GetUserId());
        return Ok(habits);
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Create a new habit")]
    [ProducesResponseType(typeof(HabitResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Create([FromBody] CreateHabitRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var habit = await _habitService.CreateAsync(GetUserId(), request);
        return StatusCode(StatusCodes.Status201Created, habit);
    }

    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Get a single habit by ID")]
    [ProducesResponseType(typeof(HabitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var habit = await _habitService.GetByIdAsync(GetUserId(), id);
        if (habit == null) return NotFound(new { error = "Habit not found" });
        return Ok(habit);
    }

    [HttpPut("{id:guid}")]
    [SwaggerOperation(Summary = "Update an existing habit")]
    [ProducesResponseType(typeof(HabitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHabitRequest request)
    {
        var habit = await _habitService.UpdateAsync(GetUserId(), id, request);
        if (habit == null) return NotFound(new { error = "Habit not found" });
        return Ok(habit);
    }

    [HttpDelete("{id:guid}")]
    [SwaggerOperation(Summary = "Delete a habit permanently")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _habitService.DeleteAsync(GetUserId(), id);
        if (!deleted) return NotFound(new { error = "Habit not found" });
        return NoContent();
    }

    [HttpPatch("{id:guid}/archive")]
    [SwaggerOperation(Summary = "Toggle archive status of a habit")]
    [ProducesResponseType(typeof(HabitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleArchive(Guid id)
    {
        var habit = await _habitService.ToggleArchiveAsync(GetUserId(), id);
        if (habit == null) return NotFound(new { error = "Habit not found" });
        return Ok(habit);
    }

    [HttpPost("{id:guid}/completions/{date}")]
    [SwaggerOperation(Summary = "Toggle completion for a specific date (YYYY-MM-DD). Adds if missing, removes if present.")]
    [ProducesResponseType(typeof(HabitResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleCompletion(Guid id, string date)
    {
        var habit = await _habitService.ToggleCompletionAsync(GetUserId(), id, date);
        if (habit == null) return NotFound(new { error = "Habit not found" });
        return Ok(habit);
    }
}
