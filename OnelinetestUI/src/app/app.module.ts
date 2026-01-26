import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';


import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FillFormComponent } from './fill-form/fill-form.component';
import { FillFormRendererComponent } from './fill-form-renderer/fill-form-renderer.component';
import { JsonParsePipe } from '../Pipes/json-parse.pipe';
import { SubmissionsListComponent } from './submissions-list/submissions-list.component';


@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent,
    DashboardComponent,
    FillFormComponent,
    FillFormRendererComponent,
    JsonParsePipe,
    SubmissionsListComponent   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,

    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HttpClientModule,
    MatRadioModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
