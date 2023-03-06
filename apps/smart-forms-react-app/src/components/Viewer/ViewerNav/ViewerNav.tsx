import React, { useContext } from 'react';
import { Box, Drawer } from '@mui/material';
import useResponsive from '../../../custom-hooks/useResponsive';
import Logo from '../../Misc/Logo';
import Scrollbar from '../../Scrollbar/Scrollbar';
import { NAV_WIDTH } from '../../StyledComponents/Nav.styles';
import NavAccounts from '../../Nav/NavAccounts';
import ViewerNavSection from './ViewerNavSection';
import ViewerOperationSection from './ViewerOperationSection';
import { LaunchContext } from '../../../custom-contexts/LaunchContext';
import NavErrorAlert from '../../Nav/NavErrorAlert';
import { QuestionnaireProviderContext, QuestionnaireResponseProviderContext } from '../../../App';
import CsiroLogo from '../../Misc/CsiroLogo';

interface Props {
  openNav: boolean;
  onCloseNav: () => void;
}

function ViewerNav(props: Props) {
  const { openNav, onCloseNav } = props;

  const questionnaireProvider = useContext(QuestionnaireProviderContext);
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { fhirClient } = useContext(LaunchContext);

  const isDesktop = useResponsive('up', 'lg');

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' }
      }}>
      <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <NavAccounts />

      <ViewerNavSection />

      {fhirClient &&
      questionnaireProvider.questionnaire.item &&
      questionnaireResponseProvider.response.item ? (
        <ViewerOperationSection />
      ) : null}

      <Box sx={{ flexGrow: 1 }} />

      {!fhirClient ? (
        <NavErrorAlert
          message={'Save operations are disabled when app is not launched from a CMS'}
        />
      ) : null}

      <Box sx={{ px: 2.5, pb: 2 }}>
        <CsiroLogo />
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV_WIDTH }
      }}>
      {isDesktop ? (
        <Drawer
          open
          variant="permanent"
          PaperProps={{
            sx: {
              width: NAV_WIDTH,
              bgcolor: 'background.default',
              borderRightStyle: 'dashed'
            }
          }}>
          {renderContent}
        </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH }
          }}>
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

export default ViewerNav;
