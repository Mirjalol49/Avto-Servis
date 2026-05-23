import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { validateUploadFile } from "@/lib/cars/validation";
import { getSupabaseServiceRoleClient } from "@/lib/supabase";

function extensionForFile(file: File) {
  const fromName = extname(file.name).replace(".", "").toLowerCase();

  if (fromName) {
    return fromName;
  }

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return "bin";
  }
}

function pathFromPublicUrl(url: string, bucket: string) {
  const parsedUrl = new URL(url);
  const marker = `/storage/v1/object/public/${bucket}/`;
  const markerIndex = parsedUrl.pathname.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error("File URL does not match the configured storage bucket");
  }

  return decodeURIComponent(parsedUrl.pathname.slice(markerIndex + marker.length));
}

export async function uploadFile(file: File, bucket: string, folder: string) {
  validateUploadFile(file);

  const supabase = getSupabaseServiceRoleClient();
  const extension = extensionForFile(file);
  const filePath = `${folder}/${Date.now()}-${randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteFile(url: string, bucket: string) {
  const supabase = getSupabaseServiceRoleClient();
  const filePath = pathFromPublicUrl(url, bucket);
  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}
