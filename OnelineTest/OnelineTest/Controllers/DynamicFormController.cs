using Microsoft.AspNetCore.Mvc;
using OnelineTest.DTOs;
using OnelineTest.Services;
using static OnelineTest.DTOs.CreateDynamicFormDTO;

namespace OnelineTest.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DynamicFormController : ControllerBase
    {
        private readonly IdynamicFormServices _dynamicFormServices;

        public DynamicFormController(IdynamicFormServices dynamicFormServices)
        {
            _dynamicFormServices = dynamicFormServices;
        }
        // ✅ Create Form
        [HttpPost("upsertForm")]
        public async Task<IActionResult> UpsertForm([FromBody] CreateDynamicFormDTO request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            return await _dynamicFormServices.UpsertForm(request);
        }

        // ✅ Get Form By Id
        [HttpGet("{formId}")]
        public async Task<IActionResult> GetFormById(int formId)
        {
            if (formId <= 0)
                return BadRequest("Invalid FormId");

            return await _dynamicFormServices.GetFormById(formId);
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetForms()
        => await _dynamicFormServices.GetAllForms();

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitForm([FromBody] FormSubmitDto request)
            => await _dynamicFormServices.SubmitForm(request);

        [HttpPost("Delete")]
        public async Task<IActionResult> DeleteForm(int formId)
        {
            if (formId <= 0)
            {
                return BadRequest("invalid request");
            }
            return await _dynamicFormServices.DeleteForm(formId);
        }
        [HttpGet("submissions")]
        public async Task<IActionResult> GetAllSubmissions()
         => await _dynamicFormServices.GetAllSubmissions();

        [HttpGet("submission/{submissionId}")]
        public async Task<IActionResult> GetSubmissionById(int submissionId)
        {
            if (submissionId <= 0)
                return BadRequest("Invalid submissionId");

            return await _dynamicFormServices.GetSubmissionById(submissionId);
        }
    }
}
