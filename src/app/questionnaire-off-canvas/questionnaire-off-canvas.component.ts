import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../services/questionnaire.model';
import { fhirclient } from 'fhirclient/lib/types';

@Component({
  selector: 'questionnaire-off-canvas',
  templateUrl: './questionnaire-off-canvas.component.html',
  styleUrls: ['./questionnaire-off-canvas.component.css']
})
export class QuestionnaireOffCanvasComponent implements OnDestroy { 

  questionnaire$: Observable<Questionnaire>;

  qresponse$: Observable<QuestionnaireResponse>;

  get query$() : Observable<fhirclient.FHIR.Resource> {
    return this.questionnaireService.batchQuery$; 
  }

  constructor(private questionnaireService: QuestionnaireService, 
    private responseService: QuestionnaireResponseService) { 

    this.questionnaire$ = this.questionnaireService.questionnaire$;
    this.qresponse$ = this.responseService.getQuestionnaireResponse();
  }

  private subscriptions: Subscription[] = [];

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  saveQResponse(qresponse: QuestionnaireResponse) {
    this.subscriptions.push(
    this.responseService.create(qresponse)
    .subscribe(
      y=> console.log(y), 
      e=> console.log(e)
    ));
  }

  validateQResponse(qresponse: QuestionnaireResponse) {
    this.subscriptions.push(
    this.responseService.validate(qresponse)
    .subscribe(
      y=> console.log(y), 
      e=> console.log(e)
    ));
  }
}
