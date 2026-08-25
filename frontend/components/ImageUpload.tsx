"use client"

import { useState } from "react"

type ImageUploadProps = {
    onImageSelect: (file: File) => void;
};

export default function ImageUpload({ onImageSelect }: ImageUploadProps) {
    const [image, setImage] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null);
    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>){
        const file = e.target.files?.[0]
    if (file){
    setImage(file)
    setPreview(URL.createObjectURL(file));
    onImageSelect(file);
    }
    }

    return(
        <div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
             {preview && <img src={preview} alt="Preview" width={150} />}
        </div>
    )
}