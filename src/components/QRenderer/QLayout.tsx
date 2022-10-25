import * as React from 'react';
import Box from '@mui/material/Box';
import NavBar from '../NavBar/NavBar';
import QDrawer from './QDrawer/QDrawer';
import QForm from './QForm';
import { QuestionnaireProvider } from '../../classes/QuestionnaireProvider';
import { QuestionnaireResponseProvider } from '../../classes/QuestionnaireResponseProvider';
import { FormContainerBox } from './QLayout.styles';

interface Props {
  questionnaireProvider: QuestionnaireProvider;
  questionnaireResponseProvider: QuestionnaireResponseProvider;
}

const drawerWidth = 320;

function QLayout(props: Props) {
  const { questionnaireProvider, questionnaireResponseProvider } = props;

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const questionnaire = questionnaireProvider.questionnaire;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box display="flex">
      <NavBar
        questionnaire={questionnaire}
        handleDrawerToggle={handleDrawerToggle}
        drawerWidth={drawerWidth}
      />
      <QDrawer
        questionnaire={questionnaire}
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <FormContainerBox>
        <QForm
          questionnaireProvider={questionnaireProvider}
          questionnaireResponseProvider={questionnaireResponseProvider}
        />
      </FormContainerBox>
    </Box>
  );
}

export default QLayout;
