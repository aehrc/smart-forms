import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { QuestionnaireResponseService } from '../services/questionnaire-response.service';

import { Questionnaire, QuestionnaireItem } from '../services/questionnaire.service';

@Component({
  selector: 'questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.css']
})
export class QuestionnaireComponent implements OnInit {

  @Input() questionnaire: Questionnaire;

  questionnaireModel: FormGroup = new FormGroup({});

  constructor(private qresponseService: QuestionnaireResponseService) { 
    
  }

  ngOnInit(): void {
    console.log("QuestionnaireComponent ngOnInit");
    console.log(this.questionnaire);

    this.questionnaireModel = this.qresponseService.makeQuestionnaireModel(this.questionnaire);
    //this.questionnaireModel = new FormGroup({});
    console.log(this.questionnaireModel);
  }

  /*
  ngAfterViewInit() {
    console.log(this.questionnaireModel);
  }
*/
/*
  getItemModel(item: QuestionnaireItem): AbstractControl {
    return this.questionnaireModel[item.linkId];
  }
*/  
  getQuestionnaireResponse() {
    return this.qresponseService.makeResponse(this.questionnaire, this.questionnaireModel);
  }

}
