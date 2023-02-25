import { StyledRoot } from './DebugFooter.styles';
import React, { useContext, useState } from 'react';
import DisplayDebugQResponse from '../DebugComponents/DisplayDebugQResponse';
import { QuestionnaireResponseItem } from 'fhir/r5';
import RendererDebugBar from '../DebugComponents/RendererDebugBar';
import { QuestionnaireProviderContext } from '../../App';
import { RendererContext } from '../Renderer/RendererLayout';

function DebugFooter() {
  const [isHidden, setIsHidden] = useState(true);
  const { questionnaire } = useContext(QuestionnaireProviderContext);
  const { renderer, setRenderer } = useContext(RendererContext);

  return (
    <>
      {isHidden ? null : (
        <DisplayDebugQResponse
          questionnaire={questionnaire}
          questionnaireResponse={renderer.response}
          clearQResponse={() => {
            const clearQrForm: QuestionnaireResponseItem = {
              linkId: 'clearedItem',
              text: 'Cleared',
              item: []
            };
            setRenderer({
              response: {
                ...renderer.response,
                item: [clearQrForm]
              },
              hasChanges: false
            });
          }}
        />
      )}
      <StyledRoot>
        <RendererDebugBar isHidden={isHidden} toggleIsHidden={(checked) => setIsHidden(checked)} />
      </StyledRoot>
    </>
  );
}

export default DebugFooter;
