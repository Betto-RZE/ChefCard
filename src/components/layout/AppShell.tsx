import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CreditCard, Home, Radio } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
  onOpenSimulator: () => void;
  hideNav?: boolean;
}

export function AppShell({ children, onOpenSimulator, hideNav = false }: AppShellProps) {
  const { pathname } = useLocation();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-stone-50 shadow-sm sm:border-x sm:border-stone-200/80">
      <div className={hideNav ? 'flex-1' : 'flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))]'}>
        {children}
      </div>

      {!hideNav && (
        <nav
          aria-label="Navegación principal"
          className="fixed right-0 bottom-0 left-0 z-30 mx-auto w-full max-w-md border-t border-stone-200/90 bg-white/95 px-4 pt-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))] backdrop-blur-md"
        >
          <div className="grid grid-cols-3 items-center gap-2">
            <Link
              to="/scan"
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition ${
                pathname === '/scan' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Lector</span>
            </Link>

            <button
              type="button"
              onClick={onOpenSimulator}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-orange-600 px-3 text-xs font-bold text-white shadow-md shadow-orange-600/25 active:scale-95"
            >
              <Radio className="h-4 w-4" />
              <span>Simular</span>
            </button>

            <Link
              to="/cards"
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-semibold transition ${
                pathname === '/cards' ? 'text-orange-600' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Tarjetas</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
