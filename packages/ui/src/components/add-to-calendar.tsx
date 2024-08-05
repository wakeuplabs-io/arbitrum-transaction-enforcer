import { AddToCalendar, CalendarEvent } from "@/lib/add-to-calendar";
import { useMemo } from "react";

export function AddToCalendarButton(props: {
  event: CalendarEvent;
  children: React.ReactNode;
  className?: string;
}) {
  const eventUrl = useMemo(() => {
    return new AddToCalendar().createGoogleUrl(props.event);
  }, [props.event]);

  return <button onClick={() => window.open(eventUrl, "_blank")} className={props.className}>{props.children}</button>;
}
