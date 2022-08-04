import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "../app.component";

import { LaunchComponent } from "./launch.component";

describe("LaunchComponent", () => {
  let component: LaunchComponent;
  let fixture: ComponentFixture<LaunchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [AppComponent],
      declarations: [LaunchComponent],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
