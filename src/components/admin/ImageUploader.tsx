"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
}

export function ImageUploader({ images, onChange, multiple = true }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const { data } = await supabase.auth.getSession();
        const idToken = data.session?.access_token;
        if (!idToken) throw new Error("Not authenticated");

        const res = await fetch("/api/r2/presign", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`
          },
          body: JSON.stringify({ filename: file.name, contentType: file.type }),
        });
        
        if (!res.ok) throw new Error("Failed to get presigned URL");
        
        const { signedUrl, publicUrl } = await res.json();

        await fetch(signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        uploadedUrls.push(publicUrl);
      }

      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {images.map((url, i) => (
          <div key={i} className="relative w-32 h-32 border-2 border-gray-800 bg-void-black overflow-hidden group">
            <Image src={url} alt={`Upload ${i}`} fill className="object-cover" />
            <button
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 bg-red-600 text-pure-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-32 h-32 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-acid-green hover:text-acid-green transition-colors text-gray-500"
        >
          {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          <span className="text-xs uppercase font-bold mt-2">{uploading ? "Uploading" : "Upload"}</span>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        multiple={multiple}
        accept="image/jpeg, image/png, image/webp"
      />
    </div>
  );
}
