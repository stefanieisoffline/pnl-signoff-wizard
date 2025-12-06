import { cn } from '@/lib/utils';
import { SignOffStatus } from '@/lib/mockData';
import { Check, X, Clock, Minus } from 'lucide-react';

interface StatusBadgeProps {
  status: SignOffStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const statusConfig = {
  signed: {
    label: 'Signed',
    icon: Check,
    className: 'status-signed',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'status-pending',
  },
  rejected: {
    label: 'Rejected',
    icon: X,
    className: 'status-rejected',
  },
  none: {
    label: 'N/A',
    icon: Minus,
    className: 'status-none',
  },
};

const sizeConfig = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 px-3 text-sm',
};

export function StatusBadge({ status, size = 'md', showLabel = false }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  if (showLabel) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-medium',
          config.className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md border',
        sizeConfig[size],
        config.className
      )}
      title={config.label}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
    </span>
  );
}
