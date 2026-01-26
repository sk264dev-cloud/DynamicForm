import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicFormService } from '../../Services/dynamic-form.service';
import { FormListItem } from '../../Class/dynamic-form.model';

@Component({
  selector: 'app-fill-form',
  templateUrl: './fill-form.component.html',
  styleUrl: './fill-form.component.css'
})
export class FillFormComponent  implements OnInit {
// 🔹 Mock data (later from API)
forms:FormListItem[] = [];
loading = false;
constructor(private router: Router,
  private dynamicFormService: DynamicFormService
) {}

ngOnInit(): void {
  this.loadForms();
}

loadForms() {
  this.loading = true;
  this.dynamicFormService.getForms().subscribe({
    next: res => {
      this.forms = res;
      this.loading = false;
    },
    error: err => {
      console.error(err);
      this.loading = false;
    }
  });
}

selectForm(formId: number) {
  this.router.navigate(['/fill-form', formId]);
}

deleteForm(formId: number) {

  const confirmed = confirm('Are you sure you want to delete this form?');

  if (!confirmed) {
    return;
  }

  this.dynamicFormService.deleteForm(formId).subscribe({
    next: res => {
      alert('Form deleted successfully');
      this.loadForms(); // 🔄 refresh list
    },
    error: err => {
      console.error(err);
      alert('Failed to delete form');
    }
  });
}

editForm(formId: number) {
  this.router.navigate(['/edit-form', formId]);
}
}
