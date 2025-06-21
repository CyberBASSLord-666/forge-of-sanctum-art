
import { useState } from 'react';
import { Sparkles, Download, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-white/60 text-sm">Loading gallery...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
          Sacred Gallery
        </h2>
        <p className="text-sm text-white/60">
          Your collection of AI-forged masterpieces
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          placeholder="Search your creations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
        />
      </div>

      {/* Gallery Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No creations yet</h3>
          <p className="text-white/60 text-sm">
            {searchQuery ? 'No images match your search.' : 'Start forging to see your creations here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredImages.map((image) => (
            <Card
              key={image.id}
              className="bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden cursor-pointer hover:bg-white/10 transition-colors group"
              onClick={() => setSelectedImage(image)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(image);
                      }}
                      className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
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
                      className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 hover:bg-red-500/30"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-white/70 line-clamp-2">{image.prompt}</p>
                  <p className="text-xs text-white/40 mt-1">
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
