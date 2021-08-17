import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { Questionnaire, QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire-off-canvas',
  templateUrl: './questionnaire-off-canvas.component.html',
  styleUrls: ['./questionnaire-off-canvas.component.css']
})
export class QuestionnaireOffCanvasComponent { 

  questionnaire$: Observable<Questionnaire>;

  qresponse$: Observable<QuestionnaireResponse>;

  constructor(private questionnaireService: QuestionnaireService, 
    private responseService: QuestionnaireResponseService) { 

    this.questionnaire$ = this.questionnaireService.getQuestionnaire();
    this.qresponse$ = this.responseService.getQuestionnaireResponse();
  }
}
