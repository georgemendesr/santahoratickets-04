
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SalesNotificationToastProps {
  children: ReactNode;
  className?: string;
}

export function SalesNotificationToast({ children, className }: SalesNotificationToastProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 shadow-sm",
      "dark:bg-green-900/20 dark:border-green-800 dark:text-green-200",
      "animate-fade-in",
      className
    )}>
      {children}
    </div>
  );
}
