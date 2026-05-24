"use client";

/* eslint-disable @next/next/no-img-element */

import { FileTextIcon, ImageIcon, XIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploadZoneProps = {
  label: string;
  accept: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  currentUrl?: string | null;
  required?: boolean;
};

function isImage(file: File | null) {
  return Boolean(file?.type.startsWith("image/"));
}

export function FileUploadZone({
  label,
  accept,
  file,
  onFileChange,
  currentUrl,
  required,
}: FileUploadZoneProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !isImage(file)) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </label>
        {file ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onFileChange(null)}
          >
            <XIcon data-icon="inline-start" />
            Remove
          </Button>
        ) : null}
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-primary/25 bg-primary/5 p-4 text-center transition-colors hover:bg-primary/10",
          file && "border-solid border-primary/30 bg-primary/10"
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFileChange(event.dataTransfer.files.item(0));
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Selected file preview"
            className="size-24 rounded-lg object-cover"
          />
        ) : file?.type === "application/pdf" ? (
          <div className="flex flex-col items-center gap-2">
            <FileTextIcon className="text-muted-foreground" />
            <span className="max-w-64 truncate text-sm">{file.name}</span>
          </div>
        ) : currentUrl ? (
          <img
            src={currentUrl}
            alt="Current uploaded file"
            className="size-24 rounded-lg object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Drop a file or click to upload</div>
              <div className="text-xs text-muted-foreground">
                Images up to 5MB. PDFs up to 10MB.
              </div>
            </div>
          </div>
        )}
      </label>

      <input
        id={inputId}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => {
          onFileChange(event.target.files?.item(0) ?? null);
          event.currentTarget.value = "";
        }}
      />
    </div>
  );
}
