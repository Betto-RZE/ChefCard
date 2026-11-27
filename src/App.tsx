import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { StartupSplash } from './components/brand/StartupSplash';
import { AppShell } from './components/layout/AppShell';
import { UnknownCardModal } from './components/nfc/UnknownCardModal';
import { useNfcReader, type NfcScanResult } from './hooks/useNfcReader';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { CookbookPage } from './pages/CookbookPage';
import { CardsManagerPage } from './pages/CardsManagerPage';

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const [unknownCardUid, setUnknownCardUid] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setShowSplash(false), 1650);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleScanResult = useCallback(
    (result: NfcScanResult) => {
      if (result.resolution.kind === 'resolved') {
        navigate(`/book/${result.resolution.cookbookSlug}`, {
          state: {
            unlockedBy: result.resolution.resolvedBy,
            source: result.source,
            uid: result.resolution.uid,
          },
        });
        return;
      }

      if (result.resolution.uid) {
        setUnknownCardUid(result.resolution.uid);
      }
    },
    [navigate],
  );

  const { bridgeStatus, statusMessage, error } = useNfcReader({ onScan: handleScanResult });

  const isWelcomeRoute = pathname === '/';

  return (
    <AppShell hideNav={isWelcomeRoute}>
      <Routes>
        <Route
          path="/"
          element={<WelcomePage onContinue={() => navigate('/scan')} />}
        />
        <Route
          path="/scan"
          element={
            <HomePage
              bridgeStatus={bridgeStatus}
              nfcMessage={statusMessage}
              nfcError={error}
            />
          }
        />
        <Route path="/book/:slug" element={<CookbookPage />} />
        <Route
          path="/cards"
          element={
            <CardsManagerPage
              bridgeStatus={bridgeStatus}
              nfcMessage={statusMessage}
              nfcError={error}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <UnknownCardModal
        uid={unknownCardUid}
        onClose={() => setUnknownCardUid(null)}
        onLinked={(slug) => {
          const uid = unknownCardUid;
          setUnknownCardUid(null);
          navigate(`/book/${slug}`, {
            state: {
              unlockedBy: 'uid-mapping',
              source: 'esp32-rfid',
              uid,
            },
          });
        }}
      />

      <AnimatePresence>
        {showSplash && <StartupSplash key="startup-splash" />}
      </AnimatePresence>
    </AppShell>
  );
}
