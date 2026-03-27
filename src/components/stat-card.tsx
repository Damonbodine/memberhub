import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  className?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, className, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {trend && (
          <p className={cn("text-sm mt-1", trendUp ? "text-green-500" : "text-red-500")}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
