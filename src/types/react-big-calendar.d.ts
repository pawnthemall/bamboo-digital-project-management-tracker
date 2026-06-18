declare module "react-big-calendar" {
  import type { ComponentType, CSSProperties } from "react";

  export interface Event {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    resource?: unknown;
  }

  export interface Messages {
    allDay?: string;
    previous?: string;
    next?: string;
    today?: string;
    month?: string;
    week?: string;
    day?: string;
    agenda?: string;
    date?: string;
    time?: string;
    event?: string;
    noEventsInRange?: string;
    showMore?: (count: number) => string;
  }

  export interface CalendarProps<TEvent = Event> {
    localizer: DateLocalizer;
    events?: TEvent[];
    startAccessor?: string | ((event: TEvent) => Date);
    endAccessor?: string | ((event: TEvent) => Date);
    titleAccessor?: string | ((event: TEvent) => string);
    allDayAccessor?: string | ((event: TEvent) => boolean);
    style?: CSSProperties;
    className?: string;
    view?: string;
    defaultView?: string;
    views?: string[] | Record<string, boolean | ComponentType>;
    date?: Date;
    defaultDate?: Date;
    onSelectEvent?: (event: TEvent) => void;
    onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[]; action: "click" | "doubleClick" | "select" }) => void;
    onNavigate?: (newDate: Date, view: string, action: string) => void;
    onView?: (view: string) => void;
    eventPropGetter?: (event: TEvent, start: Date, end: Date, isSelected: boolean) => { className?: string; style?: CSSProperties };
    slotPropGetter?: (date: Date) => { className?: string; style?: CSSProperties };
    dayPropGetter?: (date: Date) => { className?: string; style?: CSSProperties };
    components?: {
      toolbar?: ComponentType<ToolbarProps>;
      event?: ComponentType<EventProps<TEvent>>;
      month?: { header?: ComponentType; dateHeader?: ComponentType; event?: ComponentType };
    };
    toolbar?: boolean;
    popup?: boolean;
    selectable?: boolean;
    step?: number;
    timeslots?: number;
    culture?: string;
    messages?: Messages;
    formats?: Formats;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
  }

  export interface ToolbarProps {
    date: Date;
    view: string;
    views: string[];
    label: string;
    localizer: DateLocalizer;
    onNavigate: (action: string, newDate?: Date) => void;
    onView: (view: string) => void;
  }

  export interface EventProps<TEvent = Event> {
    event: TEvent;
    title: string;
  }

  export interface DateLocalizer {
    format: (value: Date, format: string, culture?: string) => string;
    formats: Formats;
    propType: unknown;
  }

  export interface Formats {
    dateFormat?: string;
    dayFormat?: string;
    weekdayFormat?: string;
    timeGutterFormat?: string;
    monthHeaderFormat?: string;
    dayRangeHeaderFormat?: string;
    dayHeaderFormat?: string;
    agendaHeaderFormat?: string;
    agendaDateFormat?: string;
    agendaTimeFormat?: string;
    agendaTimeRangeFormat?: string;
    eventTimeRangeFormat?: string;
    eventTimeRangeStartFormat?: string;
    eventTimeRangeEndFormat?: string;
  }

  export const Calendar: ComponentType<CalendarProps>;
  export function dateFnsLocalizer(args: {
    format: unknown;
    parse: unknown;
    startOfWeek: unknown;
    getDay: unknown;
    locales: Record<string, unknown>;
  }): DateLocalizer;
  export function momentLocalizer(moment: unknown): DateLocalizer;
  export function luxonLocalizer(luxon: unknown): DateLocalizer;
  export function globalizeLocalizer(globalize: unknown): DateLocalizer;
}
