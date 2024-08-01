

export interface CalendarEvent {
    title: string;
    startDate: Date,
    endDate: Date,
    description: string;
}

export const ONE_MINUTE = 60 * 1000
export const ONE_HOUR = 60 * ONE_MINUTE

export class AddToCalendar {

    createGoogleUrl(eventData: CalendarEvent) {
        const googleArgs = {
            'text': (eventData.title || ''),
            'dates': this.formatTime(eventData.startDate) + '/' + this.formatTime(eventData.endDate),
            'details': (eventData.description || ''),
            'sprop': ''
        };

        return 'https://www.google.com/calendar/render?action=TEMPLATE&' + this.serializeObjToQuery(googleArgs);
    }

    private serializeObjToQuery(obj: { [key: string]: string }) {
        var str = [];
        for (var p in obj) {
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
        }

        return str.join('&');
    };

    private formatTime(date: Date) {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
}
