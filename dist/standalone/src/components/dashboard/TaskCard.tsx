"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"

interface TaskCardProps {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  status: "in_progress" | "todo" | "upcoming" | "completed"
  dueDate?: string
  description?: string
  onToggle?: (id: string) => void
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  low: "bg-green-100 text-green-800 border-green-200"
}

const statusIcons = {
  completed: CheckCircle2,
  in_progress: Circle,
  todo: Circle,
  upcoming: Clock
}

const statusColors = {
  completed: "text-green-600",
  in_progress: "text-blue-600", 
  todo: "text-gray-600",
  upcoming: "text-orange-600"
}

export function TaskCard({ 
  id, 
  title, 
  priority, 
  status, 
  dueDate, 
  description,
  onToggle 
}: TaskCardProps) {
  const StatusIcon = statusIcons[status]
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle?.(id)}
            className={cn("mt-0.5", statusColors[status])}
          >
            <StatusIcon className="h-5 w-5" />
          </button>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium text-sm leading-tight",
                status === "completed" && "line-through text-muted-foreground"
              )}>
                {title}
              </h3>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="outline" 
                  className={cn("text-xs", priorityColors[priority])}
                >
                  {priority}
                </Badge>
                {priority === "high" && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {description}
              </p>
            )}
            
            {dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{dueDate}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}