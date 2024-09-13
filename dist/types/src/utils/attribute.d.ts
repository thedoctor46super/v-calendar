import type { PopoverAction, PopoverOptions } from 'v-popover';
import { DateRange, type DateRangeSource } from './date/range';
import { Bar, BarConfig, Content, ContentConfig, Dot, DotConfig, Highlight, HighlightConfig, Profile } from './glyph';
import Locale from './locale';
import { Theme } from './theme';
export interface AttributePopoverConfig extends PopoverOptions {
    label: string;
    visibility: PopoverAction;
    hideIndicator: boolean;
    isInteractive: boolean;
}
export type EventConfig = Partial<{
    label: string;
}>;
export type AttributeConfig = Partial<{
    key: string | number;
    content: ContentConfig;
    highlight: HighlightConfig;
    dot: DotConfig;
    bar: BarConfig;
    popover: Partial<AttributePopoverConfig>;
    event: EventConfig;
    dates: DateRangeSource[];
    customData: any;
    order: number;
    pinPage: boolean;
}>;
export declare class Attribute {
    key: string | number;
    highlight: Profile<Highlight> | null;
    content: Profile<Content> | null;
    dot: Profile<Dot> | null;
    bar: Profile<Bar> | null;
    event: EventConfig | null;
    popover: Partial<AttributePopoverConfig> | null;
    customData: any;
    ranges: DateRange[];
    hasRanges: boolean;
    order: number;
    pinPage: boolean;
    maxRepeatSpan: number;
    locale: Locale;
    constructor(config: Partial<AttributeConfig>, theme: Theme, locale: Locale);
    intersectsRange({ start, end }: DateRange): boolean;
}
