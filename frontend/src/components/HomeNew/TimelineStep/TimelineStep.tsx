import { LucideIcon } from 'lucide-react';
import './style/TimelineStep.css';

interface TimelineStepProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}

export function TimelineStep({ number, title, description, icon: Icon, isLast = false }: TimelineStepProps) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-emerald-300 to-transparent" />
      )}

      {/* Icon Circle */}
      <div className="relative flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-700 to-teal-600 shadow-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-emerald-700 text-xs text-emerald-800">
          {number}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-12">
        <h3 className="text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

