"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageOff, Upload } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/lib/types";

const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;

/**
 * Browse the shared `lab-assets/content` image pool and pick one to insert,
 * or upload a new image (which is then added to the pool and selectable).
 */
export function MediaLibrary({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("lab-assets")
      .list("content", {
        limit: 200,
        sortBy: { column: "created_at", order: "desc" },
      });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    const imgs: MediaAsset[] = (data ?? [])
      .filter((f) => f.id && IMAGE_RE.test(f.name))
      .map((f) => {
        const path = `content/${f.name}`;
        const {
          data: { publicUrl },
        } = supabase.storage.from("lab-assets").getPublicUrl(path);
        return { name: f.name, path, url: publicUrl, created_at: f.created_at ?? null };
      });
    setAssets(imgs);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Fetch the pool when the modal opens; load() sets its own loading state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) load();
  }, [open, load]);

  const upload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `content/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("lab-assets")
        .upload(path, file, { upsert: false });
      if (error) {
        setError(error.message);
        setUploading(false);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("lab-assets").getPublicUrl(path);
      setUploading(false);
      onSelect(publicUrl);
      onClose();
    },
    [onSelect, onClose]
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Image pool"
      description="Pick an image you've used before, or upload a new one."
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading…" : `${assets.length} image${assets.length === 1 ? "" : "s"}`}
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Spinner /> : <Upload className="size-4" />}
          Upload new
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-video animate-pulse rounded-lg border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border py-12 text-center">
          <ImageOff className="size-7 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium">No images yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload one to start building your pool.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((a) => (
            <li key={a.path}>
              <button
                type="button"
                onClick={() => {
                  onSelect(a.url);
                  onClose();
                }}
                title={a.name}
                className="group relative block aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted/30 transition-colors duration-150 ease-[var(--ease-out)] hover:border-ring active:scale-[0.98]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt={a.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
