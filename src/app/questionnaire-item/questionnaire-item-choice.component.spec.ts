import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { QuestionnaireItemChoiceComponent } from "./questionnaire-item-choice.component";
import { AnswerOption } from "../services/questionnaire.model";

class MockedQuestionnaireItemChoiceComponent extends QuestionnaireItemChoiceComponent {
  item = {
    linkId: "3d46c42b-a10f-4805-ad9f-ae9510bdbc4e",
    text: "Aboriginal and Torres Strait Islander status",
    type: "choice",
    item: [],
    answerOption: [
      {
        valueCoding: {
          code: "1",
          display: "Aboriginal but not Torres Strait Islander origin",
          system:
            "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
        },
      },
      {
        valueCoding: {
          code: "2",
          display: "Torres Strait Islander but not Aboriginal origin",
          system:
            "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
        },
      },
      {
        valueCoding: {
          code: "3",
          display: "Both Aboriginal and Torres Strait Islander origin",
          system:
            "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
        },
      },
    ] as AnswerOption[],
  };
}

describe("QuestionnaireItemChoiceComponent", () => {
  let component: MockedQuestionnaireItemChoiceComponent;
  let fixture: ComponentFixture<MockedQuestionnaireItemChoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockedQuestionnaireItemChoiceComponent],
    });
    fixture = TestBed.createComponent(MockedQuestionnaireItemChoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should be displayed as a radio button", () => {
    const radioDe: DebugElement = fixture.debugElement;
    const inputEl = radioDe.query(By.css("input"));
    expect(inputEl.attributes.type).toBe("radio");
  });

  it("should be displayed as a dropdown", () => {
    component.item.answerOption.push({
      valueCoding: {
        code: "4",
        display: "Neither Aboriginal nor Torres Strait Islander origin",
        system:
          "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
      },
    });
    component.item.answerOption.push({
      valueCoding: {
        code: "5",
        display: "Not stated/inadequately described",
        system:
          "https://healthterminologies.gov.au/fhir/CodeSystem/australian-indigenous-status-1",
      },
    });
    component.answerOption = [];
    component.onInit();
    fixture.detectChanges();

    const dropdownDe: DebugElement = fixture.debugElement;
    expect(dropdownDe.query(By.css("select"))).toBeTruthy();
  });

  it("should be displaying a dropdown value from a valueString as intended", () => {
    component.item.answerOption[0] = {
      valueString: "testValue",
    };

    component.answerOption = [];
    component.onInit();
    fixture.detectChanges();

    const radioDe: DebugElement = fixture.debugElement;
    const inputDe: DebugElement = radioDe.query(By.css("input"));
    expect(inputDe.attributes.type).toBe("radio");
    expect(inputDe.nativeElement.value).toBe("testValue");
  });
});
