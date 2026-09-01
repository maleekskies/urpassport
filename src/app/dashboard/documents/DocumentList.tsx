"use client";

import { useTransition } from "react";
import { deleteDocument } from "./actions";

interface DocRow {
  id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  file_size_bytes: number | null;
  verification_status: string;
  uploaded_at: string;
  expiry_date: string | null;
}

function expiryBadge(expiryDate: string | null): { label: string; className: string } | null {
  if (!expiryDate) return null;
  const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { label: "Expired", className: "bg-red-soft text-red" };
  if (days <= 30) return { label: `Expires in ${days}d`, className: "bg-red-soft text-red" };
  if (days <= 90) return { label: `Expires in ${days}d`, className: "bg-gold-soft text-[#8a6a1c]" };
  return { label: `Expires ${expiryDate}`, className: "bg-green-pale text-green-mid" };
}

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-green-pale text-green-mid",
  pending: "bg-gold-soft text-[#8a6a1c]",
  rejected: "bg-red-soft text-red",
};

export function DocumentList({ documents }: { documents: DocRow[] }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, filePath: string) {
    if (!confirm("Delete this document?")) return;
    startTransition(() => {
      deleteDocument(id, filePath);
    });
  }

  if (documents.length === 0) {
    return (
      <p className="text-ink-soft text-sm text-center py-8">
        No documents uploaded yet — use the box above to add your first one.
      </p>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-3.5">
      {documents.map((doc) => (
        <div key={doc.id} className="border border-line rounded-md p-3.5 flex gap-2.5">
          <div className="w-8 h-8 rounded-md bg-green-pale text-green-deep flex items-center justify-center text-sm flex-shrink-0">
            ▤
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div className="font-semibold text-sm truncate">{doc.file_name}</div>
              <span
                className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
                  STATUS_STYLES[doc.verification_status] || STATUS_STYLES.pending
                }`}
              >
                {doc.verification_status}
              </span>
            </div>
            <div className="text-ink-faint text-xs font-mono mt-0.5">
              {doc.file_size_bytes ? `${Math.round(doc.file_size_bytes / 1024)} KB` : ""} ·{" "}
              {doc.document_type}
            </div>
            {expiryBadge(doc.expiry_date) && (
              <span
                className={`inline-block text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full mt-1.5 ${
                  expiryBadge(doc.expiry_date)!.className
                }`}
              >
                {expiryBadge(doc.expiry_date)!.label}
              </span>
            )}
            <button
              onClick={() => handleDelete(doc.id, doc.file_url)}
              disabled={isPending}
              className="text-red text-xs font-semibold mt-2"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
