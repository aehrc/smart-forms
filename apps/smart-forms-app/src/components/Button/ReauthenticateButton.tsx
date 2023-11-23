import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function ReauthenticateButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="contained"
      onClick={() => {
        navigate('/');
      }}
      data-test="button-unlaunched-state">
      Re-authenticate
    </Button>
  );
}

export default ReauthenticateButton;
