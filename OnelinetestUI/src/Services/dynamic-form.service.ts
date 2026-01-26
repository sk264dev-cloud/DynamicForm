import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FormListItem } from '../Class/dynamic-form.model';

@Injectable({
  providedIn: 'root'
})
export class DynamicFormService {

  private baseUrl = 'https://localhost:7255/api/DynamicForm';

  constructor(private http: HttpClient) {}

  createForm(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/upsertForm`, payload);
  }

  getFormById(formId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${formId}`);
  }

  // ✅ Get All Forms
  getForms(): Observable<FormListItem[]> {
    return this.http.get<FormListItem[]>(`${this.baseUrl}/list`);
  }

  // ✅ Submit Form
  submitForm(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/submit`, payload);
  }

  deleteForm(formId: number) {
    return this.http.post(
      `${this.baseUrl}/Delete`,
      null,
      { params: { formId } }
    );
  }
  getAllSubmissions() {
    return this.http.get<any[]>(
      `${this.baseUrl}/submissions`
    );
  }
  
  getSubmissionById(submissionId: number) {
    return this.http.get<any>(
      `${this.baseUrl}/submission/${submissionId}`
    );
  }
  
}
