import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function UnlaunchedButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      color="warning"
      sx={{ mt: 6 }}
      onClick={() => {
        navigate('/dashboard/questionnaires');
      }}
      data-test="button-unlaunched-state">
      Proceed in unlaunched state
    </Button>
  );
}

export default UnlaunchedButton;
