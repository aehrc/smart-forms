import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RedirectComponent } from './redirect/redirect.component';
import { LaunchComponent } from './launch/launch.component';
import { QRenderComponent } from './qrender/qrender.component';
import { PatientBannerComponent } from './patient-banner/patient-banner.component';

@NgModule({
  declarations: [
    AppComponent,
    RedirectComponent,
    LaunchComponent,
    QRenderComponent,
    PatientBannerComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
