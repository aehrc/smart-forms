import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { Questionnaire, QuestionnaireService } from '../services/questionnaire.service';
import { QuestionnaireForm } from '../services/questionnaireResponse.model';

@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  //private questionnaire: Questionnaire;

  questionnaire$: Observable<Questionnaire>;

  questionnaireModel: QuestionnaireForm;

  constructor(private questionnaireService: QuestionnaireService, 
    private qresponseService: QuestionnaireResponseService) { 
  }

  ngOnInit(): void {
    this.questionnaire$ = this.questionnaireService.getQuestionnaire();
    this.questionnaire$.subscribe(q=> {
      //this.questionnaire = q;
     
      this.questionnaireService.populate(q)
      .subscribe(qr => 
        this.questionnaireModel.merge(qr)
      );        

      //this.questionnaireModel = this.qresponseService.makeQuestionnaireFormModel(q);
      this.questionnaireModel = new QuestionnaireForm(q);

      //console.log(this.questionnaireModel);

      this.questionnaireModel.questionnaireResponse$.subscribe( 
        response => this.qresponseService.onQuestionnaireResponseChanged(response));
    });
  }
}
