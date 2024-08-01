import { AddToCalendar, CalendarEvent } from "@/lib/add-to-calendar";
import { useMemo } from "react";

export function AddToCalendarLink(props: {
  event: CalendarEvent;
  children: React.ReactNode;
  className?: string;
}) {
  const eventUrl = useMemo(() => {
    return new AddToCalendar().createGoogleUrl(props.event);
  }, [props.event]);

  return <a href={eventUrl} target="_blank" className={props.className}>{props.children}</a>;
}
