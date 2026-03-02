import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconBg?: string
  iconColor?: string
  trend?: { value: string; positive: boolean }
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-indigo-50',
  iconColor = 'text-indigo-600',
  trend,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={cn('text-xs font-medium mt-1', trend.positive ? 'text-green-600' : 'text-red-600')}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  )
}
