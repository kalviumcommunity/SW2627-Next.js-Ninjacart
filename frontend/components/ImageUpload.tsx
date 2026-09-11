"use client";

import React, { useState, useRef, useEffect } from "react";
import { uploadImage } from "@/lib/api";

export interface UploadResult {
  url: string;
  publicId: string;
}

export interface ImageUploadProps {
  /**
   * Callback fired when Cloudinary upload succeeds.
   * Delivers both the Cloudinary URL and publicId.
   */
  onUploadSuccess?: (result: UploadResult) => void;

  /**
   * General upload callback (also delivers null on removal)
   */
  onImageUpload?: (result: UploadResult | null) => void;

  /**
   * Callback fired when file is selected or cleared (for backwards compatibility)
   */
  onImageSelect?: (file: File | null) => void;

  /**
   * Callback fired on upload failure
   */
  onUploadError?: (error: string) => void;

  /**
   * Optional initial image URL for pre-existing records
   */
  initialImageUrl?: string | null;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function ImageUpload({
  onUploadSuccess,
  onImageUpload,
  onImageSelect,
  onUploadError,
  initialImageUrl,
  disabled = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImageUrl || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(Boolean(initialImageUrl));
  const [uploadedResult, setUploadedResult] = useState<UploadResult | null>(
    initialImageUrl ? { url: initialImageUrl, publicId: "" } : null
  );
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = async (file: File) => {
    // Reset previous error
    setError(null);

    // 1. Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      const err = "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.";
      setError(err);
      onUploadError?.(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 2. Validate file size (<= 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = `File size exceeds 5MB limit (${formatFileSize(file.size)}). Please select a smaller image.`;
      setError(err);
      onUploadError?.(err);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Revoke previous blob if any
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    // Create immediate local preview
    const localBlobUrl = URL.createObjectURL(file);
    previewUrlRef.current = localBlobUrl;
    setPreview(localBlobUrl);
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setUploadSuccess(false);
    setUploadedResult(null);

    // Notify parent of raw file selection (compatibility)
    onImageSelect?.(file);

    // 3. Initiate real Cloudinary upload
    setIsUploading(true);

    try {
      const result = await uploadImage(file);

      if (!result?.url || !result?.publicId) {
        throw new Error("Cloudinary did not return a valid URL or public ID.");
      }

      const uploadData: UploadResult = {
        url: result.url,
        publicId: result.publicId,
      };

      setUploadedResult(uploadData);
      setUploadSuccess(true);
      setError(null);

      // Return real Cloudinary URL & publicId to parent
      onUploadSuccess?.(uploadData);
      onImageUpload?.(uploadData);
    } catch (uploadErr) {
      const message =
        uploadErr instanceof Error
          ? uploadErr.message
          : "Image upload failed. Please try again.";
      setError(message);
      setUploadSuccess(false);
      setUploadedResult(null);
      onUploadError?.(message);
      onImageUpload?.(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
    setPreview(null);
    setFileName(null);
    setFileSize(null);
    setUploadSuccess(false);
    setUploadedResult(null);
    setError(null);
    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onImageSelect?.(null);
    onImageUpload?.(null);
  };

  return (
    <div
      style={{
        border: error ? "2px dashed #f87171" : uploadSuccess ? "2px solid #10b981" : "2px dashed #cbd5e1",
        borderRadius: "12px",
        padding: "1.25rem",
        backgroundColor: uploadSuccess ? "#f0fdf4" : error ? "#fef2f2" : "#f8fafc",
        transition: "all 0.2s ease",
      }}
    >
      <input
        ref={fileInputRef}
        id="produce-image-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        style={{ display: "none" }}
      />

      {/* State 1: Uploading */}
      {isUploading && (
        <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
          {preview && (
            <div style={{ marginBottom: "1rem" }}>
              <img
                src={preview}
                alt="Uploading Preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  margin: "0 auto",
                  display: "block",
                  opacity: 0.7,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          )}
          <div
            style={{
              display: "inline-block",
              width: "32px",
              height: "32px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#10b981",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "0.5rem",
            }}
          />
          <p style={{ fontWeight: 700, color: "#065f46", fontSize: "0.95rem", margin: 0 }}>
            Uploading to Cloudinary...
          </p>
          <p style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.25rem" }}>
            Optimizing image and securing storage
          </p>
        </div>
      )}

      {/* State 2: Uploaded Successfully */}
      {!isUploading && uploadSuccess && preview && (
        <div>
          <div style={{ display: "flex", gap: "1.25rem", alignItems: "center" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <img
                src={uploadedResult?.url || preview}
                alt="Uploaded produce"
                style={{
                  width: "110px",
                  height: "110px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "2px solid #10b981",
                  boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
                  display: "block",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "-6px",
                  right: "-6px",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 900,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                ✓
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  marginBottom: "0.35rem",
                }}
              >
                <span>☁️</span> Uploaded to Cloudinary
              </div>
              {fileName && (
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fileName}
                </p>
              )}
              {fileSize && (
                <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.15rem 0 0" }}>
                  Size: {fileSize}
                </p>
              )}
              {uploadedResult?.publicId && (
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#059669",
                    margin: "0.25rem 0 0",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "280px",
                  }}
                  title={uploadedResult.publicId}
                >
                  ID: {uploadedResult.publicId}
                </p>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                style={{
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#334155",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                style={{
                  padding: "0.45rem 0.85rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  backgroundColor: "#ffffff",
                  color: "#dc2626",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State 3: Error Occurred */}
      {!isUploading && error && (
        <div style={{ marginBottom: "0.75rem" }}>
          <div
            role="alert"
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              color: "#b91c1c",
              padding: "0.65rem 0.85rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Select Another Image
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              style={{
                padding: "0.5rem 0.85rem",
                backgroundColor: "#f8fafc",
                color: "#64748b",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* State 4: Idle / Empty Dropzone */}
      {!isUploading && !uploadSuccess && !error && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          style={{
            cursor: disabled ? "not-allowed" : "pointer",
            textAlign: "center",
            padding: "1.5rem 1rem",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#e0f2fe",
              color: "#0284c7",
              fontSize: "1.5rem",
              marginBottom: "0.75rem",
            }}
          >
            📷
          </div>
          <p style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.95rem", margin: "0 0 0.25rem" }}>
            Click to select produce photograph
          </p>
          <p style={{ color: "#64748b", fontSize: "0.8rem", margin: 0 }}>
            Supports JPEG, PNG, WebP, GIF (Max 5MB)
          </p>
          <button
            type="button"
            disabled={disabled}
            style={{
              marginTop: "0.85rem",
              padding: "0.5rem 1.15rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Choose Image File
          </button>
        </div>
      )}
    </div>
  );
}