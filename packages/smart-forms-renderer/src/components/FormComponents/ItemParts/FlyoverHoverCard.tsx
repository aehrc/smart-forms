import React, { type JSX, useState } from 'react';
import Popover from '@mui/material/Popover';
import { Box } from '@mui/material';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import Typography from '@mui/material/Typography';

interface FlyoverHoverCardProps {
  children: string | JSX.Element | JSX.Element[];
}

function FlyoverHoverCard(props: FlyoverHoverCardProps) {
  const { children } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const childrenIsString = typeof children === 'string';

  return (
    <>
      <Box
        onMouseEnter={handleOpen} // Show popover on hover
        onMouseLeave={handleClose} // Hide popover when not hovered
        sx={{
          height: 16,
          width: 16,
          backgroundColor: 'rgba(25, 118, 210, 0.8)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.3s'
        }}>
        <QuestionMarkOutlinedIcon sx={{ color: 'white', height: 12, width: 12 }} />
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        sx={{ pointerEvents: 'none' }} // Ensures hover-only behavior
      >
        {childrenIsString ? (
          <Box sx={{ p: 2, maxWidth: 550, bgcolor: 'background.paper', boxShadow: 8 }}>
            <Typography variant="body2">{children}</Typography>
          </Box>
        ) : (
          <Box>{children}</Box>
        )}
      </Popover>
    </>
  );
}

export default FlyoverHoverCard;
