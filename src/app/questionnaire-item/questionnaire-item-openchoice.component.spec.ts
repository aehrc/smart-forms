import {DebugElement} from "@angular/core";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";

import {QuestionnaireItemOpenChoiceComponent} from "./questionnaire-item-openchoice.component";

describe("QuestionnaireItemOpenChoiceComponent", () => {
  let component: QuestionnaireItemOpenChoiceComponent;
  let fixture: ComponentFixture<QuestionnaireItemOpenChoiceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionnaireItemOpenChoiceComponent],
    });
    fixture = TestBed.createComponent(QuestionnaireItemOpenChoiceComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeDefined();
  });

  it("should be displayed as a text box", () => {
    component.item = {
      linkId: "a5e9f87a-c561-4ffb-b200-9b93b8887a11",
      text: "Diagnosis interpretation",
      type: "open-choice",
      repeats: true,
      item: [],
      answerValueSet:
        "https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/(%5E%2032570071000036102%20OR%20%5E%2032570141000036105)&",
    };

    fixture.detectChanges();

    const radioDe: DebugElement = fixture.debugElement;
    const radioEl: HTMLElement = radioDe.nativeElement;
    const inputEl = radioDe.query(By.css("input"));
    expect(inputEl.attributes.type).toBe("text");
  });

  // TODO test if autocomplete works
});
