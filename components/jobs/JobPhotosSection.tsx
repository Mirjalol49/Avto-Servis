"use client";

/* eslint-disable @next/next/no-img-element */

import type { JobPhotoType } from "@prisma/client";
import { ImagePlusIcon, Loader2Icon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";

import { addPhotos, deletePhoto } from "@/actions/jobs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type JobPhoto = {
  id: string;
  url: string;
  type: JobPhotoType;
};

type JobPhotosSectionProps = {
  jobId: string;
  type: JobPhotoType;
  photos: JobPhoto[];
};

const maxPhotos = 10;
const maxPhotoSize = 5 * 1024 * 1024;

export function JobPhotosSection({ jobId, type, photos }: JobPhotosSectionProps) {
  const inputId = useId();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!uploading) {
      setProgress(0);
      return undefined;
    }

    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 12, 92));
    }, 250);

    return () => window.clearInterval(interval);
  }, [uploading]);

  function setFiles(files: FileList | File[]) {
    const nextFiles = Array.from(files);

    if (photos.length + nextFiles.length > maxPhotos) {
      toast.error("A maximum of 10 photos is allowed");
      return;
    }

    const invalidFile = nextFiles.find(
      (file) => !file.type.startsWith("image/") || file.size > maxPhotoSize
    );

    if (invalidFile) {
      toast.error("Each photo must be an image and 5MB or smaller");
      return;
    }

    setSelectedFiles(nextFiles);
  }

  async function uploadSelectedFiles() {
    if (selectedFiles.length === 0) {
      toast.error("Select photos first");
      return;
    }

    setUploading(true);

    try {
      await addPhotos(jobId, type, selectedFiles);
      setProgress(100);
      toast.success("Photos uploaded");
      setSelectedFiles([]);
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not upload photos");
    } finally {
      setUploading(false);
    }
  }

  async function removePhoto(photoId: string) {
    try {
      await deletePhoto(photoId);
      toast.success("Photo deleted");
      router.refresh();
    } catch (caught) {
      toast.error(caught instanceof Error ? caught.message : "Could not delete photo");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {photos.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-muted/30">
              <img src={photo.url} alt={`${type.toLowerCase()} job photo`} className="aspect-square w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                className="absolute right-2 top-2 opacity-90"
                onClick={() => removePhoto(photo.id)}
              >
                <Trash2Icon />
                <span className="sr-only">Delete photo</span>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No photos uploaded.</p>
      )}

      {uploading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: Math.max(selectedFiles.length, 1) }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full" />
          ))}
        </div>
      ) : null}

      <label
        htmlFor={inputId}
        className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4 text-center transition-colors hover:bg-primary/10"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setFiles(event.dataTransfer.files);
        }}
      >
        <ImagePlusIcon className="text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">Drop photos or click to select</div>
          <div className="text-xs text-muted-foreground">
            Multiple images, 5MB each, up to 10 photos total.
          </div>
        </div>
      </label>
      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          if (event.target.files) {
            setFiles(event.target.files);
          }
          event.currentTarget.value = "";
        }}
      />

      {selectedFiles.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-muted/30 p-3">
          <div className="text-sm">{selectedFiles.length} file(s) selected</div>
          {uploading ? (
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          ) : null}
          <Button type="button" className="w-fit" disabled={uploading} onClick={uploadSelectedFiles}>
            {uploading ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : null}
            Upload
          </Button>
        </div>
      ) : null}
    </div>
  );
}
