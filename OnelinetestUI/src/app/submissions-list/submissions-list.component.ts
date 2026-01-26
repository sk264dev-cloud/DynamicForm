import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DynamicFormService } from '../../Services/dynamic-form.service';

@Component({
  selector: 'app-submissions-list',
  templateUrl: './submissions-list.component.html',
  styleUrl: './submissions-list.component.css'
})
export class SubmissionsListComponent implements OnInit {

  submissions: any[] = [];
  loading = false;

  constructor(
    private router: Router,
    private dynamicFormService: DynamicFormService
  ) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions() {
    this.loading = true;

    this.dynamicFormService.getAllSubmissions().subscribe({
      next: res => {
        this.submissions = res;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  viewSubmission(id: number) {
    this.router.navigate(['/submission/view', id]);
  }
  
  editSubmission(id: number) {
    this.router.navigate(['/submission/edit', id]);
  }
}
