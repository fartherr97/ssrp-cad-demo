import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied({ portalName = 'this section', code = 'AUTH_PORTAL_RESTRICTED' }) {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/access-denied', {
      replace: true,
      state: { code, portal: portalName },
    });
  }, [navigate, code, portalName]);
  return null;
}
