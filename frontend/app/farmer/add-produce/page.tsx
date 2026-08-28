"use client";
import { useState } from "react";
import { createProduct, uploadImage, type Product } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";
export default function AddProducePage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] =
    useState<Product["category"]>("VEGETABLES");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderQuantity, setMinOrderQuantity] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function handlePublish() {
    if (isSubmitting) return;
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);
    const parsedMinOrderQuantity = Number(minOrderQuantity);
    // Validation
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!unit.trim()) {
      setError("Unit is required.");
      return;
    }
    if (!price || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setError("Enter a valid non-negative price.");
      return;
    }
    if (
      !quantity ||
      !Number.isFinite(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setError("Enter a valid non-negative quantity.");
      return;
    }
    if (
      !minOrderQuantity ||
      !Number.isFinite(parsedMinOrderQuantity) ||
      parsedMinOrderQuantity <= 0
    ) {
      setError("Enter a valid minimum order quantity.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;
      // Upload image first
      if (image) {
        try {
          const uploadResult = await uploadImage(image);
          imageUrl = uploadResult.url;
          imagePublicId = uploadResult.publicId;
        } catch {
          throw new Error(
            "Image upload failed. Please try again."
          );
        }
      }
      // Create product object
      const product: Product = {
        name: name.trim(),
        description: description.trim(),
        category,
        price: parsedPrice,
        unit: unit.trim(),
        quantity: parsedQuantity,
        minOrderQuantity: parsedMinOrderQuantity,
        imageUrl,
        imagePublicId,
      };
      // Send product to backend
      await createProduct(product);
      setSuccess("Produce published successfully.");
      // Clear form after successful submission
      setName("");
      setDescription("");
      setCategory("VEGETABLES");
      setPrice("");
      setUnit("");
      setQuantity("");
      setMinOrderQuantity("");
      setImage(null);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to publish produce."
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <main>
      <h1>Add Produce</h1>
      <div>
        <label htmlFor="name">Produce Name</label>
        <input
          id="name"
          type="text"
          placeholder="Enter produce name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as Product["category"])
          }
        >
          <option value="VEGETABLES">Vegetables</option>
          <option value="FRUITS">Fruits</option>
          <option value="GRAINS">Grains</option>
          <option value="TUBERS">Tubers</option>
          <option value="HERBS">Herbs</option>
          <option value="DAIRY">Dairy</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="price">Price</label>
        <input
          id="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="unit">Unit</label>
        <input
          id="unit"
          type="text"
          placeholder="kg, litre, piece, etc."
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="0"
          placeholder="Enter available quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="minOrderQuantity">
          Minimum Order Quantity
        </label>
        <input
          id="minOrderQuantity"
          type="number"
          min="1"
          placeholder="Enter minimum order quantity"
          value={minOrderQuantity}
          onChange={(e) =>
            setMinOrderQuantity(e.target.value)
          }
        />
      </div>
      <div>
        <label>Produce Image</label>
        <ImageUpload onImageSelect={setImage} />
      </div>
      {error && (
        <p role="alert">
          {error}
        </p>
      )}
      {success && (
        <p role="status">
          {success}
        </p>
      )}
      <button
        type="button"
        onClick={handlePublish}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Publishing..." : "Publish Produce"}
      </button>
    </main>
  );
}