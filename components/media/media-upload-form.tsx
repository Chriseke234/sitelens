"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { UploadCloud, FileImage, ShieldCheck, AlertCircle } from "lucide-react";

export function MediaUploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selected: File) => {
    setError(null);
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selected.type)) {
      setError("Please select a JPEG, PNG, or WebP image file.");
      setFile(null);
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit.");
      setFile(null);
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.scanId) {
        router.push(`/media/${json.scanId}`);
      } else {
        setError(json.error || "Failed to analyze media file.");
      }
    } catch (err) {
      setError("Network error during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
            : "border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50"
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          Drag and drop your image here, or{" "}
          <label className="cursor-pointer font-bold text-blue-600 hover:underline dark:text-blue-400">
            browse file
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </p>
        <p className="text-xs text-slate-400 mt-1">Supports JPEG, PNG, WebP up to 10MB</p>

        {file && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            <FileImage className="h-4 w-4 text-blue-600" />
            <span className="truncate max-w-[200px]">{file.name}</span>
            <span className="text-slate-400">({(file.size / 1024).toFixed(0)} KB)</span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" disabled={!file || loading} className="w-full gap-2">
        {loading ? (
          <>
            <Spinner className="h-4 w-4" />
            <span>Analyzing Image Authenticity Signals...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Scan Image Authenticity</span>
          </>
        )}
      </Button>
    </form>
  );
}
