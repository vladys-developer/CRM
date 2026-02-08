import { useQuery } from '@tanstack/react-query'
import { getCalendarEvents } from '@/lib/api/calendar'

const calendarKeys = {
    all: ['calendar'] as const,
    events: (start: string, end: string) => [...calendarKeys.all, 'events', start, end] as const,
}

export function useCalendarEvents(startDate: string, endDate: string) {
    return useQuery({
        queryKey: calendarKeys.events(startDate, endDate),
        queryFn: () => getCalendarEvents(startDate, endDate),
        enabled: !!startDate && !!endDate,
    })
}
