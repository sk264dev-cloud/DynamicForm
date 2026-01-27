using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace OnelineTest.Model
{
    public class FieldConditionsMDL
    {
        [Key]
        public int ConditionId { get; set; }
        public int FormId { get; set; }
        public FormMDL Form { get; set; }
        public int SourceFieldId { get; set; }
        public FormFieldsMDL SourceField { get; set; }
        public int TargetFieldId { get; set; }
        public FormFieldsMDL TargetField { get; set; }
        public string Operator { get; set; }        // equals, gt, lt
        public string ComparisonValue { get; set; }
        public string Action { get; set; }          // show / hide
        public bool IsActive { get; set; }
    }
}
