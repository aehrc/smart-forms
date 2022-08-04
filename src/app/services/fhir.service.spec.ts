import { TestBed } from "@angular/core/testing";

import { FHIRService } from "./fhir.service";

describe("FHIRService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: FHIRService = TestBed.inject(FHIRService);
    expect(service).toBeTruthy();
  });
});
