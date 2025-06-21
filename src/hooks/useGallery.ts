
import { useState, useEffect } from 'react';

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  parameters: any;
  createdAt: Date;
}

export const useGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate loading from IndexedDB
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would load from IndexedDB
        const savedImages = localStorage.getItem('museforge-gallery');
        if (savedImages) {
          const parsed = JSON.parse(savedImages);
          setImages(parsed.map((img: any) => ({
            ...img,
            createdAt: new Date(img.createdAt)
          })));
        }
      } catch (error) {
        console.error('Failed to load gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const addImage = async (image: Omit<GalleryImage, 'id' | 'createdAt'>) => {
    const newImage: GalleryImage = {
      ...image,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    const updatedImages = [newImage, ...images];
    setImages(updatedImages);

    // Save to localStorage (in real implementation, this would be IndexedDB)
    try {
      localStorage.setItem('museforge-gallery', JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const removeImage = async (id: string) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);

    try {
      localStorage.setItem('museforge-gallery', JSON.stringify(updatedImages));
    } catch (error) {
      console.error('Failed to remove image:', error);
    }
  };

  return {
    images,
    loading,
    addImage,
    removeImage,
  };
};
