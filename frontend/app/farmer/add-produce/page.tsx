"use client"

import { useState } from "react"
import { createProduct, uploadImage, type Product } from "@/lib/api";
import ImageUpload from "@/components/ImageUpload";




export default function AddProducePage() {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [category, setCategory] = useState<Product["category"]>("VEGETABLES")
    const [price, setPrice] = useState("")
    const [unit, setUnit] = useState("")
    const [quantity, setQuantity] = useState("")
    const [minOrderQuantity, setMinOrderQuantity] = useState("")
    const [image, setImage] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    async function handlePublish() {
      if (isSubmitting) return

      const parsedPrice = Number(price)
      const parsedQuantity = Number(quantity)
      const parsedMinOrderQuantity = Number(minOrderQuantity)

      if (!name.trim() || !unit.trim()) {
        setError("Name and unit are required.")
        return
      }
      if (!price || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setError("Enter a valid non-negative price.")
        return
      }
      if (!quantity || !Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
        setError("Enter a valid non-negative quantity.")
        return
      }
      if (!minOrderQuantity || !Number.isFinite(parsedMinOrderQuantity) || parsedMinOrderQuantity <= 0) {
        setError("Enter a valid minimum order quantity.")
        return
      }

      setIsSubmitting(true)
      setError("")
      setSuccess("")

      try {
        let imageUrl: string | null = null
        let imagePublicId: string | null = null

        if (image) {
          try {
            const uploadResult = await uploadImage(image)
            imageUrl = uploadResult.url
            imagePublicId = uploadResult.publicId
          } catch {
            throw new Error("Image upload failed. Please try again.")
          }
        }

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
        }

        await createProduct(product)
        setSuccess("Produce published successfully.")
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Failed to publish produce.")
      } finally {
        setIsSubmitting(false)
      }
    }


    return (
        <div>
            <input type="text"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)} />

            <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)} />

            <select value={category} onChange={(e) => setCategory(e.target.value as Product["category"])}>
              <option value="VEGETABLES">Vegetables</option>
              <option value="FRUITS">Fruits</option>
              <option value="GRAINS">Grains</option>
              <option value="TUBERS">Tubers</option>
              <option value="HERBS">Herbs</option>
              <option value="DAIRY">Dairy</option>
              <option value="OTHER">Other</option>
            </select>

            <input type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)} />

            <input type="text"
            placeholder="Unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)} />

            <input type="number"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}/>

            <input type="number"
            placeholder="Minimum Order Quantity"
            value={minOrderQuantity}
            onChange={(e) => setMinOrderQuantity(e.target.value)}/>

           <ImageUpload onImageSelect={setImage} />

            {error && <p role="alert">{error}</p>}
            {success && <p role="status">{success}</p>}
            <button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish"}
            </button>
        </div>
    );

    
}

