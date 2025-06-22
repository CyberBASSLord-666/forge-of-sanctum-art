
import { useState } from 'react';
import { Search, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { standardAnimations } from '@/lib/animations/standard-animations';

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  parameters: any;
  createdAt: Date;
}

interface GalleryProps {
  images: GalleryImage[];
  loading: boolean;
}

export const Gallery = ({ images, loading }: GalleryProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const filteredImages = images.filter(image =>
    image.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (image: GalleryImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `museforge-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-mf-secondary-accent/30 border-t-mf-primary-accent rounded-full animate-spin mx-auto" />
            <p className="text-mf-text-secondary text-sm">Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-mf-primary-accent" />
          <h2 className="text-xl font-semibold text-mf-text-primary">Gallery</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mf-text-tertiary" />
          <Input
            placeholder="Search your creations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-mf-glass-base border-mf-glass-border text-mf-text-primary placeholder:text-mf-text-tertiary focus-ring"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className={`text-center py-12 ${standardAnimations.fadeIn}`}>
          <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-mf-text-tertiary" />
          </div>
          <h3 className="text-lg font-medium text-mf-text-primary mb-2">No images yet</h3>
          <p className="text-mf-text-secondary text-sm">
            {searchQuery ? 'No images match your search.' : 'Start creating to see your images here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredImages.map((image, index) => (
            <Card
              key={image.id}
              className={`overflow-hidden cursor-pointer group glass hover:glass-strong transition-all duration-300 ${standardAnimations.hoverLift} ${standardAnimations.fadeIn}`}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedImage(image)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-mf-primary-bg/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-mf-primary-accent text-mf-primary-bg hover:bg-mf-primary-accent/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-mf-text-secondary line-clamp-2">{image.prompt}</p>
                  <p className="text-xs text-mf-text-tertiary mt-1">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
