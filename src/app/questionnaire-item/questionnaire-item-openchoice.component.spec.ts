import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { QuestionnaireItemOpenChoiceComponent } from "./questionnaire-item-openchoice.component";
import { map } from "rxjs/operators";
import { AnswerOption } from "../services/questionnaire.model";

class MockedQuestionnaireItemOpenChoiceAnswerValueSet extends QuestionnaireItemOpenChoiceComponent {
  item = {
    linkId: "a5e9f87a-c561-4ffb-b200-9b93b8887a11",
    text: "Diagnosis interpretation",
    type: "open-choice",
    repeats: true,
    item: [],
    answerValueSet:
      "https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/(%5E%2032570071000036102%20OR%20%5E%2032570141000036105)&",
  };
}

describe("QuestionnaireItemOpenChoiceAnswerValueSet", () => {
  let component: MockedQuestionnaireItemOpenChoiceAnswerValueSet;
  let fixture: ComponentFixture<MockedQuestionnaireItemOpenChoiceAnswerValueSet>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockedQuestionnaireItemOpenChoiceAnswerValueSet],
    });
    fixture = TestBed.createComponent(
      MockedQuestionnaireItemOpenChoiceAnswerValueSet
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should be displayed as a text box", () => {
    const componentDe: DebugElement = fixture.debugElement;
    const dropdownEl = componentDe.query(By.css("input"));
    expect(dropdownEl.attributes.type).toBe("text");
  });

  it("should show dropdown content when ", () => {
    component.selectOptions = [
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "315051004",
          display: "Diabetes resolved",
        },
      },
    ];

    fixture.detectChanges();

    const componentDe: DebugElement = fixture.debugElement;
    const dropdownDe = componentDe.query(By.css(".dropdown-content"));
    const dropdownEl = dropdownDe.nativeElement;
    expect(dropdownEl.innerText).toContain("Diabetes resolved");
  });
});

class MockedQuestionnaireItemOpenChoiceAnswerOption extends QuestionnaireItemOpenChoiceComponent {
  item = {
    linkId: "a5e9f87a-c561-4ffb-b200-9b93b8887a11",
    text: "Diagnosis interpretation",
    type: "open-choice",
    repeats: true,
    item: [],
    answerOption: [
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "266919005",
          display: "Never smoked",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "77176002",
          display: "Smoker",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "8517006",
          display: "Ex-Smoker",
        },
      },
    ],
  };
}

describe("QuestionnaireItemOpenChoiceAnswerOption", () => {
  let component: MockedQuestionnaireItemOpenChoiceAnswerOption;
  let fixture: ComponentFixture<MockedQuestionnaireItemOpenChoiceAnswerOption>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockedQuestionnaireItemOpenChoiceAnswerOption],
    });
    fixture = TestBed.createComponent(
      MockedQuestionnaireItemOpenChoiceAnswerOption
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should return the options 'smoker' and 'non-smoker'", () => {
    const testInput = "smoker";
    let options: AnswerOption[];

    expect(component.item.answerOption).toBeDefined();
    component
      .filterOptions(testInput)
      .pipe(
        map((answerOption) => ({
          type: "ANSWER_OPTION",
          content: answerOption,
        }))
      )
      .subscribe((res) => {
        options = res.content;
      });

    expect(options[0].valueCoding.display).toBe("Smoker");
    expect(options[1].valueCoding.display).toBe("Ex-Smoker");
  });
});
