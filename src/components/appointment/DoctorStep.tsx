import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
}

interface DoctorStepProps {
  onSelect: (doctor: Doctor) => void;
  apiUrl: string;
  serviceId: string;
}

export default function DoctorStep({ onSelect, apiUrl, serviceId }: DoctorStepProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, [serviceId]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${apiUrl}?action=doctors&serviceId=${serviceId}`);
      const data = await response.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить список врачей',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Выберите врача</h2>
      <div className="space-y-4">
        {doctors.map((doctor) => (
          <Card
            key={doctor.id}
            className="p-5 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] hover:border-primary"
            onClick={() => onSelect(doctor)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                  {doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{doctor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{doctor.specialization}</p>
                  <Badge variant="secondary" className="text-xs">
                    <Icon name="Award" size={14} className="mr-1" />
                    Стаж: {doctor.experience} лет
                  </Badge>
                </div>
              </div>
              <Icon name="ChevronRight" size={24} className="text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
