import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, async } from '@angular/core/testing';

import { QuestionnaireItemChoiceComponent } from './questionnaire-item-choice.component';

describe('QuestionnaireItemChoiceComponent', () => {
  let component: QuestionnaireItemChoiceComponent;
  let fixture: ComponentFixture<QuestionnaireItemChoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({declarations: [QuestionnaireItemChoiceComponent]});
    fixture = TestBed.createComponent(QuestionnaireItemChoiceComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should be displayed as a radio button question', () => {
    component.item = {
      linkId: '1',
      type: 'choice',
      item: [],
      answerOption: [
        {
          "valueCoding": {
            "system": "266919005", "code": "Never smoked", "display": "http://snomed.info/sct"
          }
        }]
    };
    component.itemControl = "radio-button"


    fixture.detectChanges();

    const radioDe: DebugElement = fixture.debugElement;
    const radioEl: HTMLElement = radioDe.nativeElement;
    console.log(radioEl)
    console.log(component)
    // const bannerDe: DebugElement = fixture.debugElement;
    // const paragraphDe = bannerDe.query(By.css('p'));
    expect(component).toBeDefined();

  });
});
