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

  return <a data-test-id="create-reminder-btn" href={eventUrl} target={"_blank"} className={props.className}>{props.children}</a>;
}
