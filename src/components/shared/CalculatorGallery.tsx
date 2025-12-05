import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface GalleryItem {
  id: string;
  title: string;
  image: string;
  link?: string;
  disabled?: boolean;
}

interface CalculatorGalleryProps {
  title: string;
  description: string;
  items: GalleryItem[];
  onItemClick?: (id: string) => void;
}

export default function CalculatorGallery({ 
  title, 
  description, 
  items,
  onItemClick 
}: CalculatorGalleryProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = (item: GalleryItem) => {
    if (item.disabled) return;
    
    if (onItemClick) {
      onItemClick(item.id);
    } else if (item.link) {
      window.location.href = item.link;
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
          <p className="text-slate-600">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Icon name="ChevronLeft" size={20} />
          <span className="text-sm font-medium">Прокрутите</span>
          <Icon name="ChevronRight" size={20} />
        </div>
      </div>
      <div className="h-[420px] overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200">
        <div className="flex gap-4 px-6 pb-6 h-full min-w-min">
          {items.map((item) => (
            <Card
              key={item.id}
              className={`relative flex-shrink-0 w-80 h-full transition-all duration-300 overflow-hidden group ${
                item.disabled 
                  ? 'opacity-60 cursor-not-allowed' 
                  : `cursor-pointer ${hoveredId === item.id ? 'scale-105 shadow-2xl z-10' : 'shadow-lg'}`
              }`}
              onMouseEnter={() => !item.disabled && setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleClick(item)}
            >
              <div className="relative w-full h-full">
                <img
                  src={item.image}
                  alt={item.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    item.disabled ? 'grayscale' : 'group-hover:scale-110'
                  }`}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent ${
                  item.disabled ? 'bg-black/50' : ''
                }`} />
                
                {item.disabled && (
                  <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm rounded-full px-4 py-2">
                    <span className="text-white text-sm font-semibold">В разработке</span>
                  </div>
                )}
                
                {hoveredId === item.id && !item.disabled && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 animate-in fade-in duration-300">
                    <Icon name="Sparkles" size={24} className="text-white" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold drop-shadow-lg mb-2">
                    {item.title}
                  </h3>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white rounded-full transition-all duration-500 ${
                        hoveredId === item.id && !item.disabled ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  {hoveredId === item.id && !item.disabled && (
                    <p className="text-white/90 text-sm mt-3 animate-in slide-in-from-bottom-2 duration-300">
                      Нажмите для выбора
                    </p>
                  )}
                  {item.disabled && (
                    <p className="text-white/70 text-sm mt-3">
                      Скоро будет доступно
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}