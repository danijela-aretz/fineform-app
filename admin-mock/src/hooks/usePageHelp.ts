import { useLocation } from 'react-router-dom';
import { getPageHelp, type PageHelp } from '../data/pageHelp';

export function usePageHelp(): PageHelp | null {
  const location = useLocation();
  return getPageHelp(location.pathname);
}

