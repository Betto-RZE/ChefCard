import type { CardMapping } from '../types/domain';
import type { NDEFMessage } from '../types/web-nfc';
import { getCookbookBySlug } from '../data/cookbooks';

export type CardResolution =
  | {
      kind: 'resolved';
      cookbookSlug: string;
      resolvedBy: 'ndef-url' | 'uid-mapping';
      uid: string | null;
      rawUrl: string | null;
    }
  | {
      kind: 'unknown';
      uid: string | null;
      rawUrl: string | null;
    };

/**
 * Normalizes physical RFID/NFC UIDs to uppercase colon-separated hex (e.g. "04:A1:2B:3C").
 */
export function normalizeUid(rawUid: string): string {
  const cleaned = rawUid.trim().toUpperCase().replace(/[^0-9A-F]/g, '');
  if (cleaned.length >= 2 && cleaned.length % 2 === 0) {
    return cleaned.match(/.{1,2}/g)?.join(':') ?? rawUid.trim().toUpperCase();
  }
  return rawUid.trim().toUpperCase();
}

/**
 * Builds the canonical NDEF URL written onto physical NTAG215 cards.
 */
export function buildCookbookNdefUrl(slug: string, origin?: string): string {
  const baseOrigin =
    origin ?? (typeof window !== 'undefined' ? window.location.origin : 'https://chefcard.app');
  return `${baseOrigin.replace(/\/$/, '')}/book/${encodeURIComponent(slug)}`;
}

/**
 * Extracts the cookbook slug from a ChefCard URL or path like "/book/cocina-vegana".
 */
export function extractSlugFromUrl(rawUrl: string): string | null {
  try {
    const parsed = rawUrl.startsWith('http')
      ? new URL(rawUrl)
      : new URL(rawUrl, 'https://chefcard.local');
    const match = parsed.pathname.match(/^\/book\/([^/?#]+)/i);
    if (!match) return null;
    return decodeURIComponent(match[1]).toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Decodes URL or text payloads from a Web NFC NDEFMessage.
 */
export function parseNdefMessage(message: NDEFMessage): {
  url: string | null;
  slug: string | null;
  text: string | null;
} {
  let url: string | null = null;
  let slug: string | null = null;
  let text: string | null = null;

  for (const record of message.records) {
    if (!record.data) continue;

    try {
      const decoder = new TextDecoder(record.encoding || 'utf-8');
      const decoded = decoder.decode(record.data).trim();

      if (record.recordType === 'url' || record.recordType === 'absolute-url') {
        url = decoded;
        const candidateSlug = extractSlugFromUrl(decoded);
        if (candidateSlug && getCookbookBySlug(candidateSlug)) {
          slug = candidateSlug;
        }
      } else if (record.recordType === 'text') {
        text = decoded;
        if (!slug) {
          const candidateSlug = extractSlugFromUrl(decoded) ?? decoded.toLowerCase();
          if (getCookbookBySlug(candidateSlug)) {
            slug = candidateSlug;
          }
        }
      }
    } catch {
      // Ignore malformed individual NDEF records and continue inspecting others.
    }
  }

  return { url, slug, text };
}

/**
 * Resolves a scanned card following AGENTS.md priority:
 * 1) NDEF URL (/book/:slug) -> 2) Local UID mapping -> 3) Unknown card flow.
 */
export function resolveCardDestination(params: {
  uid?: string | null;
  url?: string | null;
  mappings: Record<string, CardMapping>;
}): CardResolution {
  const normalizedUid = params.uid ? normalizeUid(params.uid) : null;
  const rawUrl = params.url ?? null;

  if (rawUrl) {
    const slugFromUrl = extractSlugFromUrl(rawUrl);
    if (slugFromUrl && getCookbookBySlug(slugFromUrl)) {
      return {
        kind: 'resolved',
        cookbookSlug: slugFromUrl,
        resolvedBy: 'ndef-url',
        uid: normalizedUid,
        rawUrl,
      };
    }
  }

  if (normalizedUid) {
    const mapping = params.mappings[normalizedUid];
    if (mapping && getCookbookBySlug(mapping.cookbookSlug)) {
      return {
        kind: 'resolved',
        cookbookSlug: mapping.cookbookSlug,
        resolvedBy: 'uid-mapping',
        uid: normalizedUid,
        rawUrl,
      };
    }
  }

  return {
    kind: 'unknown',
    uid: normalizedUid,
    rawUrl,
  };
}
