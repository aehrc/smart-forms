import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ReauthenticateButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      sx={{ mt: 4 }}
      onClick={() => {
        navigate('/');
      }}
      data-test="button-unlaunched-state">
      Re-authenticate
    </Button>
  );
}

export default ReauthenticateButton;
