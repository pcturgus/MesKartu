// Pulls the object path back out of a Supabase Storage public URL, so a
// delete action can best-effort remove the file from the bucket. Safe to
// import on the server (no DOM APIs).
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
