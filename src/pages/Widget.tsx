import { useAppMode } from '@/contexts/AppModeContext';
import AppointmentForm from '@/components/AppointmentForm';
import GlassWidget from '@/components/widgets/GlassWidget';
import CountertopWidget from '@/components/widgets/CountertopWidget';

export default function Widget() {
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      {mode === 'clinic' && <AppointmentForm />}
      {mode === 'glass' && <GlassWidget />}
      {mode === 'countertop' && <CountertopWidget />}
    </div>
  );
}