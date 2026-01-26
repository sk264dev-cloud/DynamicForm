using System.ComponentModel.DataAnnotations;

namespace OnelineTest.Model
{
    public class FormFieldsMDL
    {
        [Key]
        public int FieldId { get; set; }
        public int FormId { get; set; }
        public FormMDL Form { get; set; }
        public string FieldLabel { get; set; }
        public string FieldType { get; set; }   // text, number, dropdown
        public bool IsRequired { get; set; }
        public string? DefaultValue { get; set; }
        public string? OptionsJson { get; set; }
        public int SortOrder { get; set; }
        public bool IsActive { get; set; }
    }
}
