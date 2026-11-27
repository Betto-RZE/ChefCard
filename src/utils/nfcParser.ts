import type { CardMapping } from '../types/domain';
import { getCookbookBySlug } from '../data/cookbooks';

export type CardResolution =
  | { kind: 'resolved'; cookbookSlug: string; resolvedBy: 'uid-mapping'; uid: string }
  | { kind: 'unknown'; uid: string };

/** Normalizes a physical RFID UID to uppercase colon-separated hex. */
export function normalizeUid(rawUid: string): string {
  const cleaned = rawUid.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (cleaned.length >= 2 && cleaned.length % 2 === 0) {
    return cleaned.match(/.{1,2}/g)?.join(':') ?? rawUid.trim().toUpperCase();
  }
  return rawUid.trim().toUpperCase();
}

export function resolveCardDestination(params: {
  uid: string;
  mappings: Record<string, CardMapping>;
}): CardResolution {
  const uid = normalizeUid(params.uid);
  const mapping = params.mappings[uid];

  if (mapping && getCookbookBySlug(mapping.cookbookSlug)) {
    return { kind: 'resolved', cookbookSlug: mapping.cookbookSlug, resolvedBy: 'uid-mapping', uid };
  }

  return { kind: 'unknown', uid };
}
