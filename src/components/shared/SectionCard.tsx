import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SectionCard({ title, icon, children, className }: SectionCardProps) {
  return (
    <Card className={className}>
      {title ? (
        <CardHeader className="flex-row items-center gap-2 space-y-0">
          {icon}
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
    </Card>
  );
}
