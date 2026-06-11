import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Toast = () => {
  const { toast } = useContext(AuthContext);
  if (!toast) return null;
  return <div className={`toast toast-${toast.type}`}>{toast.msg}</div>;
};

export default Toast;
