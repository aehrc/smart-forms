import { TestBed } from '@angular/core/testing';

import { QuestionnaireResponseService } from './questionnaire-response.service';

describe('QuestionnaireResponseService', () => {
  let service: QuestionnaireResponseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuestionnaireResponseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
