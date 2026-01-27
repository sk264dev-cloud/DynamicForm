using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OnelineTest.Data;
using OnelineTest.Dto;
using OnelineTest.Model;

namespace OnelineTest.Services
{
    public class DynamicFormService : IdynamicFormServices
    {
        private readonly AppDbContext _context;

        public DynamicFormService(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IActionResult> UpsertForm(CreateDynamicFormDTO request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                int returnObj = 0;
                if (request.Formid == 0)
                {
                    var form = new FormMDL
                    {
                        FormName = request.FormName,
                        Description = request.Description,
                        CreatedBy = request.CreatedBy,
                        IsActive = true
                    };

                    _context.Forms.Add(form);
                    await _context.SaveChangesAsync();

                    // Save Fields
                    var fields = request.Fields.Select((f, index) => new FormFieldsMDL
                    {
                        FormId = form.FormId,
                        FieldLabel = f.FieldLabel,
                        FieldType = f.FieldType,
                        IsRequired = f.IsRequired,
                        DefaultValue = f.DefaultValue,
                        OptionsJson = f.OptionsJson,
                        SortOrder = f.SortOrder,
                        IsActive = true
                    }).ToList();

                    _context.FormFields.AddRange(fields);
                    await _context.SaveChangesAsync();

                    // Save Conditions
                    if (request.Conditions != null && request.Conditions.Any())
                    {
                        var conditions = request.Conditions.Select(c => new FieldConditionsMDL
                        {
                            FormId = form.FormId,
                            SourceFieldId = fields[c.SourceFieldIndex].FieldId,
                            TargetFieldId = fields[c.TargetFieldIndex].FieldId,
                            Operator = c.Operator,
                            ComparisonValue = c.ComparisonValue,
                            Action = c.Action
                        });

                        _context.FieldConditions.AddRange(conditions);
                        await _context.SaveChangesAsync();
                    }
                    returnObj = form.FormId;
                }
                else
                {
                    var form = await _context.Forms
                 .FirstOrDefaultAsync(f => f.FormId == request.Formid);

                    if (form == null)
                        return new NotFoundResult();

                    form.FormName = request.FormName;
                    form.Description = request.Description;

                    _context.Forms.Update(form);
                    await _context.SaveChangesAsync();

                    // Save Fields
                    var fields = request.Fields.Select((f, index) => new FormFieldsMDL
                    {
                        FormId = form.FormId,
                        FieldId = f.FieldId,
                        FieldLabel = f.FieldLabel,
                        FieldType = f.FieldType,
                        IsRequired = f.IsRequired,
                        DefaultValue = f.DefaultValue,
                        OptionsJson = f.OptionsJson,
                        SortOrder = f.SortOrder,
                        IsActive = f.IsActive
                    }).ToList();

                    _context.FormFields.UpdateRange(fields);
                    await _context.SaveChangesAsync();

                    // Save Conditions
                    if (request.Conditions != null && request.Conditions.Any())
                    {
                        var conditions = request.Conditions.Select(c => new FieldConditionsMDL
                        {
                            ConditionId = c.ConditionId,
                            FormId = form.FormId,
                            SourceFieldId = c.SourceFieldId > 0 ? c.SourceFieldId : fields[c.SourceFieldIndex].FieldId,
                            TargetFieldId = c.TargetFieldId > 0 ? c.TargetFieldId : fields[c.TargetFieldIndex].FieldId,
                            Operator = c.Operator,
                            ComparisonValue = c.ComparisonValue,
                            Action = c.Action,
                            IsActive = c.IsActive
                        });

                        _context.FieldConditions.UpdateRange(conditions);
                        await _context.SaveChangesAsync();
                    }
                    returnObj = form.FormId;
                }
                await transaction.CommitAsync();
                return new OkObjectResult(returnObj);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return null;
            }
        }

        public async Task<IActionResult> GetFormById(int formId)
        {
            try
            {
                var form = await _context.Forms
                    .Where(f => f.FormId == formId && f.IsActive)
                    .Select(f => new FormResponseDto
                    {
                        FormId = f.FormId,
                        FormName = f.FormName,
                        Description = f.Description,
                        Fields = _context.FormFields
                            .Where(ff => ff.FormId == f.FormId && ff.IsActive)
                            .OrderBy(ff => ff.SortOrder)
                            .Select(ff => new FormFieldResponseDto
                            {
                                FieldId = ff.FieldId,
                                FieldLabel = ff.FieldLabel,
                                FieldType = ff.FieldType,
                                IsRequired = ff.IsRequired,
                                DefaultValue = ff.DefaultValue,
                                OptionsJson = ff.OptionsJson,
                                SortOrder = ff.SortOrder,
                                IsActive = ff.IsActive,
                            }).ToList(),

                        Conditions = _context.FieldConditions
                            .Where(fc => fc.FormId == f.FormId && fc.IsActive)
                            .Select(fc => new FieldConditionResponseDto
                            {
                                ConditionId = fc.ConditionId,
                                SourceFieldId = fc.SourceFieldId,
                                TargetFieldId = fc.TargetFieldId,
                                Operator = fc.Operator,
                                ComparisonValue = fc.ComparisonValue,
                                Action = fc.Action,
                                IsActive = fc.IsActive
                            }).ToList()
                    })
                    .FirstOrDefaultAsync();

                if (form == null)
                    return new NotFoundResult();

                return new OkObjectResult(form);
            }
            catch(Exception ex)
            {
                return new NotFoundResult();
            }
        }

        public async Task<IActionResult> GetAllForms()
        {
            var forms = await _context.Forms
                .Where(f => f.IsActive)
                .Select(f => new FormListDto
                {
                    FormId = f.FormId,
                    FormName = f.FormName
                })
                .ToListAsync();

            return new OkObjectResult(forms);
        }

        public async Task<IActionResult> SubmitForm(FormSubmitDto request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                FormSubmissionsMDL submissionobj;
                if (request.SubmissionId == 0)
                {
                    var submission = new FormSubmissionsMDL
                    {
                        FormId = request.FormId,
                        SubmittedBy = request.SubmittedBy
                    };

                    _context.FormSubmissions.Add(submission);
                    await _context.SaveChangesAsync();

                    var values = request.Values.Select(v => new FormSubmissionValuesMDL
                    {
                        SubmissionId = submission.SubmissionId,
                        FieldId = v.FieldId,
                        FieldValue = v.Value
                    }).ToList();

                    _context.FormSubmissionValues.AddRange(values);
                    await _context.SaveChangesAsync();
                    submissionobj = submission;
                }
                else
                {
                    var submission = await _context.FormSubmissions
                        .FirstOrDefaultAsync(s => s.SubmissionId == request.SubmissionId);

                    if (submission == null)
                        return new NotFoundResult();

                    var values = request.Values.Select(v => new FormSubmissionValuesMDL
                    {
                        ValueId = v.ValueId,
                        SubmissionId = submission.SubmissionId,
                        FieldId = v.FieldId,
                        FieldValue = v.Value
                    }).ToList();

                    _context.FormSubmissionValues.UpdateRange(values);
                    await _context.SaveChangesAsync();
                    submissionobj = submission;
                }
                await transaction.CommitAsync();
                return new OkResult();
            }
            catch(Exception ex)
            {
                return null;
            }
        }
        public async Task<IActionResult> DeleteForm(int formId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
               await _context.Forms
                .Where(f => f.FormId == formId)
                .ExecuteUpdateAsync(s => s.SetProperty(f => f.IsActive, false));

                await _context.FormFields
                    .Where(ff => ff.FormId == formId)
                    .ExecuteUpdateAsync(s => s.SetProperty(f => f.IsActive, false));

                await transaction.CommitAsync();
                return new OkResult();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return null;
            }
        }

        public async Task<IActionResult> GetAllSubmissions()
        {
            var submissions = await _context.FormSubmissions
                .OrderByDescending(s => s.SubmittedOn)
                .Select(s => new SubmissionListDto
                {
                    SubmissionId = s.SubmissionId,
                    FormId = s.FormId,
                    FormName = s.Form.FormName,
                    SubmittedBy = s.SubmittedBy,
                    SubmittedOn = s.SubmittedOn
                })
                .ToListAsync();

            return new OkObjectResult(submissions);
        }
        public async Task<IActionResult> GetSubmissionById(int submissionId)
        {
            try
            {
                var submission = await _context.FormSubmissions
                .Where(s => s.SubmissionId == submissionId)
                .Select(s => new FormSubmitDto
                {
                    SubmissionId = s.SubmissionId,
                    FormId = s.FormId,
                    FormName = s.Form.FormName,
                    SubmittedBy = s.SubmittedBy,
                    SubmittedOn = s.SubmittedOn,

                    Values = _context.FormSubmissionValues
                        .Where(v => v.SubmissionId == s.SubmissionId)
                        .Select(v => new FormFieldValueDto
                        {
                            ValueId = v.ValueId,
                            FieldId = v.FieldId,
                            FieldLabel = v.Field.FieldLabel,
                            FieldType = v.Field.FieldType,
                            Value = v.FieldValue,
                            optionsJson = v.Field.OptionsJson,
                            IsRequired = (bool)v.Field.IsRequired,
                            DefaultValue = v.Field.DefaultValue,
                        })
                        .ToList(),

                          Conditions = _context.FieldConditions
                    .Where(fc => fc.FormId == s.FormId && fc.IsActive)
                    .Select(fc => new FieldConditionResponseDto
                    {
                        ConditionId = fc.ConditionId,
                        SourceFieldId = fc.SourceFieldId,
                        TargetFieldId = fc.TargetFieldId,
                        Operator = fc.Operator,
                        ComparisonValue = fc.ComparisonValue,
                        Action = fc.Action
                    })
                    .ToList()
                })
                .FirstOrDefaultAsync();

                if (submission == null)
                    return new NotFoundResult();

                return new OkObjectResult(submission);
            }
            catch (Exception ex) {
                return new NotFoundResult();
            }
        }
    }
}
