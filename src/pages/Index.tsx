import { useAppMode } from '@/contexts/AppModeContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import CalculatorGallery from '@/components/shared/CalculatorGallery';

const bookingItems = [
  {
    id: 'doctor',
    title: 'Запись на прием ко врачу',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/b0bfbf24-ddc3-426a-ac72-588922d1667f.jpg',
    link: '/widget-doctor'
  },
  {
    id: 'service',
    title: 'Запись на услугу',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/47a5d737-664f-4572-9ff0-fd3d39f98024.jpg',
    link: '/widget-doctor'
  },
  {
    id: 'apartment',
    title: 'Бронирование квартир посуточное',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/dbe4f97e-a626-4b6d-89b8-e5b74bbd1abc.jpg',
    link: '/widget-doctor'
  },
  {
    id: 'warehouse',
    title: 'Запись на разгрузку Склад',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/4567a415-d664-4369-a14e-bdd005a49108.jpg',
    link: '/widget-doctor'
  },
  {
    id: 'technician',
    title: 'Выезд мастера',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/a7cdd397-7a32-4c76-9591-01991f4b9e98.jpg',
    link: '/widget-doctor'
  }
];

const calculatorItems = [
  {
    id: 'kitchen',
    title: 'Кухонный гарнитур',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/ebe3c36f-cc0a-4f7b-b762-a7c820e47bf0.jpg',
    link: '/widget-calc'
  },
  {
    id: 'countertop',
    title: 'Столешница для кухни',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/6cfe7435-80a2-46a0-b311-0cf9d8c54d68.jpg',
    link: '/widget-calc'
  },
  {
    id: 'shower',
    title: 'Душевая кабина из стекла',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/30b81fc2-c30e-4ee4-be01-0d812b1d3b9c.jpg',
    link: '/widget-calc'
  },
  {
    id: 'partition',
    title: 'Перегородка цельностеклянная',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/55b03a15-b2c9-46bf-b9f1-f9cce7139e83.jpg',
    link: '/widget-calc'
  },
  {
    id: 'office',
    title: 'Офисная перегородка',
    image: 'https://cdn.poehali.dev/projects/2d1552ad-d36b-4459-bfc0-603634635613/files/db8b36bc-ecea-47e6-b886-af86540d14c2.jpg',
    link: '/widget-calc'
  }
];

export default function Index() {
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="mx-[100px] py-12 space-y-8">
        <div className="flex flex-col items-center mb-12">
          <img 
            src="https://cdn.poehali.dev/files/5e53ea79-1c81-4c3f-847b-e8a82a5743c2.png" 
            alt="ООО Молотов траст" 
            className="h-16 object-contain mb-6"
          />
          <h1 className="text-4xl font-bold text-center mb-4">Отраслевые калькуляторы</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Выберите тип калькулятора для вашего бизнеса
          </p>
        </div>

        <CalculatorGallery
          title="Бронирование по времени"
          description="Выберите отраслевое решение для записи и бронирования"
          items={bookingItems}
        />

        <CalculatorGallery
          title="Калькуляторы изделий"
          description="Выберите категорию изделия для расчета стоимости"
          items={calculatorItems}
        />

        <div className="mt-12 flex items-center justify-center gap-4">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <Icon name="User" size={16} className="mr-2" />
              Личный кабинет
            </Button>
          </Link>
          <Link to="/embed">
            <Button variant="outline" size="sm">
              <Icon name="Code" size={16} className="mr-2" />
              Код встраивания
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}