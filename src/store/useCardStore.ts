import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CardMapping } from '../types/domain';
import { normalizeUid } from '../utils/nfcParser';

export type ScanSource = 'esp32-rfid';

export interface ScanRecord {
  id: string;
  uid: string | null;
  url: string | null;
  cookbookSlug: string | null;
  source: ScanSource;
  timestamp: number;
}

const LEGACY_DEMO_UIDS = new Set(['04:A1:2B:3C', '04:B8:7D:19', '04:C3:5E:90']);

interface CardStoreState {
  mappings: Record<string, CardMapping>;
  scanHistory: ScanRecord[];
  lastUnlockedSlug: string | null;
  linkCard: (uid: string, cookbookSlug: string, customLabel?: string) => CardMapping;
  unlinkCard: (uid: string) => void;
  recordScan: (entry: Omit<ScanRecord, 'id' | 'timestamp'>) => ScanRecord;
  clearHistory: () => void;
}

export const useCardStore = create<CardStoreState>()(
  persist(
    (set) => ({
      mappings: {},
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

    }),
    {
      name: 'chefcard-cards-v1',
      version: 2,
      migrate: (persistedState, version) => {
        if (version >= 2) return persistedState as CardStoreState;

        const previous = persistedState as Partial<CardStoreState>;
        const mappings = Object.fromEntries(
          Object.entries(previous.mappings ?? {}).filter(([uid, mapping]) => {
            const normalizedUid = normalizeUid(uid);
            return (
              !LEGACY_DEMO_UIDS.has(normalizedUid) &&
              !mapping.customLabel?.startsWith('Tarjeta Demo')
            );
          }),
        );
        const scanHistory = (previous.scanHistory ?? []).filter(
          (scan) =>
            scan.source === 'esp32-rfid' &&
            (!scan.uid || !LEGACY_DEMO_UIDS.has(normalizeUid(scan.uid))),
        );

        return { ...previous, mappings, scanHistory } as CardStoreState;
      },
    },
  ),
);
