import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicFormService } from '../../Services/dynamic-form.service';

@Component({
  selector: 'app-fill-form-renderer',
  templateUrl: './fill-form-renderer.component.html',
  styleUrl: './fill-form-renderer.component.css'
})
export class FillFormRendererComponent implements OnInit {

  form!: FormGroup;
  formId!: number;
  fields: any[] = [];
  mode: 'view' | 'edit' = 'view';
  isViewMode = false;
  isEditMode = false;
  submissionId = 0;

  conditions: any[] = [];
  hiddenFields = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private dynamicFormService: DynamicFormService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

  if (this.router.url.includes('submission')) {
    this.mode = this.route.snapshot.paramMap.get('mode') as 'view' | 'edit';
    this.submissionId = Number(this.route.snapshot.paramMap.get('id'));
  
    this.isViewMode = this.mode === 'view';
    this.isEditMode = this.mode === 'edit';
    this.loadSubmission();
  } else {
    this.formId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadForm();
  }
  }

  loadForm() {
    this.dynamicFormService.getFormById(this.formId).subscribe({
      next: res => {
        this.fields = res.fields;
        this.conditions = (res.conditions || []);
        this.buildForm();
        this.registerConditionListeners();
      },
      error: err => console.error(err)
    });
  }

  buildForm() {
    const group: any = {};
  
    this.fields.forEach(f => {
      let defaultVal = '';
  
      // ✅ set default values
      if (f.fieldType === 'text' && f.defaultValue) {
        defaultVal = f.defaultValue;
      }
  
      if (f.fieldType === 'dropdown' && f.defaultValue) {
        defaultVal = f.defaultValue;
      }
  
      group[f.fieldId] = [
        defaultVal,
        f.isRequired ? Validators.required : []
      ];
    });
  
    this.form = this.fb.group(group);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = {
      submissionId: this.isEditMode ? this.submissionId : 0,
      formId: this.formId,
      values: this.fields.map(f => ({
        valueId: f.valueId ?? 0,      
        fieldId: f.fieldId,
        value: this.form.value[f.fieldId]
      }))
    };

    this.dynamicFormService.submitForm(payload).subscribe({
      next: res => {
        alert('Form submitted successfully');
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        alert('Submission failed');
      }
    });
  }

  loadSubmission() {
    this.dynamicFormService.getSubmissionById(this.submissionId).subscribe(res => {
  
      this.formId = res.formId;
  
      // reuse existing renderer logic
      this.fields = res.values.map((v: any) => ({
        valueId: v.valueId,
        fieldId: v.fieldId,
        fieldLabel: v.fieldLabel,
        fieldType: v.fieldType, 
        value: v.value,
        optionsJson: v.optionsJson,
        isRequired: v.isRequired,
        defaultValue: v.defaultValue
      }));
  
      const group: any = {};
      res.values.forEach((v: any) => {

        // 🔹 value priority:
        // submitted value > default value > empty
        const controlValue =
          v.value !== null && v.value !== undefined && v.value !== ''
            ? v.value
            : (v.defaultValue ?? '');
      
        group[v.fieldId] = [
          controlValue,
          v.isRequired ? Validators.required : []
        ];
      });
  
      this.form = this.fb.group(group);
      if(this.isViewMode)
          this.form.disable();
      this.conditions = (res.conditions || []);
      this.registerConditionListeners();
    });
    
  }

  registerConditionListeners() {
    this.conditions.forEach(cond => {
      const sourceControl = this.form.get(cond.sourceFieldId.toString());
      if (!sourceControl) return;
  
      sourceControl.valueChanges.subscribe(val => {
        this.evaluateCondition(cond, val);
      });
  
      // 🔹 evaluate once for default value
      this.evaluateCondition(cond, sourceControl.value);
    });
  }

  evaluateCondition(cond: any, sourceValue: any) {
    const targetFieldId = cond.targetFieldId;
    const targetControl = this.form.get(targetFieldId.toString());
    if (!targetControl) return;
  
    let isMatch = false;
  
    switch (cond.operator) {
      case 'equals':
        isMatch = sourceValue === cond.comparisonValue;
        break;
  
      case 'notEquals':
        isMatch = sourceValue !== cond.comparisonValue;
        break;
    }
  
    this.applyAction(cond.action, isMatch, targetFieldId, targetControl);
  }

  applyAction(
    action: string,
    isMatch: boolean,
    targetFieldId: number,
    targetControl: any
  ) {
    switch (action) {
  
      case 'hide':
        isMatch
          ? this.hiddenFields.add(targetFieldId)
          : this.hiddenFields.delete(targetFieldId);
        break;
  
      case 'show':
        isMatch
          ? this.hiddenFields.delete(targetFieldId)
          : this.hiddenFields.add(targetFieldId);
        break;
  
      case 'empty_disable':
        if (isMatch) {
          targetControl.setValue('');
          targetControl.disable({ emitEvent: false });
        } else {
          if(!this.isViewMode)
            targetControl.enable({ emitEvent: false });
        }
        break;
    }
  }
}
