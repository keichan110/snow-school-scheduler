'use client';

import { Button } from '@/components/ui/button';
import { Calendar, List, Loader2 } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'monthly' | 'weekly';
  onViewChange: (view: 'monthly' | 'weekly') => void;
  isPending?: boolean;
  pendingView?: 'monthly' | 'weekly' | null;
}

export function ViewToggle({
  currentView,
  onViewChange,
  isPending = false,
  pendingView = null,
}: ViewToggleProps) {
  const isMonthlyPending = isPending && pendingView === 'monthly';
  const isWeeklyPending = isPending && pendingView === 'weekly';

  return (
    <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
      <Button
        variant={currentView === 'monthly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          if (currentView === 'monthly' || isPending) return;
          onViewChange('monthly');
        }}
        disabled={isPending}
        className="flex items-center gap-2"
        aria-busy={isMonthlyPending}
      >
        <Calendar className="h-4 w-4" />
        <span className="inline">月間</span>
        {isMonthlyPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </Button>
      <Button
        variant={currentView === 'weekly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          if (currentView === 'weekly' || isPending) return;
          onViewChange('weekly');
        }}
        disabled={isPending}
        className="flex items-center gap-2"
        aria-busy={isWeeklyPending}
      >
        <List className="h-4 w-4" />
        <span className="inline">週間</span>
        {isWeeklyPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      </Button>
    </div>
  );
}
