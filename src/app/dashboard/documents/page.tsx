import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { DocumentUploader } from "./DocumentUploader";
import { DocumentList } from "./DocumentList";

export const metadata: Metadata = {
  title: "Document Vault",
  description: "Securely store and manage your passport, visa, and travel documents.",
};

export default async function DocumentsPage() {
  const user = await requireUser();
  const supabase = createClient();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("uploaded_at", { ascending: false });

  const totalBytes = (documents || []).reduce((sum, d) => sum + (d.file_size_bytes || 0), 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return (
    <div>
      <div className="text-xs font-mono text-ink-faint mb-2">Dashboard / My Documents</div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl">Document Vault</h1>
          <p className="text-ink-soft text-sm mt-1">Upload once, reuse across every application.</p>
        </div>
      </div>

      <div className="bg-panel border border-line rounded-lg p-5 mb-6 flex items-center gap-5">
        <div className="text-xs font-mono text-ink-faint whitespace-nowrap">{totalMB} MB used</div>
        <div className="flex-1 h-2 bg-green-pale rounded-full overflow-hidden">
          <div
            className="h-full bg-green-mid rounded-full"
            style={{ width: `${Math.min((totalBytes / (1024 * 1024 * 1024)) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs font-mono text-ink-faint whitespace-nowrap">of 1 GB</div>
      </div>

      <div className="bg-panel border border-line rounded-lg p-6 mb-6">
        <DocumentUploader userId={user.id} />
      </div>

      <div className="bg-panel border border-line rounded-lg p-6">
        <h2 className="font-display text-lg mb-4">Your Documents</h2>
        <DocumentList documents={(documents as any) || []} />
      </div>
    </div>
  );
}
