import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { QuestionnaireService } from '../services/questionnaire.service';
import { Questionnaire } from '../services/questionnaire.model';

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

    this.questionnaire$ = this.questionnaireService.questionnaire$;
    this.qresponse$ = this.responseService.getQuestionnaireResponse();
  }
}
