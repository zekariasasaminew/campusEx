"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IMAGE_CONSTRAINTS } from "@/lib/marketplace/constants";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  images: File[];
  errors: Record<string, string>;
  onChange: (images: File[]) => void;
}

export function ImageUpload({ images, errors, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      images.forEach((file) => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }
      if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
        return false;
      }
      return true;
    });

    const combined = [...images, ...validFiles];
    const limited = combined.slice(0, IMAGE_CONSTRAINTS.maxCount);
    onChange(limited);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const maxSizeMB = IMAGE_CONSTRAINTS.maxSizeBytes / 1024 / 1024;

  return (
    <div className={styles.section}>
      <div>
        <h3 className={styles.sectionTitle}>Photos</h3>
        <p className={styles.hint}>
          Add up to {IMAGE_CONSTRAINTS.maxCount} photos (max {maxSizeMB}MB each)
        </p>
      </div>

      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className={styles.dropzoneContent}>
          <svg
            className={styles.uploadIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p>Click to upload or drag and drop</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {errors.images && <div className={styles.error}>{errors.images}</div>}

      {images.length > 0 && (
        <div className={styles.previews}>
          {images.map((file, index) => (
            <div key={index} className={styles.preview}>
              <div className={styles.imageWrapper}>
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  fill
                  className={styles.image}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className={styles.removeButton}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
