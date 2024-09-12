import { DateParts } from '@/utils/date/helpers';
import locales from '@/utils/defaults/locales';
import Locale, { LocaleConfig } from '@/utils/locale';
import lodash from 'lodash';
import { describe, expect, it } from 'vitest';
import { DayData, data } from '../util/dayData';

function matchLocaleWithConfig(locale: Locale, config: Partial<LocaleConfig>) {
  expect(locale.id).toEqual(config.id);
  expect(locale.firstDayOfWeek).toEqual(config.firstDayOfWeek);
  expect(locale.masks.L).toEqual(config.masks.L);
}

function testLocaleKeys(locale: Locale) {
  const keys = [
    'id',
    'firstDayOfWeek',
    'masks',
    'dayNames',
    'dayNamesShort',
    'dayNamesShorter',
    'dayNamesNarrow',
    'monthNames',
    'monthNamesShort',
  ];
  expect(keys.every(k => lodash.has(locale, k))).toEqual(true);
}

describe('Locale', () => {
  it('should initialize with undefined config', () => {
    testLocaleKeys(new Locale());
  });
  it('should initialize with string config', () => {
    const config = 'en-ZA';
    const locale = new Locale(config);
    matchLocaleWithConfig(locale, {
      id: 'en-ZA',
      firstDayOfWeek: 1,
      masks: { L: 'YYYY/MM/DD' },
    });
  });
  it('should initialize with lower-cased string config', () => {
    const config = 'en-za';
    const locale = new Locale(config);
    matchLocaleWithConfig(locale, {
      id: 'en-ZA',
      firstDayOfWeek: 1,
      masks: { L: 'YYYY/MM/DD' },
    });
  });
  it('should initialize with empty string config', () => {
    const config = '';
    testLocaleKeys(new Locale(config));
  });
  it('should initialize with undefined config data', () => {
    const config = {
      id: undefined,
      firstDayOfWeek: undefined,
      masks: undefined,
    };
    testLocaleKeys(new Locale(config));
  });
  it('should initialize with default configs', () => {
    lodash.toPairs(locales).forEach(([id, config]) => {
      const locale = new Locale(id);
      matchLocaleWithConfig(locale, config);
    });
  });
  it('should initialize with partial config data', () => {
    const config = {
      id: 'en',
      firstDayOfWeek: undefined,
      masks: undefined,
    };
    const locale = new Locale(config);
    matchLocaleWithConfig(locale, {
      id: 'en',
      firstDayOfWeek: 1,
      masks: { L: 'MM/DD/YYYY' },
    });
  });
  it('should initialize with overriding config data', () => {
    const config = {
      id: 'en',
      firstDayOfWeek: 3,
      masks: { L: 'DD-MM-YYYY' },
    };
    const locale = new Locale(config);
    matchLocaleWithConfig(locale, config);
  });
  it('should calculate day components correctly', () => {
    const testComponent = (c: DayData) => {
      const locale = new Locale(undefined, c.timezone);
      const day = locale.getDateParts(new Date(c.date));
      const omitKeys = ['date', 'timezone'];
      return Object.keys(c)
        .filter(k => !omitKeys.includes(k))
        .every(k => {
          return c[k as keyof DayData] === day[k as keyof DateParts];
        });
    };
    data.forEach(c => expect(testComponent(c)).toEqual(true));
  });
});
