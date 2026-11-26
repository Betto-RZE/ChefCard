// Type declarations for the Web NFC API (Chrome/Edge on Android)

export interface NDEFRecordInit {
  recordType: string;
  mediaType?: string;
  id?: string;
  encoding?: string;
  lang?: string;
  data?: BufferSource | string | NDEFMessageInit;
}

export interface NDEFMessageInit {
  records: NDEFRecordInit[];
}

export interface NDEFRecord {
  readonly recordType: string;
  readonly mediaType?: string;
  readonly id?: string;
  readonly data?: DataView;
  readonly encoding?: string;
  readonly lang?: string;
  toRecords?(): NDEFRecord[];
}

export interface NDEFMessage {
  readonly records: ReadonlyArray<NDEFRecord>;
}

export interface NDEFReadingEvent extends Event {
  readonly serialNumber: string;
  readonly message: NDEFMessage;
}

export interface NDEFScanOptions {
  signal?: AbortSignal;
}

export interface NDEFWriteOptions {
  overwrite?: boolean;
  signal?: AbortSignal;
}

export declare class NDEFReader extends EventTarget {
  constructor();
  onreading: ((event: NDEFReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  scan(options?: NDEFScanOptions): Promise<void>;
  write(
    message: string | BufferSource | NDEFMessageInit,
    options?: NDEFWriteOptions,
  ): Promise<void>;
}

declare global {
  interface Window {
    NDEFReader?: typeof NDEFReader;
  }
}
