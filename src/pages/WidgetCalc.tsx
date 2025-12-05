import { useAppMode } from '@/contexts/AppModeContext';
import GlassWidget from '@/components/widgets/GlassWidget';
import CountertopWidget from '@/components/widgets/CountertopWidget';
import ClinicCalcWidget from '@/components/widgets/ClinicCalcWidget';

export default function WidgetCalc() {
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      {mode === 'glass' && <GlassWidget />}
      {mode === 'countertop' && <CountertopWidget />}
      {mode === 'clinic' && <ClinicCalcWidget />}
    </div>
  );
}