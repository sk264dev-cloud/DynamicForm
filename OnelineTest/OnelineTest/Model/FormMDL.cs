using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace OnelineTest.Model
{
    public class FormMDL
    {
        [Key]
        public int FormId { get; set; }
        public string FormName { get; set; }
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public ICollection<FormFieldsMDL> FormFields { get; set; }
        public ICollection<FormSubmissionsMDL> FormSubmissions { get; set; }
    }
}
