import type { BehavioralTestWrapperProps } from './behavioralTestUtils';
import { BehavioralTestWrapper } from './behavioralTestUtils';
import aboriginalForm from '../data/resources/Questionnaire/Questionnaire-AboriginalTorresStraitIslanderHealthCheckAssembled-0.4.0.json';
import type { Questionnaire } from 'fhir/r4';

export function AboriginalForm(props: Omit<BehavioralTestWrapperProps, 'questionnaire'>) {
  return <BehavioralTestWrapper questionnaire={aboriginalForm as Questionnaire} {...props} />;
}
