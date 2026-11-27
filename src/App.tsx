import { useCallback, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
  const [unknownCardUid, setUnknownCardUid] = useState<string | null>(null);

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
    </AppShell>
  );
}
