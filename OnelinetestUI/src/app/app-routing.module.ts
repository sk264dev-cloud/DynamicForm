import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FillFormComponent } from './fill-form/fill-form.component';
import { FillFormRendererComponent } from './fill-form-renderer/fill-form-renderer.component';
import { SubmissionsListComponent } from './submissions-list/submissions-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'dashboard', component: DashboardComponent },
  { path: 'edit-form/:id', component: DynamicFormComponent },
  { path: 'create-form', component: DynamicFormComponent },
  { path: 'fill-form', component: FillFormComponent },
  { path: 'fill-form/:id', component: FillFormRendererComponent },
  { path: 'submissions', component: SubmissionsListComponent },
  { path: 'submission/:mode/:id', component: FillFormRendererComponent },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
