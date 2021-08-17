import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';
import { Questionnaire, QuestionnaireItem, QuestionnaireService } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  //@Input() questionnaire: Questionnaire;

  private questionnaire: Questionnaire;

  questionnaire$: Observable<Questionnaire>;

  questionnaireModel: FormGroup = new FormGroup({});

  constructor(private questionnaireService: QuestionnaireService, 
    private qresponseService: QuestionnaireResponseService) { 
  }

  ngOnInit(): void {
    console.log("QuestionnaireComponent ngOnInit");
    console.log(this.questionnaire);

    this.questionnaire$ = this.questionnaireService.getQuestionnaire();
    this.questionnaire$.subscribe(q=> {
      this.questionnaire = q;

      this.questionnaireModel = this.qresponseService.makeQuestionnaireModel(q);
      console.log(this.questionnaireModel);

      this.questionnaireModel.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue))  
    });

    /*
    this.questionnaireModel = this.qresponseService.makeQuestionnaireModel(this.questionnaire);
    console.log(this.questionnaireModel);

    this.questionnaireModel.valueChanges.subscribe(selectedValue => this.OnValueChanges(selectedValue))
    */
  }

  OnValueChanges(selectedValue: any)
  {
    console.log('questionnaire response changed');
    console.log(selectedValue);

    this.qresponseService.setQuestionnaireResponse(this.questionnaire, this.questionnaireModel);
  }  
}
