"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createProduct, uploadImage, type CreateProductData, type ProduceCategory } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";

export default function AddProducePage() {
  const { user, role, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProduceCategory>("VEGETABLES");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const effectiveRole = role || user?.role;
  const isFarmer = effectiveRole === "FARMER";

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    if (!isAuthenticated) {
      setError("You must be logged in as a farmer to list produce.");
      router.push("/login?redirect=/farmer/add-produce");
      return;
    }

    if (!isFarmer) {
      setError("Only registered farmers are authorized to create produce listings.");
      return;
    }

    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const parsedMinOrderQuantity = Number(minOrderQuantity);

    // Validation
    if (!name.trim()) {
      setError("Produce name is required.");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required (e.g. kg, box, bag, bunch).");
      return;
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid non-negative wholesale price.");
      return;
    }
    if (!quantity || !Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      setError("Enter a valid non-negative available quantity.");
      return;
    }
    if (!minOrderQuantity || !Number.isFinite(parsedMinOrderQuantity) || parsedMinOrderQuantity <= 0) {
      setError("Enter a valid minimum order quantity (must be greater than 0).");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      // Upload image first if provided
      if (image) {
        try {
          const uploadResult = await uploadImage(image);
          imageUrl = uploadResult?.url || null;
          imagePublicId = uploadResult?.publicId || null;
        } catch (uploadErr) {
          console.warn("Image upload issue:", uploadErr);
          // Non-blocking if mock/local
        }
      }

      // Create product object
      const product: CreateProductData = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        price: parsedPrice,
        unit: unit.trim(),
        quantity: parsedQuantity,
        minOrderQuantity: parsedMinOrderQuantity,
        imageUrl: imageUrl || undefined,
        imagePublicId: imagePublicId || undefined,
      };

      // Send product to backend
      const result = await createProduct(product);
      setSuccess(`"${result?.name || name.trim()}" has been listed on the wholesale catalogue successfully.`);

      // Clear form after successful submission
      setName("");
      setDescription("");
      setCategory("VEGETABLES");
      setPrice("");
      setUnit("kg");
      setQuantity("");
      setMinOrderQuantity("1");
      setImage(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to publish produce. Please check authentication and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // 1. Loading state
  if (isAuthLoading) {
    return (
      <div style={{ maxWidth: "800px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            width: "48px",
            height: "48px",
            border: "4px solid #e2e8f0",
            borderTopColor: "#10b981",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "1rem", color: "#64748b" }}>Checking authorization...</p>
      </div>
    );
  }

  // 2. Unauthenticated State (Block product listing before login)
  if (!isAuthenticated) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#fef3c7",
            color: "#d97706",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🔒
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Sign In Required
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          You must be logged in as a registered <strong>Farmer</strong> to create and publish produce listings to the Ninjacart wholesale catalogue.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/login"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
              boxShadow: "0 2px 4px rgba(16, 185, 129, 0.2)",
            }}
          >
            Sign In to Continue
          </Link>

          <Link
            href="/register"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#f8fafc",
              color: "#334155",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "1px solid #cbd5e1",
              textDecoration: "none",
            }}
          >
            Create a Farmer Account
          </Link>

          <Link
            href="/catalogue"
            style={{
              padding: "0.5rem",
              color: "#64748b",
              fontSize: "0.875rem",
              textDecoration: "none",
            }}
          >
            Browse Public Catalogue
          </Link>
        </div>
      </div>
    );
  }

  // 3. Authenticated as non-Farmer (Role restriction)
  if (!isFarmer) {
    return (
      <div
        style={{
          maxWidth: "540px",
          margin: "4rem auto",
          padding: "2.5rem",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #fee2e2",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            fontSize: "1.75rem",
            marginBottom: "1.25rem",
          }}
        >
          🚫
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Farmer Portal Access Only
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Your current account is registered with the role <strong>{effectiveRole || "Retailer"}</strong>. Only registered farmer accounts have permissions to add and manage wholesale produce listings.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <Link
            href="/catalogue"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "0.95rem",
              textDecoration: "none",
            }}
          >
            Browse Wholesale Catalogue
          </Link>

          <Link
            href="/orders"
            style={{
              padding: "0.85rem 1.5rem",
              backgroundColor: "#f8fafc",
              color: "#334155",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.95rem",
              border: "1px solid #cbd5e1",
              textDecoration: "none",
            }}
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // 4. Authorized Farmer View
  return (
    <div style={{ maxWidth: "780px", margin: "2rem auto", padding: "0 1.5rem 4rem" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
          borderRadius: "16px",
          padding: "2rem",
          color: "#ffffff",
          marginBottom: "2rem",
          boxShadow: "0 4px 12px rgba(6, 95, 70, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}>🚜</span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#a7f3d0" }}>
            Farmer Portal
          </span>
        </div>
        <h1 style={{ fontSize: "1.85rem", fontWeight: 800, marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          List New Produce
        </h1>
        <p style={{ color: "#d1fae5", fontSize: "0.95rem" }}>
          Publish fresh farm harvest directly to verified retailers at transparent wholesale prices.
        </p>
      </div>

      {/* Form Container */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.85rem 1rem",
              borderRadius: "10px",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: "0.35rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>✅</span> Listing Published Successfully!
            </div>
            <p style={{ fontSize: "0.875rem", margin: 0, color: "#047857" }}>{success}</p>
            <div style={{ marginTop: "0.85rem", display: "flex", gap: "0.75rem" }}>
              <Link
                href="/catalogue"
                style={{
                  padding: "0.45rem 0.9rem",
                  backgroundColor: "#10b981",
                  color: "#ffffff",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                View in Catalogue →
              </Link>
              <Link
                href="/farmer/dashboard"
                style={{
                  padding: "0.45rem 0.9rem",
                  backgroundColor: "#ffffff",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Produce Name */}
          <div>
            <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
              Produce Name *
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g., Organic Roma Tomatoes, Shimla Red Apples"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
          </div>

          {/* Category & Unit in Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="category" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProduceCategory)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="VEGETABLES">🥦 Vegetables</option>
                <option value="FRUITS">🍎 Fruits</option>
                <option value="GRAINS">🌾 Grains</option>
                <option value="TUBERS">🥔 Tubers</option>
                <option value="HERBS">🌿 Herbs & Greens</option>
                <option value="DAIRY">🥛 Dairy</option>
                <option value="OTHER">📦 Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="unit" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                Unit of Measure *
              </label>
              <input
                id="unit"
                type="text"
                placeholder="kg, box, bag, bunch, litre"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Price, Quantity, Min Order in Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label htmlFor="price" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                Price per Unit (₹) *
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 35.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label htmlFor="quantity" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                Available Stock *
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label htmlFor="minOrderQuantity" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                Min Order Quantity *
              </label>
              <input
                id="minOrderQuantity"
                type="number"
                min="1"
                placeholder="e.g. 10"
                value={minOrderQuantity}
                onChange={(e) => setMinOrderQuantity(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
              Harvest Description & Origin Notes
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide details about farm location, grade, freshness, organic certification, and packaging..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid #cbd5e1",
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
              }}
            />
          </div>

          {/* Produce Image Upload */}
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
              Produce Photo
            </label>
            <ImageUpload onImageSelect={setImage} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "0.95rem 1.75rem",
              backgroundColor: isSubmitting ? "#94a3b8" : "#10b981",
              color: "#ffffff",
              borderRadius: "10px",
              fontWeight: 700,
              fontSize: "1rem",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
              transition: "background-color 0.2s ease",
            }}
          >
            {isSubmitting ? "Publishing Produce..." : "🌱 Publish Produce Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}