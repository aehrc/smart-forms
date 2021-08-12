import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { QuestionnaireResponse, QuestionnaireResponseService } from '../services/questionnaire-response.service';

import { Questionnaire, QuestionnaireItem } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  @Input() questionnaire: Questionnaire;

  //@Output() responseChange = new EventEmitter<QuestionnaireResponse>();

  questionnaireModel: FormGroup = new FormGroup({});

  constructor(private qresponseService: QuestionnaireResponseService) { 
    
  }

  ngOnInit(): void {
    console.log("QuestionnaireComponent ngOnInit");
    console.log(this.questionnaire);

    this.questionnaireModel = this.qresponseService.makeQuestionnaireModel(this.questionnaire);
    //this.questionnaireModel = new FormGroup({});
    console.log(this.questionnaireModel);

    this.questionnaireModel.valueChanges.subscribe(selectedValue => this.OnValueChanges(this.qresponseService, selectedValue))
  }

  OnValueChanges(qresponseService: QuestionnaireResponseService, selectedValue: any)
  {
    console.log('questionnaire response changed');
    console.log(selectedValue);

    this.qresponseService.setQuestionnaireResponse(this.questionnaire, this.questionnaireModel);
  }
  
/*
  getItemModel(item: QuestionnaireItem): AbstractControl {
    return this.questionnaireModel[item.linkId];
  }
*/  
  /*getQuestionnaireResponse() {
    return this.qresponseService.makeResponse(this.questionnaire, this.questionnaireModel);
  }*/

}
