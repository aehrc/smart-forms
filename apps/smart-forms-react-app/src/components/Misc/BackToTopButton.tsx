import * as React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

interface Props {
  children: React.ReactElement;
}

function BackToTopButton(props: Props) {
  const { children } = props;

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Fade in={trigger}>
      <Box onClick={handleClick} sx={{ position: 'fixed', bottom: 12, right: 12 }}>
        {children}
      </Box>
    </Fade>
  );
}

export default BackToTopButton;
