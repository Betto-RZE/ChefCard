import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CardMapping } from '../types/domain';
import { normalizeUid } from '../utils/nfcParser';

export type ScanSource = 'esp32-rfid' | 'web-nfc' | 'simulator' | 'ndef-url';

export interface ScanRecord {
  id: string;
  uid: string | null;
  url: string | null;
  cookbookSlug: string | null;
  source: ScanSource;
  timestamp: number;
}

const DEMO_CARD_MAPPINGS: Record<string, CardMapping> = {
  '04:A1:2B:3C': {
    uid: '04:A1:2B:3C',
    cookbookSlug: 'cocina-vegana',
    customLabel: 'Tarjeta Demo #01',
    updatedAt: 1700000001000,
  },
  '04:B8:7D:19': {
    uid: '04:B8:7D:19',
    cookbookSlug: 'carnes-frias',
    customLabel: 'Tarjeta Demo #02',
    updatedAt: 1700000002000,
  },
  '04:C3:5E:90': {
    uid: '04:C3:5E:90',
    cookbookSlug: 'postres',
    customLabel: 'Tarjeta Demo #03',
    updatedAt: 1700000003000,
  },
};

interface CardStoreState {
  mappings: Record<string, CardMapping>;
  scanHistory: ScanRecord[];
  lastUnlockedSlug: string | null;
  linkCard: (uid: string, cookbookSlug: string, customLabel?: string) => CardMapping;
  unlinkCard: (uid: string) => void;
  recordScan: (entry: Omit<ScanRecord, 'id' | 'timestamp'>) => ScanRecord;
  clearHistory: () => void;
  resetDemoCards: () => void;
}

export const useCardStore = create<CardStoreState>()(
  persist(
    (set) => ({
      mappings: DEMO_CARD_MAPPINGS,
      scanHistory: [],
      lastUnlockedSlug: null,

      linkCard: (rawUid, cookbookSlug, customLabel) => {
        const uid = normalizeUid(rawUid);
        const mapping: CardMapping = {
          uid,
          cookbookSlug,
          customLabel: customLabel?.trim() || undefined,
          updatedAt: Date.now(),
        };
        set((state) => ({
          mappings: {
            ...state.mappings,
            [uid]: mapping,
          },
          lastUnlockedSlug: cookbookSlug,
        }));
        return mapping;
      },

      unlinkCard: (rawUid) => {
        const uid = normalizeUid(rawUid);
        set((state) => {
          const next = { ...state.mappings };
          delete next[uid];
          return { mappings: next };
        });
      },

      recordScan: (entry) => {
        const record: ScanRecord = {
          ...entry,
          uid: entry.uid ? normalizeUid(entry.uid) : null,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: Date.now(),
        };
        set((state) => ({
          scanHistory: [record, ...state.scanHistory].slice(0, 12),
          lastUnlockedSlug: record.cookbookSlug ?? state.lastUnlockedSlug,
        }));
        return record;
      },

      clearHistory: () => set({ scanHistory: [] }),

      resetDemoCards: () =>
        set({
          mappings: DEMO_CARD_MAPPINGS,
        }),
    }),
    {
      name: 'chefcard-cards-v1',
    },
  ),
);
