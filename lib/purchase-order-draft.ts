import type { PurchaseOrderFields } from "./purchase-order-ui";
import type { RequestKind } from "./requests-ui";

export type PurchaseOrderDraft = {
  fields: PurchaseOrderFields;
  file: File | null;
  fileName?: string;
  kind?: RequestKind;
};

const STORAGE_KEY = "vc-purchase-order-draft";
const DB_NAME = "vc-purchase-order";
const STORE = "files";

let draft: PurchaseOrderDraft | null = null;

function readStoredMeta(): Omit<PurchaseOrderDraft, "file"> | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      fields?: PurchaseOrderFields;
      kind?: RequestKind;
      fileName?: string;
    };
    if (!parsed?.fields) return null;
    return {
      fields: parsed.fields,
      kind: parsed.kind,
      fileName: parsed.fileName,
    };
  } catch {
    return null;
  }
}

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFile(file: File) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, "draft");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

async function loadFile() {
  try {
    const db = await openDb();
    const file = await new Promise<File | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).get("draft");
      request.onsuccess = () => resolve((request.result as File | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return file;
  } catch {
    return null;
  }
}

async function deleteFile() {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete("draft");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

export async function persistPurchaseOrderDraft(next: PurchaseOrderDraft) {
  draft = next;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fields: next.fields,
        kind: next.kind,
        fileName: next.file?.name || next.fileName || "",
      }),
    );
  } catch {
    /* ignore */
  }
  if (next.file) {
    try {
      await saveFile(next.file);
    } catch {
      /* ignore */
    }
  }
}

export function getPurchaseOrderDraft() {
  if (draft?.fields) return draft;
  const meta = readStoredMeta();
  if (!meta) return null;
  return { ...meta, file: null };
}

export async function getPurchaseOrderDraftAsync(): Promise<PurchaseOrderDraft | null> {
  const current = getPurchaseOrderDraft();
  if (!current) return null;
  if (current.file) return current;
  const file = await loadFile();
  const next = {
    ...current,
    file,
    fileName: current.fileName || file?.name,
  };
  draft = next;
  return next;
}

export function clearPurchaseOrderDraft() {
  draft = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  void deleteFile();
}
