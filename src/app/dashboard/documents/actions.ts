"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

// Called after the browser has already uploaded the file straight to
// Supabase Storage (see DocumentUploader.tsx) — this just records the
// metadata row so it shows up in the vault list.
export async function recordDocument(input: {
  documentType: string;
  filePath: string;
  fileName: string;
  fileSizeBytes: number;
  expiryDate?: string | null;
}) {
  const user = await requireUser();
  const supabase = createClient();

  const { error } = await supabase.from("documents").insert({
    user_id: user.id,
    document_type: input.documentType,
    file_url: input.filePath,
    file_name: input.fileName,
    file_size_bytes: input.fileSizeBytes,
    verification_status: "pending",
    expiry_date: input.expiryDate || null,
  });

  if (error) throw error;
  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}

export async function deleteDocument(documentId: string, filePath: string) {
  const user = await requireUser();
  const supabase = createClient();

  const { data: doc } = await supabase
    .from("documents")
    .select("user_id")
    .eq("id", documentId)
    .single();

  if (!doc || doc.user_id !== user.id) {
    throw new Error("Document not found");
  }

  await supabase.storage.from("documents").remove([filePath]);
  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) throw error;

  revalidatePath("/dashboard/documents");
  revalidatePath("/dashboard");
}
