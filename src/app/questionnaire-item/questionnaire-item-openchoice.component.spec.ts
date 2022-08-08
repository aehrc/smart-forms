import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { QuestionnaireItemOpenChoiceComponent } from "./questionnaire-item-openchoice.component";

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

    const componentDe: DebugElement = fixture.debugElement;
    const dropdownEl = componentDe.query(By.css("input"));
    expect(dropdownEl.attributes.type).toBe("text");
  });

  it("should show dropdown content when ", () => {
    component.item = {
      linkId: "a5e9f87a-c561-4ffb-b200-9b93b8887a11",
      text: "Diagnosis interpretation",
      type: "open-choice",
      repeats: true,
      item: [],
      answerValueSet:
        "https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/(%5E%2032570071000036102%20OR%20%5E%2032570141000036105)&",
    };

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
