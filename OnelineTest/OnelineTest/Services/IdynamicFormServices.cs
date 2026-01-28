using Microsoft.AspNetCore.Mvc;
using OnelineTest.DTOs;

namespace OnelineTest.Services
{
    public interface IdynamicFormServices
    {
        Task<IActionResult> UpsertForm(CreateDynamicFormDTO request);
        Task<IActionResult> GetAllForms();
        Task<IActionResult> GetFormById(int formId);
        Task<IActionResult> SubmitForm(FormSubmitDto request);
        Task<IActionResult> DeleteForm(int formId);
        Task<IActionResult> GetAllSubmissions();
        Task<IActionResult> GetSubmissionById(int submissionId);
    }
}
