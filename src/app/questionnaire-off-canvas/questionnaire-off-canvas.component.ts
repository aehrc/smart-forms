import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { Questionnaire } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire-off-canvas',
  templateUrl: './questionnaire-off-canvas.component.html',
  styleUrls: ['./questionnaire-off-canvas.component.css']
})
export class QuestionnaireOffCanvasComponent { //implements AfterViewInit {

  //questionnaire: Questionnaire;
  questionnaire$: Observable<Questionnaire>;

  //qResponse: QuestionnaireResponse;
  qresponse$: Observable<QuestionnaireResponse>;

  constructor(private responseService: QuestionnaireResponseService) { 
    this.questionnaire$ = responseService.getQuestionnaire();
    this.qresponse$ = responseService.getQuestionnaireResponse();
  }

  /*ngAfterViewInit(): void {    
    this.qResponse = this.responseService.questionnaireResponse;
    this.questionnaire = this.responseService.questionnaire;
  }*/

  setQuestionnaireResponse() {
    /*if (!this.qResponse)
      this.qResponse = this.responseService.questionnaireResponse;

    console.log( 'setQuestionnaireResponse', JSON.stringify(this.qResponse));

    if (!this.questionnaire)
      this.questionnaire = this.responseService.questionnaire;*/
  }
}
