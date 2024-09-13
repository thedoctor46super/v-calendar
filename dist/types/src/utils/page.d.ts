import { type DateSource, type DayParts, type MonthParts } from './date/helpers';
import Locale from './locale';
export interface CalendarDay extends DayParts {
    id: string;
    position: number;
    label: string;
    ariaLabel: string;
    weekdayPosition: number;
    weekdayPositionFromEnd: number;
    weekPosition: number;
    isoWeeknumber: number;
    startDate: Date;
    noonDate: Date;
    endDate: Date;
    isToday: boolean;
    isFirstDay: boolean;
    isLastDay: boolean;
    isDisabled: boolean;
    isFocusable: boolean;
    isFocused: boolean;
    inMonth: boolean;
    inPrevMonth: boolean;
    inNextMonth: boolean;
    onTop: boolean;
    onBottom: boolean;
    onLeft: boolean;
    onRight: boolean;
    classes: Array<string | Object>;
    locale: Locale;
}
export interface CalendarWeek {
    id: string;
    week: number;
    weekPosition: number;
    weeknumber: number;
    isoWeeknumber: number;
    weeknumberDisplay?: number;
    days: CalendarDay[];
    title: string;
}
export interface CalendarWeekday {
    weekday: number;
    label: string;
}
export type PageView = 'daily' | 'weekly' | 'monthly';
export type TitlePosition = 'center' | 'left' | 'right';
export interface Page {
    id: string;
    day?: number;
    week?: number;
    month: number;
    year: number;
    view: PageView;
    trimWeeks: boolean;
    position: number;
    row: number;
    rowFromEnd: number;
    column: number;
    columnFromEnd: number;
    showWeeknumbers: boolean;
    showIsoWeeknumbers: boolean;
    weeknumberPosition: string;
    monthTitle: string;
    weekTitle?: string;
    dayTitle?: string;
    title: string;
    titlePosition: TitlePosition;
    shortMonthLabel: string;
    monthLabel: string;
    shortYearLabel: string;
    yearLabel: string;
    monthComps: MonthParts;
    prevMonthComps: MonthParts;
    nextMonthComps: MonthParts;
    days: CalendarDay[];
    weeks: CalendarWeek[];
    weekdays: CalendarWeekday[];
    viewDays: CalendarDay[];
    viewWeeks: CalendarWeek[];
}
export type PageAddress = Pick<Page, 'day' | 'week' | 'month' | 'year'>;
export type PageConfig = Pick<Page, 'day' | 'week' | 'month' | 'year' | 'view' | 'titlePosition' | 'trimWeeks' | 'position' | 'row' | 'rowFromEnd' | 'column' | 'columnFromEnd' | 'showWeeknumbers' | 'showIsoWeeknumbers' | 'weeknumberPosition'>;
export type CachedPage = Pick<Page, 'id' | 'month' | 'year' | 'monthTitle' | 'shortMonthLabel' | 'monthLabel' | 'shortYearLabel' | 'yearLabel' | 'monthComps' | 'prevMonthComps' | 'nextMonthComps' | 'days' | 'weeks' | 'weekdays'>;
export declare function getPageId(month: number, year: number): string;
export declare function getPageAddressForDate(date: DateSource, view: PageView, locale: Locale): PageAddress;
export declare function addPages({ day, week, month, year }: PageAddress, count: number, view: PageView, locale: Locale): PageAddress;
export declare function pageIsValid(page: PageAddress | null | undefined): boolean;
export declare function pageIsBeforePage(page: PageAddress | null | undefined, comparePage: PageAddress | null | undefined): boolean;
export declare function pageIsAfterPage(page: PageAddress | null | undefined, comparePage: PageAddress | null | undefined): boolean;
export declare function pageIsBetweenPages(page: PageAddress | null | undefined, fromPage: PageAddress | null | undefined, toPage: PageAddress | null | undefined): boolean;
export declare function pageIsEqualToPage(aPage: PageAddress | null | undefined, bPage: PageAddress | null | undefined): boolean;
export declare function pageRangeToArray(from: PageAddress, to: PageAddress, view: PageView, locale: Locale): PageAddress[];
export declare function getPageKey(config: PageConfig): string;
export declare function getCachedPage(config: PageConfig, locale: Locale): CachedPage;
export declare function getPage(config: PageConfig, cachedPage: CachedPage): Page;
