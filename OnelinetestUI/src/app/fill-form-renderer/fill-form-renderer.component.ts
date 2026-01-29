import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DynamicFormService } from '../../Services/dynamic-form.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

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
      let defaultVal: any = '';
  
      switch (f.fieldType) {
        case 'text':
        case 'dropdown':
        case 'radio': 
          defaultVal = f.defaultValue ?? '';
          break;
  
        case 'checkbox': 
          defaultVal = f.defaultValue ? f.defaultValue.split(',').map((x: string) => x.trim()) : []; 
          break;

        case 'number':
          defaultVal =
            f.defaultValue !== null && f.defaultValue !== undefined
              ? Number(f.defaultValue)
              : null;
          break;
  
        case 'date':
          defaultVal = f.defaultValue ? new Date(f.defaultValue) : null;
          break;
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
      values: this.fields.map(f => {
        let value = this.form.value[f.fieldId];
    
        if (f.fieldType === 'date' && value) {
          value = this.formatDate(value);
        }

        if (f.fieldType === 'checkbox') {
          if (Array.isArray(value) && value.length > 0) {
            value = value.join(',');
          } else {
            value = ''; 
          }
        }
    
        return {
          valueId: f.valueId ?? 0,
          fieldId: f.fieldId,
          value: value !== null && value !== undefined ? String(value) : null
        };
      })
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
          ? this.mapValueByType(v.fieldType, v.value)
          : this.mapValueByType(v.fieldType, v.defaultValue);
      
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

  mapValueByType(type: string, value: any) {
    if (value === null || value === undefined) return null;
  
    switch (type) {
      case 'number':
        return Number(value);
  
      case 'date':
        return new Date(value); // yyyy-MM-dd → Date
  
      case 'checkbox':
        // Handle all possible checkbox value formats
      if (Array.isArray(value)) {
        return value;
      } else if (typeof value === 'string') {
        // Parse comma-separated string to array
        const parsedArray = value
          .split(',')
          .map((item: string) => item.trim())
          .filter((item: string) => item !== '');
        return parsedArray.length > 0 ? parsedArray : null;
      }
      else{
        return null;
      }
  
      default:
        return value;
    }
  }

  onCheckboxChange(fieldId: number, option: string, Checked: boolean ) {
    const control = this.form.get(fieldId.toString());
    if (!control) return;
  
    let value: string[] = control.value || [];
  
    if (Checked) {
      if (!value.includes(option)) {
        value.push(option);
      }
    } else {
      value = value.filter(v => v !== option);
    }
  
    control.setValue(value);
    control.markAsTouched();
  }

  private formatDate(date: any): string {
    const d = date instanceof Date ? date : new Date(date);
  
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
  
    return `${yyyy}-${mm}-${dd}`;
  }
  
  
}
