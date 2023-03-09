import { Box, List, ListItemButton, ListItemText, Typography, useTheme } from '@mui/material';
import React, { useContext } from 'react';
import { StyledNavItemIcon } from '../../StyledComponents/NavSection.styles';
import ViewerSaveAsFinal from './ViewerSaveAsFinal';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import { PrintComponentRefContext } from '../ViewerLayout';
import { useReactToPrint } from 'react-to-print';
import { QuestionnaireResponseProviderContext } from '../../../App';

export interface NavButton {
  title: string;
  icon: JSX.Element;
  disabled?: boolean;
  onClick: () => unknown;
}

function ViewerOperationSection() {
  const questionnaireResponseProvider = useContext(QuestionnaireResponseProviderContext);
  const { componentRef } = useContext(PrintComponentRefContext);

  const navigate = useNavigate();

  const handlePrint = useReactToPrint({
    content: () => (componentRef ? componentRef.current : null)
  });

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ px: 2.5, pb: 0.75 }}>
        <Typography variant="overline">Operations</Typography>
      </Box>
      <List disablePadding sx={{ px: 1 }}>
        {questionnaireResponseProvider.response.status !== 'completed' ? (
          <>
            <OperationItem
              title={'Edit Response'}
              icon={<EditIcon />}
              onClick={() => {
                navigate('/renderer');
              }}
            />
            <ViewerSaveAsFinal />
          </>
        ) : null}
        <OperationItem title={'Print Preview'} icon={<PrintIcon />} onClick={handlePrint} />
      </List>
    </Box>
  );
}

export function OperationItem(props: NavButton) {
  const { title, icon, disabled, onClick } = props;
  const theme = useTheme();

  return (
    <ListItemButton
      disableGutters
      onClick={onClick}
      disabled={disabled}
      data-test="list-button-viewer-operation"
      sx={{
        ...theme.typography.subtitle2,
        height: 48,
        textTransform: 'capitalize',
        color: theme.palette.text.secondary,
        borderRadius: Number(theme.shape.borderRadius) * 0.2
      }}>
      <StyledNavItemIcon>{icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />
    </ListItemButton>
  );
}

export default ViewerOperationSection;
