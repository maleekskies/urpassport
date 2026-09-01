"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordDocument } from "./actions";

const DOCUMENT_TYPES = [
  "Identity",
  "Financial",
  "Letters",
  "Photos",
  "Other",
];

export function DocumentUploader({ userId }: { userId: string }) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0]);
  const [expiryDate, setExpiryDate] = useState("");

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is larger than 10MB.");
      }
      const path = `${userId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      await recordDocument({
        documentType: docType,
        filePath: path,
        fileName: file.name,
        fileSizeBytes: file.size,
        expiryDate: expiryDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 gap-y-2 mb-3 flex-wrap">
        <label className="text-xs font-semibold text-ink-soft">Category:</label>
        <select
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="border border-line rounded-md px-3 py-1.5 text-sm"
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label className="text-xs font-semibold text-ink-soft sm:ml-2">Expires (optional):</label>
        <input
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          className="border border-line rounded-md px-3 py-1.5 text-sm"
        />
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-line rounded-lg p-10 text-center bg-panel cursor-pointer hover:border-green-mid hover:bg-green-pale transition-colors"
      >
        <div className="text-2xl text-green-mid mb-2.5">⇪</div>
        <div className="font-semibold text-sm mb-1">
          {uploading ? "Uploading..." : "Click to choose a file"}
        </div>
        <div className="text-ink-faint text-sm">PDF, JPG, PNG up to 10MB</div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
      {error && <p className="text-red text-sm mt-2.5">{error}</p>}
    </div>
  );
}
