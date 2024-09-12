import type { PopoverAction, PopoverOptions } from 'v-popover';
import { addDays } from './date/helpers';
import { DateRange, type DateRangeSource } from './date/range';
import {
  Bar,
  BarConfig,
  Content,
  ContentConfig,
  Dot,
  DotConfig,
  Highlight,
  HighlightConfig,
  Profile,
} from './glyph';
import { arrayHasItems, cleanPopoverOptions } from './helpers';
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

let attrKey = 0;

export class Attribute {
  key: string | number = '';
  highlight: Profile<Highlight> | null = null;
  content: Profile<Content> | null = null;
  dot: Profile<Dot> | null = null;
  bar: Profile<Bar> | null = null;
  event: EventConfig | null = null;
  popover: Partial<AttributePopoverConfig> | null = null;
  customData: any = null;
  ranges: DateRange[];
  hasRanges = false;
  order = 0;
  pinPage = false;
  maxRepeatSpan = 0;
  locale: Locale;

  constructor(config: Partial<AttributeConfig>, theme: Theme, locale: Locale) {
    // Assign config
    const { dates } = Object.assign(this, { order: 0, pinPage: false }, config);
    this.popover &&= cleanPopoverOptions(this.popover);
    this.key ||= ++attrKey;
    this.locale = locale;
    // Normalize attribute
    theme.normalizeGlyphs(this);
    // Assign dates
    this.ranges = locale.ranges(dates ?? []);
    this.hasRanges = !!arrayHasItems(this.ranges);
    this.maxRepeatSpan = this.ranges
      .filter(r => r.hasRepeat)
      .map(r => r.daySpan)
      .reduce((res, curr) => Math.max(res, curr), 0);
  }

  intersectsRange({ start, end }: DateRange) {
    if (start == null || end == null) return false;
    const simpleRanges = this.ranges.filter(r => !r.hasRepeat);
    for (const range of simpleRanges) {
      if (range.intersectsDayRange(start.dayIndex, end.dayIndex)) {
        return true;
      }
    }
    const repeatRanges = this.ranges.filter(r => r.hasRepeat);
    if (!repeatRanges.length) return false;
    let day = start;
    if (this.maxRepeatSpan > 1) {
      day = this.locale.getDateParts(addDays(day.date, -this.maxRepeatSpan));
    }
    while (day.dayIndex <= end.dayIndex) {
      for (const range of repeatRanges) {
        if (range.startsOnDay(day)) return true;
      }
      day = this.locale.getDateParts(addDays(day.date, 1));
    }
    return false;
  }
}
