"use client"

import { useState } from "react"
import { createProduct } from "@/lib/api";


export default function AddProducePage() {
    const [name,setName] = useState("")
    const [price ,setPrice] = useState(0)
    const [quantity,setQuantity] = useState(0)

      function handlePublish() {
    const product = {
      name: name,
      price: price,
      quantity: quantity,
      category: "vegetable",
    };
    createProduct(product);
  }


    return (
        <div>
            <input type="text"
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)} />

            <input type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))} />

            <input type="number"
            placeholder="Quantiy"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}/>

             <button onClick={handlePublish}>Publish</button>
        </div>
    );

    
}

