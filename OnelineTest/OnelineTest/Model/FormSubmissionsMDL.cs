using System.ComponentModel.DataAnnotations;

namespace OnelineTest.Model
{
    public class FormSubmissionsMDL
    {
        [Key]
        public int SubmissionId { get; set; }
        public int FormId { get; set; }
        public FormMDL Form { get; set; }
        public string? SubmittedBy { get; set; }
        public DateTime SubmittedOn { get; set; }
        public ICollection<FormSubmissionValuesMDL> SubmissionValues { get; set; }
    }
}
