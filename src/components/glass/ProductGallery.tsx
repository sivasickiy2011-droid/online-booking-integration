import { useState } from 'react';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Product {
  id: string;
  title: string;
  image: string;
}

const products: Product[] = [
  {
    id: 'kitchen',
    title: 'Кухонный гарнитур',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/ebe3c36f-cc0a-4f7b-b762-a7c820e47bf0.jpg'
  },
  {
    id: 'countertop',
    title: 'Столешница для кухни',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/6cfe7435-80a2-46a0-b311-0cf9d8c54d68.jpg'
  },
  {
    id: 'shower',
    title: 'Душевая кабина из стекла',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/30b81fc2-c30e-4ee4-be01-0d812b1d3b9c.jpg'
  },
  {
    id: 'partition',
    title: 'Перегородка цельностеклянная',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/55b03a15-b2c9-46bf-b9f1-f9cce7139e83.jpg'
  },
  {
    id: 'office',
    title: 'Офисная перегородка',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/db8b36bc-ecea-47e6-b886-af86540d14c2.jpg'
  }
];

export default function ProductGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl overflow-hidden shadow-lg">
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Наши изделия</h2>
          <p className="text-slate-600">Выберите категорию изделия для расчета стоимости</p>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Icon name="ChevronLeft" size={20} />
          <span className="text-sm font-medium">Прокрутите</span>
          <Icon name="ChevronRight" size={20} />
        </div>
      </div>
      <div className="h-[420px] overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-slate-200">
        <div className="flex gap-4 px-6 pb-6 h-full min-w-min">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`relative flex-shrink-0 w-80 h-full cursor-pointer transition-all duration-300 overflow-hidden group ${
                hoveredId === product.id ? 'scale-105 shadow-2xl z-10' : 'shadow-lg'
              }`}
              onMouseEnter={() => setHoveredId(product.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative w-full h-full">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {hoveredId === product.id && (
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 animate-in fade-in duration-300">
                    <Icon name="Sparkles" size={24} className="text-white" />
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-bold drop-shadow-lg mb-2">
                    {product.title}
                  </h3>
                  <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white rounded-full transition-all duration-500 ${
                        hoveredId === product.id ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  {hoveredId === product.id && (
                    <p className="text-white/90 text-sm mt-3 animate-in slide-in-from-bottom-2 duration-300">
                      Нажмите для выбора и расчета стоимости
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