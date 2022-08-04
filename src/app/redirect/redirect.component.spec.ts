import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { RedirectComponent } from "./redirect.component";

describe("RedirectComponent", () => {
  let component: RedirectComponent;
  let fixture: ComponentFixture<RedirectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RedirectComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
