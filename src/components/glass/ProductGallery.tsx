import CalculatorGallery from '@/components/shared/CalculatorGallery';

const products = [
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
  return (
    <CalculatorGallery
      title="Калькуляторы изделий"
      description="Выберите категорию изделия для расчета стоимости"
      items={products}
    />
  );
}