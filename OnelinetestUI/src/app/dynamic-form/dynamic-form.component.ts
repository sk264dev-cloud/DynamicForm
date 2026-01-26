import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DynamicFormService } from '../../Services/dynamic-form.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.css'
})
export class DynamicFormComponent  implements OnInit {

  isEditMode = false;
  formId = 0;
  formBuilderForm!: FormGroup;

  fieldTypes = [
    { value: 'text', label: 'Text Box' },
    { value: 'radio', label: 'Radio Group' },
    { value: 'dropdown', label: 'Dropdown' }
  ];

  constructor(private fb: FormBuilder,private dynamicFormService: DynamicFormService
    ,private router: Router,
    private route: ActivatedRoute
  ) {
   
  }

  initForm() {
    this.formBuilderForm = this.fb.group({
      formTitle: ['', Validators.required],
      formDescription: ['', Validators.required],
      fields: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');

  if (id) {
    this.isEditMode = true;
    this.formId = Number(id);
    this.loadFormForEdit();
  }
  }

  get fields(): FormArray {
    return this.formBuilderForm.get('fields') as FormArray;
  }

  addField() {
    if(this.fields.length > 0){
      for (let i = 0; i < this.fields.length; i++) {
        const fieldGroup = this.fields.at(i) as FormGroup;
    
        if (fieldGroup.invalid) {
          fieldGroup.markAllAsTouched();
          return;
        }
    
        // 🔴 If dropdown / radio → validate options
        const type = fieldGroup.get('type')?.value;
        const options = fieldGroup.get('options') as FormArray;
    
        if ((type === 'dropdown' || type === 'radio') && options.length === 0) {
          alert(`Please add at least one option for question ${i + 1}`);
          return;
        }
    
        if (options?.invalid) {
          options.markAllAsTouched();
          return;
        }
      }
    }
    this.fields.push(
      this.fb.group({
        fieldId: [0], 
        label: ['', Validators.required],
        type: ['', Validators.required],
        required: [false],
        defaultValue: [null],
        options: this.fb.array([])
      })
    );
  }

  removeField(index: number) {
    const field = this.fields.at(index) as FormGroup;

  if (this.isEditMode && field.get('fieldId')?.value > 0) {
    // mark inactive
    field.get('isActive')?.setValue(false);
  } else {
    // new field, remove completely
    this.fields.removeAt(index);
  }
  }

  addOption(fieldIndex: number) {
    const options = this.fields.at(fieldIndex).get('options') as FormArray;

    if (options.invalid) {
      options.markAllAsTouched(); // show error only where invalid
      return;
    }
  
    // ✅ Add new option only if previous is valid
    options.push(
      this.fb.group({
        value: ['', Validators.required],
        isDefault: [false]
      })
    );
  }

  onDefaultOptionChange(fieldIndex: number, optionIndex: number) {
    const options = this.fields.at(fieldIndex).get('options') as FormArray;
  
    options.controls.forEach((opt, i) => {
      if (i !== optionIndex) {
        opt.get('isDefault')?.setValue(false, { emitEvent: false });
      }
    });
  }

  removeOption(fieldIndex: number, optionIndex: number) {
    const options = this.fields.at(fieldIndex).get('options') as FormArray;
    options.removeAt(optionIndex);
  }

  showOptions(fieldIndex: number): boolean {
    const type = this.fields.at(fieldIndex).get('type')?.value;
    return type === 'radio' || type === 'dropdown';
  }

  saveForm() {
     // 🔴 Validate main form
  if (this.formBuilderForm.invalid) {
    this.formBuilderForm.markAllAsTouched();
    return;
  }

  // check if any questions added or not 
  if(!(this.fields.length > 0)){
    alert("Please atleast add one question");
    return;
  }
  // 🔴 Validate each question explicitly (extra safety)
  for (let i = 0; i < this.fields.length; i++) {
    const fieldGroup = this.fields.at(i) as FormGroup;

    if (fieldGroup.invalid) {
      fieldGroup.markAllAsTouched();
      return;
    }

    // 🔴 If dropdown / radio → validate options
    const type = fieldGroup.get('type')?.value;
    const options = fieldGroup.get('options') as FormArray;

    if ((type === 'dropdown' || type === 'radio') && options.length === 0) {
      alert(`Please add at least one option for question ${i + 1}`);
      return;
    }

    if (options?.invalid) {
      options.markAllAsTouched();
      return;
    }
  }
    const payload = this.buildApiPayload();

    this.dynamicFormService.createForm(payload)
      .subscribe({
        next: res => {
          console.log('Form saved successfully', res);
          var msg = this.isEditMode ? "Form updated successfully" : "Form created successfully"
          alert(msg);
          if(this.isEditMode)
            this.router.navigate(['/fill-form']);
          else  
            this.router.navigate(['/dashboard']);
        },
        error: err => {
          console.error(err);
          alert('Error while saving form');
        }
      });
  }


  getOptionsControls(fieldIndex: number) {
    const options = this.fields.at(fieldIndex)?.get('options');
    return options ? (options as any).controls : [];
  }

  private buildApiPayload() {
    return {
      formId: this.isEditMode ? this.formId : 0,
      formName: this.formBuilderForm.value.formTitle,
      description: this.formBuilderForm.value.formDescription,
      createdBy: 'Admin',

      fields: this.formBuilderForm.value.fields.map((f: any, index: number) => ({
        fieldId: f.fieldId ?? 0,
        fieldLabel: f.label,
        fieldType: f.type,
        isRequired: f.required,
        defaultValue:  f.type === 'text'
        ? f.defaultValue
        : f.type === 'dropdown'
          ? f.options?.find((o: any) => o.isDefault)?.value ?? null
          : null,
        optionsJson: f.options?.length ? JSON.stringify(f.options.map((o: any) => o.value)) : null,
        sortOrder: index + 1,
        isActive: f.isActive ?? true
      })),

      conditions: []   
    };
  }

  loadFormForEdit() {
    this.dynamicFormService.getFormById(this.formId).subscribe(res => {
  
      this.formBuilderForm.patchValue({
        formTitle: res.formName,
        formDescription: res.description
      });
  
      res.fields.forEach((f: any) => {
        this.fields.push(
          this.fb.group({
            fieldId: [f.fieldId],                 // ✅ important
            label: [f.fieldLabel, Validators.required],
            type: [f.fieldType, Validators.required],
            required: [f.isRequired],
            defaultValue: [f.defaultValue],
            isActive: [true],                     // ✅ existing field
            options: this.buildOptions(f)
          })
        );
      });
  
    });
  }
  buildOptions(field: any): FormArray {
    const arr = this.fb.array<FormGroup>([]);
  
    if (field.optionsJson) {
      const options = JSON.parse(field.optionsJson);
  
      options.forEach((opt: string) => {
        arr.push(
          this.fb.group({
            value: [opt, Validators.required],
            isDefault: [field.defaultValue === opt]
          })
        );
      });
    }
  
    return arr;

    
  }
    
}
