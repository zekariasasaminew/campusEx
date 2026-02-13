"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IMAGE_CONSTRAINTS } from "@/lib/marketplace/constants";
import { compressImages } from "@/lib/marketplace/image-utils";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
  images: File[];
  errors: Record<string, string>;
  onChange: (images: File[]) => void;
}

export function ImageUpload({ images, errors, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

  useEffect(() => {
    return () => {
      images.forEach((file) => {
        const url = URL.createObjectURL(file);
        URL.revokeObjectURL(url);
      });
    };
  }, [images]);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        return false;
      }
      // Check if file is too large BEFORE compression
      if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes * 2) {
        // Allow 2x limit since we'll compress
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setCompressing(true);
      setCompressionProgress(0);

      // Compress images to reduce size
      const compressedFiles = await compressImages(
        validFiles,
        (current, total) => {
          setCompressionProgress(Math.round((current / total) * 100));
        },
      );

      const combined = [...images, ...compressedFiles];
      const limited = combined.slice(0, IMAGE_CONSTRAINTS.maxCount);
      onChange(limited);
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setCompressing(false);
      setCompressionProgress(0);
    }
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

  return (
    <div className={styles.section}>
      <div>
        <h3 className={styles.sectionTitle}>Photos</h3>
        <p className={styles.hint}>
          Add up to {IMAGE_CONSTRAINTS.maxCount} photos (optimized
          automatically)
        </p>
      </div>

      <div
        className={`${styles.dropzone} ${dragActive ? styles.active : ""} ${compressing ? styles.disabled : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          if (!compressing) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => !compressing && fileInputRef.current?.click()}
      >
        <div className={styles.dropzoneContent}>
          {compressing ? (
            <>
              <div className={styles.spinner} />
              <p>Optimizing images... {compressionProgress}%</p>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={compressing}
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
