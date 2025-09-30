"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Calendar, Users } from "lucide-react"

interface ProjectCardProps {
  id: string
  title: string
  description?: string
  progress: number
  status: "active" | "completed" | "on_hold"
  dueDate?: string
  teamMembers?: Array<{
    id: string
    name: string
    avatar?: string
  }>
  color?: string
}

const statusColors = {
  active: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  on_hold: "bg-gray-100 text-gray-800 border-gray-200"
}

export function ProjectCard({ 
  id, 
  title, 
  description, 
  progress, 
  status, 
  dueDate, 
  teamMembers = [],
  color = "bg-gradient-to-br from-blue-500 to-purple-600"
}: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <CardTitle className="text-base font-semibold leading-tight">
              {title}
            </CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={cn("text-xs", statusColors[status])}
          >
            {status.replace('_', ' ')}
          </Badge>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between">
          {dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{dueDate}</span>
            </div>
          )}
          
          {teamMembers.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 3).map((member) => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {teamMembers.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      +{teamMembers.length - 3}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}