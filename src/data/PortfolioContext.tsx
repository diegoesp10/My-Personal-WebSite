import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { request } from '../lib/api';
import type { Portfolio } from '../lib/types';

type PortfolioState = {
  data?: Portfolio;
  error: string;
  /** undefined while the API is being asked whether the local editor is available. */
  canEdit: boolean | undefined;
  reload: () => void;
  replace: (data: Portfolio) => void;
};

const PortfolioContext = createContext<PortfolioState | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Portfolio>();
  const [error, setError] = useState('');
  const [canEdit, setCanEdit] = useState<boolean>();

  const reload = useCallback(() => {
    setError('');
    request<Portfolio>('/api/portfolio')
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    reload();
    request<{ enabled: boolean }>('/api/editor')
      .then((r) => setCanEdit(r.enabled))
      .catch(() => setCanEdit(false));
  }, [reload]);

  return (
    <PortfolioContext.Provider value={{ data, error, canEdit, reload, replace: setData }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolioState() {
  const state = useContext(PortfolioContext);
  if (!state) throw new Error('PortfolioProvider no está disponible.');
  return state;
}

/** Content for pages rendered inside the layout, which only mounts them once it has loaded. */
export function usePortfolio() {
  const { data } = usePortfolioState();
  if (!data) throw new Error('El contenido aún no se ha cargado.');
  return data;
}
