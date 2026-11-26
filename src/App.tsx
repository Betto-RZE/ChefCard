import { useCallback, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RfidSimulatorSheet } from './components/nfc/RfidSimulatorSheet';
import { UnknownCardModal } from './components/nfc/UnknownCardModal';
import { useNfcReader, type NfcScanResult } from './hooks/useNfcReader';
import { WelcomePage } from './pages/WelcomePage';
import { HomePage } from './pages/HomePage';
import { CookbookPage } from './pages/CookbookPage';
import { CardsManagerPage } from './pages/CardsManagerPage';

export default function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [simulatorOpen, setSimulatorOpen] = useState(false);
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

  const {
    isSupported,
    bridgeStatus,
    status,
    statusMessage,
    error,
    startScan,
    stopScan,
    simulateScan,
    sendTestBridgeScan,
  } = useNfcReader({ onScan: handleScanResult });

  const isWelcomeRoute = pathname === '/';

  return (
    <AppShell hideNav={isWelcomeRoute} onOpenSimulator={() => setSimulatorOpen(true)}>
      <Routes>
        <Route
          path="/"
          element={
            <WelcomePage
              onContinue={() => navigate('/scan')}
              onContinueWithSimulator={() => {
                navigate('/scan');
                setSimulatorOpen(true);
              }}
            />
          }
        />
        <Route
          path="/scan"
          element={
            <HomePage
              isNfcSupported={isSupported}
              bridgeStatus={bridgeStatus}
              nfcStatus={status}
              nfcMessage={statusMessage}
              nfcError={error}
              onStartScan={() => void startScan()}
              onStopScan={stopScan}
              onOpenSimulator={() => setSimulatorOpen(true)}
            />
          }
        />
        <Route path="/book/:slug" element={<CookbookPage />} />
        <Route
          path="/cards"
          element={
            <CardsManagerPage
              isNfcSupported={isSupported}
              bridgeStatus={bridgeStatus}
              nfcStatus={status}
              nfcMessage={statusMessage}
              nfcError={error}
              onStartScan={() => void startScan()}
              onStopScan={stopScan}
              onSimulateScan={simulateScan}
              onSendTestBridgeScan={sendTestBridgeScan}
              onOpenSimulator={() => setSimulatorOpen(true)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <RfidSimulatorSheet
        open={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
        onSimulate={simulateScan}
      />

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
