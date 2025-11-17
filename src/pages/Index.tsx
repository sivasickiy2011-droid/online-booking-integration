import { useState } from 'react';
import AppointmentForm from '@/components/AppointmentForm';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Онлайн-запись в клинику
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Запишитесь на прием к врачу за несколько простых шагов
          </p>
        </div>
        
        <AppointmentForm />
      </div>
    </div>
  );
}
