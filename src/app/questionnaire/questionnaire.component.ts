import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { Questionnaire, QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  private questionnaire: Questionnaire;

  questionnaire$: Observable<Questionnaire>;

  questionnaireModel: FormGroup = new FormGroup({});

  constructor(private questionnaireService: QuestionnaireService, 
    private qresponseService: QuestionnaireResponseService) { 
  }

  ngOnInit(): void {
    this.questionnaire$ = this.questionnaireService.getQuestionnaire();
    this.questionnaire$.subscribe(q=> {
      this.questionnaire = q;

      this.questionnaireService.populate(q)
      .subscribe(qr => 
        //this.qresponseService.questionnaireResponse = qr
        this.qresponseService.mergeQuestionnaireModel(qr, this.questionnaireModel)
      );        

      this.questionnaireModel = this.qresponseService.makeQuestionnaireModel(q);
      console.log(this.questionnaireModel);

      this.questionnaireModel.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue))  
    });
  }

  OnValueChanges(selectedValue: any)
  {
    console.log('questionnaire response changed');
    console.log(selectedValue);

    this.qresponseService.setQuestionnaireResponse(this.questionnaire, this.questionnaireModel);
  }  
}
