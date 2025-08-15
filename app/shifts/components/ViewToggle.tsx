'use client';

import { Button } from '@/components/ui/button';
import { Calendar, List } from 'lucide-react';

interface ViewToggleProps {
  currentView: 'monthly' | 'weekly';
  onViewChange: (view: 'monthly' | 'weekly') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 rounded-lg bg-muted p-1">
      <Button
        variant={currentView === 'monthly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('monthly')}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        <span className="inline">月間</span>
      </Button>
      <Button
        variant={currentView === 'weekly' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('weekly')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        <span className="inline">週間</span>
      </Button>
    </div>
  );
}
