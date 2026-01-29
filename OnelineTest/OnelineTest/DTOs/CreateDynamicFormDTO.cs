namespace OnelineTest.DTOs
{
        public class CreateDynamicFormDTO
        {
            public int Formid { get; set; }
            public string FormName { get; set; }
            public string? Description { get; set; }
            public string? CreatedBy { get; set; }

            public List<FormFieldDto> Fields { get; set; }
            public List<FieldConditionDto>? Conditions { get; set; }
        }
        public class FormFieldDto
        {
            public int FieldId { get; set; }
            public string FieldLabel { get; set; }
            public string FieldType { get; set; }   // text, number, dropdown
            public bool IsRequired { get; set; }
            public string? DefaultValue { get; set; }
            public string? OptionsJson { get; set; }
            public int SortOrder { get; set; }
            public bool IsActive { get; set; }
        }
        public class FieldConditionDto
        {
            public int ConditionId { get; set; }
            public int SourceFieldId { get; set; }
            public int SourceFieldIndex { get; set; }   // index from Fields list
            public int TargetFieldId { get; set; }
            public int TargetFieldIndex { get; set; }
            public string Operator { get; set; }        // equals, gt, lt
            public string ComparisonValue { get; set; }
            public string Action { get; set; }          // show / hide
            public bool IsActive { get; set; } = true;
        }
        public class FormResponseDto
        {
            public int FormId { get; set; }
            public string FormName { get; set; }
            public string? Description { get; set; }

            public List<FormFieldResponseDto> Fields { get; set; }
            public List<FieldConditionResponseDto> Conditions { get; set; }
        }
        public class FormFieldResponseDto
        {
            public int FieldId { get; set; }
            public string FieldLabel { get; set; }
            public string FieldType { get; set; }
            public bool IsRequired { get; set; }
            public string? DefaultValue { get; set; }
            public string? OptionsJson { get; set; }
            public int SortOrder { get; set; }
            public bool IsActive { get; set; }
        }

        public class FieldConditionResponseDto
        {
            public int ConditionId { get; set; }
            public int SourceFieldId { get; set; }
            public int TargetFieldId { get; set; }
            public string Operator { get; set; }
            public string ComparisonValue { get; set; }
            public string Action { get; set; }
            public bool IsActive { get; set; }
        }
        public class FormListDto
        {
            public int FormId { get; set; }
            public string FormName { get; set; }
            public string Description { get; set; }
    }
        public class FormSubmitDto
        {
            public int SubmissionId { get; set; }
            public int FormId { get; set; }
            public string? SubmittedBy { get; set; }
            public string? FormName { get; set; }
            public DateTime? SubmittedOn { get; set; }

            public List<FormFieldValueDto> Values { get; set; }
            public List<FieldConditionResponseDto>? Conditions { get; set; }
        }
        public class FormFieldValueDto
        {
            public int ValueId { get; set; }
            public int FieldId { get; set; }
            public string? FieldLabel { get; set; }
            public string? FieldType { get; set; }
            public string? DefaultValue { get; set; }
            public bool? IsRequired { get; set; }
            public string? optionsJson { get; set; }
            public string? Value { get; set; }
        }
        public class SubmissionListDto
        {
            public int SubmissionId { get; set; }
            public int FormId { get; set; }
            public string FormName { get; set; }
            public string? SubmittedBy { get; set; }
            public DateTime SubmittedOn { get; set; }
        }
 }
