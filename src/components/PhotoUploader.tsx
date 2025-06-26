import React, { useState } from "react";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  onPhotosChange?: (photos: File[]) => void;
  maxPhotos?: number;
}

const PhotoUploader = ({
  onPhotosChange = () => {},
  maxPhotos = 5,
}: PhotoUploaderProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = [...photos, ...newFiles];

      // Limit the number of photos
      if (totalFiles.length > maxPhotos) {
        alert(`You can only upload a maximum of ${maxPhotos} photos.`);
        return;
      }

      // Create preview URLs
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

      setPhotos((prev) => [...prev, ...newFiles]);
      setPreviews((prev) => [...prev, ...newPreviews]);
      onPhotosChange([...photos, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    const newPreviews = [...previews];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);

    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);

    setPhotos(newPhotos);
    setPreviews(newPreviews);
    onPhotosChange(newPhotos);
  };

  const triggerFileInput = (inputId: string) => {
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
      <p className="text-gray-500 mb-4">
        Please upload photos of the electrical issue. You can take a new photo
        or select from your gallery.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        {previews.map((preview, index) => (
          <div key={index} className="relative">
            <Card className="overflow-hidden border-2 border-gray-200">
              <AspectRatio ratio={4 / 3} className="bg-muted">
                <img
                  src={preview}
                  alt={`Photo ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
            </Card>
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 rounded-full h-6 w-6"
              onClick={() => removePhoto(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={cn(
                "h-24 w-24 border-dashed flex flex-col gap-1",
                "hover:bg-gray-50 transition-colors",
              )}
              onClick={() => triggerFileInput("camera-input")}
            >
              <Camera className="h-6 w-6" />
              <span className="text-xs">Camera</span>
              <input
                id="camera-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </Button>

            <Button
              variant="outline"
              className={cn(
                "h-24 w-24 border-dashed flex flex-col gap-1",
                "hover:bg-gray-50 transition-colors",
              )}
              onClick={() => triggerFileInput("gallery-input")}
            >
              <ImageIcon className="h-6 w-6" />
              <span className="text-xs">Gallery</span>
              <input
                id="gallery-input"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </Button>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500">
        {photos.length} of {maxPhotos} photos added
      </div>
    </div>
  );
};

export default PhotoUploader;
