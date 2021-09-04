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
import { 
  QuestionnaireItemStringComponent,
  QuestionnaireItemTextComponent,
  QuestionnaireItemBooleanComponent,
  QuestionnaireItemDateComponent,
  QuestionnaireItemIntegerComponent,
  QuestionnaireItemChoiceComponent,
  QuestionnaireItemDateTimeComponent,
  QuestionnaireItemDecimalComponent,
  QuestionnaireItemDisplayComponent,
  QuestionnaireItemOpenChoiceComponent,
  QuestionnaireItemQuantityComponent
} from './questionnaire-item/questionnaire-item.component';
import { QuestionnaireItemGroupComponent, TabFilterPipe, NonTabItemFilterPipe } from './questionnaire-item/questionnaire-item-group.component';
import { QuestionnaireItemRepeatComponent } from './questionnaire-item/questionnaire-item-repeat.component';
import { QuestionnaireOffCanvasComponent } from './questionnaire-off-canvas/questionnaire-off-canvas.component';
import { SpinnerComponent } from './spinner/spinner.component';


@NgModule({
  declarations: [
    AppComponent,
    RedirectComponent,
    LaunchComponent,
    QRenderComponent,
    PatientBannerComponent,
    QuestionnaireComponent,
    QuestionnaireItemGroupComponent, 
    QuestionnaireItemRepeatComponent,
    QuestionnaireItemStringComponent,
    QuestionnaireItemTextComponent,
    QuestionnaireItemIntegerComponent,
    QuestionnaireItemBooleanComponent,
    QuestionnaireItemDateComponent,
    QuestionnaireItemChoiceComponent,
    QuestionnaireItemDateTimeComponent,
    QuestionnaireItemDecimalComponent,
    QuestionnaireItemDisplayComponent,
    QuestionnaireItemOpenChoiceComponent,
    QuestionnaireItemQuantityComponent,
    QuestionnaireOffCanvasComponent,
    TabFilterPipe,
    NonTabItemFilterPipe,
    SpinnerComponent
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
