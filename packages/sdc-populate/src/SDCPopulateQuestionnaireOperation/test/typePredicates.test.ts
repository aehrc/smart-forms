import { describe } from '@jest/globals';
import {
  isCanonicalParameter,
  isContextParameter,
  isInputParameters,
  isOutputParameters,
  isSubjectParameter
} from '../utils';
import {
  isEncounterContextParameter,
  isQuestionnaireDataParameter,
  isResponseParameter,
  isUserContextParameter
} from '../utils/typePredicates';

describe('FHIR Parameters type guards', () => {
  describe('isInputParameters', () => {
    it('returns true when both questionnaire and subject parameters are present', () => {
      const params = {
        parameter: [
          { name: 'questionnaire', resource: { resourceType: 'Questionnaire' } },
          { name: 'subject', valueReference: {} }
        ]
      };
      expect(isInputParameters(params as any)).toBe(true);
    });

    it('returns false if questionnaire param is missing', () => {
      const params = {
        parameter: [{ name: 'subject', valueReference: {} }]
      };
      expect(isInputParameters(params as any)).toBe(false);
    });

    it('returns false if subject param is missing', () => {
      const params = {
        parameter: [{ name: 'questionnaire', resource: { resourceType: 'Questionnaire' } }]
      };
      expect(isInputParameters(params as any)).toBe(false);
    });
  });

  describe('isQuestionnaireDataParameter', () => {
    it('matches parameter with name identifier and valueIdentifier', () => {
      expect(
        isQuestionnaireDataParameter({
          name: 'identifier',
          valueIdentifier: { system: 'sys', value: 'val' }
        } as any)
      ).toBe(true);
    });

    it('matches parameter with name questionnaire and resource Questionnaire', () => {
      expect(
        isQuestionnaireDataParameter({
          name: 'questionnaire',
          resource: { resourceType: 'Questionnaire' }
        } as any)
      ).toBe(true);
    });

    it('matches parameter with name questionnaireRef and valueReference', () => {
      expect(
        isQuestionnaireDataParameter({
          name: 'questionnaireRef',
          valueReference: { reference: 'Questionnaire/123' }
        } as any)
      ).toBe(true);
    });

    it('returns false for other cases', () => {
      expect(
        isQuestionnaireDataParameter({
          name: 'questionnaire',
          resource: { resourceType: 'Patient' }
        } as any)
      ).toBe(false);
      expect(
        isQuestionnaireDataParameter({
          name: 'foo',
          valueIdentifier: { system: 'sys', value: 'val' }
        } as any)
      ).toBe(false);
    });
  });

  describe('isCanonicalParameter', () => {
    it('returns true for name canonical with valueCanonical', () => {
      expect(
        isCanonicalParameter({
          name: 'canonical',
          valueCanonical: 'http://example.com'
        } as any)
      ).toBe(true);
    });

    it('returns false if missing valueCanonical', () => {
      expect(
        isCanonicalParameter({
          name: 'canonical'
        } as any)
      ).toBe(false);
    });

    it('returns false if name is not canonical', () => {
      expect(
        isCanonicalParameter({
          name: 'foo',
          valueCanonical: 'http://example.com'
        } as any)
      ).toBe(false);
    });
  });

  describe('isSubjectParameter', () => {
    it('returns true for name subject with valueReference', () => {
      expect(
        isSubjectParameter({
          name: 'subject',
          valueReference: { reference: 'Patient/123' }
        } as any)
      ).toBe(true);
    });

    it('returns false if missing valueReference', () => {
      expect(
        isSubjectParameter({
          name: 'subject'
        } as any)
      ).toBe(false);
    });

    it('returns false if name is not subject', () => {
      expect(
        isSubjectParameter({
          name: 'foo',
          valueReference: { reference: 'Patient/123' }
        } as any)
      ).toBe(false);
    });
  });

  describe('isUserContextParameter', () => {
    it('returns true for context param with name "user" and resource in content', () => {
      expect(
        isUserContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'user' },
            { name: 'content', resource: { resourceType: 'Practitioner' } }
          ]
        } as any)
      ).toBe(true);
    });

    it('returns false if name is not user', () => {
      expect(
        isUserContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'patient' },
            { name: 'content', resource: { resourceType: 'Patient' } }
          ]
        } as any)
      ).toBe(false);
    });

    it('returns false if no resource in content', () => {
      expect(
        isUserContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'user' },
            { name: 'content', valueReference: { reference: 'Practitioner/1' } }
          ]
        } as any)
      ).toBe(false);
    });
  });

  describe('isEncounterContextParameter', () => {
    it('returns true for context param with name "encounter" and resource in content', () => {
      expect(
        isEncounterContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'encounter' },
            { name: 'content', resource: { resourceType: 'Encounter' } }
          ]
        } as any)
      ).toBe(true);
    });

    it('returns false if name is not encounter', () => {
      expect(
        isEncounterContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'user' },
            { name: 'content', resource: { resourceType: 'Practitioner' } }
          ]
        } as any)
      ).toBe(false);
    });

    it('returns false if no resource in content', () => {
      expect(
        isEncounterContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'encounter' },
            { name: 'content', valueReference: { reference: 'Encounter/1' } }
          ]
        } as any)
      ).toBe(false);
    });
  });

  describe('isContextParameter', () => {
    it('returns true for context param with valid name and content resource', () => {
      expect(
        isContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'someName' },
            { name: 'content', resource: { resourceType: 'Condition' } }
          ]
        } as any)
      ).toBe(true);
    });

    it('returns true for context param with valueReference in content', () => {
      expect(
        isContextParameter({
          name: 'context',
          part: [
            { name: 'name', valueString: 'someName' },
            { name: 'content', valueReference: { reference: 'Condition/1' } }
          ]
        } as any)
      ).toBe(true);
    });

    it('returns false if name is not context', () => {
      expect(
        isContextParameter({
          name: 'foo',
          part: [
            { name: 'name', valueString: 'someName' },
            { name: 'content', resource: { resourceType: 'Condition' } }
          ]
        } as any)
      ).toBe(false);
    });

    it('returns false if missing name or content parts', () => {
      expect(
        isContextParameter({
          name: 'context',
          part: [{ name: 'name' }]
        } as any)
      ).toBe(false);
    });
  });

  describe('isOutputParameters', () => {
    it('returns true if any parameter is a response parameter', () => {
      const params = {
        parameter: [
          {
            name: 'response',
            resource: { resourceType: 'QuestionnaireResponse' }
          }
        ]
      };
      expect(isOutputParameters(params as any)).toBe(true);
    });

    it('returns false if no response parameter', () => {
      const params = {
        parameter: [
          {
            name: 'foo'
          }
        ]
      };
      expect(isOutputParameters(params as any)).toBe(false);
    });
  });

  describe('isResponseParameter', () => {
    it('returns true for parameter with name response and QuestionnaireResponse resource', () => {
      expect(
        isResponseParameter({
          name: 'response',
          resource: { resourceType: 'QuestionnaireResponse' }
        } as any)
      ).toBe(true);
    });

    it('returns false if resourceType is not QuestionnaireResponse', () => {
      expect(
        isResponseParameter({
          name: 'response',
          resource: { resourceType: 'Patient' }
        } as any)
      ).toBe(false);
    });

    it('returns false if name is not response', () => {
      expect(
        isResponseParameter({
          name: 'foo',
          resource: { resourceType: 'QuestionnaireResponse' }
        } as any)
      ).toBe(false);
    });
  });
});
