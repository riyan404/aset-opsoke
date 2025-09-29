"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Clock, Video, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

interface CalendarEvent {
  id: string
  title: string
  time: string
  type: "meeting" | "reminder" | "deadline"
  location?: string
  isOnline?: boolean
  attendees?: number
}

interface CalendarWidgetProps {
  events?: CalendarEvent[]
}

const eventTypeColors = {
  meeting: "bg-blue-100 text-blue-800 border-blue-200",
  reminder: "bg-yellow-100 text-yellow-800 border-yellow-200",
  deadline: "bg-red-100 text-red-800 border-red-200"
}

const eventTypeIcons = {
  meeting: Video,
  reminder: Clock,
  deadline: Calendar
}

export function CalendarWidget({ events = [] }: CalendarWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  // Generate calendar days
  const calendarDays = []
  
  // Previous month's trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevMonth = new Date(currentYear, currentMonth, 0)
    calendarDays.push({
      day: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false
    })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = 
      day === today.getDate() && 
      currentMonth === today.getMonth() && 
      currentYear === today.getFullYear()
    
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isToday
    })
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isToday: false
    })
  }
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((date, index) => (
            <div
              key={index}
              className={cn(
                "text-center text-sm p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
                !date.isCurrentMonth && "text-muted-foreground/50",
                date.isToday && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {date.day}
            </div>
          ))}
        </div>
        
        {/* Today's Events */}
        {events.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Today's Events</h4>
            <div className="space-y-2">
              {events.slice(0, 3).map((event) => {
                const EventIcon = eventTypeIcons[event.type]
                return (
                  <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                    <div className="mt-0.5">
                      <EventIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-medium leading-tight">{event.title}</h5>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", eventTypeColors[event.type])}
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.time}</span>
                        {event.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          </>
                        )}
                        {event.attendees && (
                          <>
                            <span>•</span>
                            <span>{event.attendees} attendees</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}