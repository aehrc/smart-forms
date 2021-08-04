import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RedirectComponent } from './redirect/redirect.component';
import { LaunchComponent } from './launch/launch.component';
import { QRenderComponent } from './qrender/qrender.component';
import { PatientBannerComponent } from './patient-banner/patient-banner.component';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    RedirectComponent,
    LaunchComponent,
    QRenderComponent,
    PatientBannerComponent,
    QuestionnaireComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
