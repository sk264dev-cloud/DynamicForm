using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace OnelineTest.Model
{
    public class FormSubmissionValuesMDL
    {
        [Key]
        public int ValueId { get; set; }
        public int SubmissionId { get; set; }
        public FormSubmissionsMDL Submission { get; set; }
        public int FieldId { get; set; }
        public FormFieldsMDL Field { get; set; }
        public string? FieldValue { get; set; }
    }
}
