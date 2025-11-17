import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import ServiceStep from './appointment/ServiceStep';
import DoctorStep from './appointment/DoctorStep';
import TimeStep from './appointment/TimeStep';
import PatientStep from './appointment/PatientStep';
import ConfirmationStep from './appointment/ConfirmationStep';
import SuccessStep from './appointment/SuccessStep';

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';
const EMAIL_URL = 'https://functions.poehali.dev/96f87426-ceea-4c3f-8145-2924f5b55361';

const STEPS = [
  { id: 1, title: 'Услуга', icon: 'Stethoscope' },
  { id: 2, title: 'Врач', icon: 'UserRound' },
  { id: 3, title: 'Время', icon: 'Calendar' },
  { id: 4, title: 'Данные', icon: 'FileText' },
  { id: 5, title: 'Подтверждение', icon: 'CheckCircle2' }
];

export default function AppointmentForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    service: null as any,
    doctor: null as any,
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    patientEmail: ''
  });
  const [appointmentId, setAppointmentId] = useState('');
  const { toast } = useToast();

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const fetchWithRetry = async (url: string, options: any = {}, retries = 3): Promise<any> => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok && i === retries - 1) {
          throw new Error(`HTTP ${response.status}`);
        }
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleServiceSelect = (service: any) => {
    setAppointmentData({ ...appointmentData, service });
    setTimeout(handleNext, 300);
  };

  const handleDoctorSelect = (doctor: any) => {
    setAppointmentData({ ...appointmentData, doctor });
    setTimeout(handleNext, 300);
  };

  const handleTimeSelect = (date: string, time: string) => {
    setAppointmentData({ ...appointmentData, date, time });
    setTimeout(handleNext, 300);
  };

  const handlePatientData = (data: { name: string; phone: string; email: string }) => {
    setAppointmentData({
      ...appointmentData,
      patientName: data.name,
      patientPhone: data.phone,
      patientEmail: data.email
    });
    setTimeout(handleNext, 300);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetchWithRetry(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: appointmentData.service?.id,
          serviceName: appointmentData.service?.name,
          servicePrice: appointmentData.service?.price,
          doctorId: appointmentData.doctor?.id,
          doctorName: appointmentData.doctor?.name,
          date: appointmentData.date,
          time: appointmentData.time,
          patientName: appointmentData.patientName,
          patientPhone: appointmentData.patientPhone,
          patientEmail: appointmentData.patientEmail
        })
      });

      if (response.success) {
        setAppointmentId(response.appointmentId);
        
        fetch(EMAIL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'created',
            appointmentData: {
              patientEmail: appointmentData.patientEmail,
              patientName: appointmentData.patientName,
              appointmentId: response.appointmentId,
              serviceName: appointmentData.service?.name,
              doctorName: appointmentData.doctor?.name,
              date: appointmentData.date,
              time: appointmentData.time,
              servicePrice: appointmentData.service?.price
            }
          })
        }).catch(() => {});
        
        handleNext();
        toast({
          title: 'Запись создана',
          description: 'Ваша запись успешно подтверждена',
        });
      }
    } catch (error: any) {
      if (error.message?.includes('409')) {
        toast({
          title: 'Время занято',
          description: 'К сожалению, выбранное время уже занято. Пожалуйста, выберите другое.',
          variant: 'destructive'
        });
        setCurrentStep(3);
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось создать запись. Попробуйте еще раз.',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ServiceStep onSelect={handleServiceSelect} apiUrl={API_URL} />;
      case 2:
        return <DoctorStep onSelect={handleDoctorSelect} apiUrl={API_URL} serviceId={appointmentData.service?.id} />;
      case 3:
        return <TimeStep onSelect={handleTimeSelect} apiUrl={API_URL} doctorId={appointmentData.doctor?.id} />;
      case 4:
        return <PatientStep onSubmit={handlePatientData} />;
      case 5:
        return <ConfirmationStep data={appointmentData} onSubmit={handleSubmit} isLoading={isLoading} />;
      case 6:
        return <SuccessStep appointmentId={appointmentId} data={appointmentData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6 md:p-8 animate-scale-in shadow-xl">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id
                      ? 'bg-primary text-primary-foreground shadow-lg scale-110'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon name={step.icon as any} size={20} />
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-1 transition-all ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Шаг {currentStep} из {STEPS.length}: {STEPS[currentStep - 1]?.title}
          </p>
        </div>

        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {currentStep < 5 && currentStep > 1 && (
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={handleBack} disabled={isLoading}>
              <Icon name="ChevronLeft" size={16} className="mr-2" />
              Назад
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}