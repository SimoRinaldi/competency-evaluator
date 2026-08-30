import * as React from "react"
import { cn } from "@/lib/utils"
import { Separator } from "./ui/separator"

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageContainer({ title, description, action, children, className, ...props }: PageContainerProps) {
  return (
    <div className={cn("flex flex-col gap-6 w-full h-full", className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1">{description}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <Separator />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
