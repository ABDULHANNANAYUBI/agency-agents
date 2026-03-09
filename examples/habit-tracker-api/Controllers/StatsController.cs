using System.Security.Claims;
using HabitTracker.API.DTOs.Stats;
using HabitTracker.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace HabitTracker.API.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize]
[Produces("application/json")]
public class StatsController : ControllerBase
{
    private readonly IStatsService _statsService;

    public StatsController(IStatsService statsService)
    {
        _statsService = statsService;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Get aggregated statistics for the current user")]
    [ProducesResponseType(typeof(StatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStats()
    {
        var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var stats = await _statsService.GetStatsAsync(userId);
        return Ok(stats);
    }
}
