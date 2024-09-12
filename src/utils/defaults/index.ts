import { type App, computed, shallowReactive } from 'vue';
import type { DarkModeConfig } from 'vue-screen-utils';
import {
  defaultsDeep,
  cleanPopoverOptions,
  get,
  has,
  mapValues,
} from '../helpers';
import { PopoverOptions, PopoverAction } from 'v-popover';
import locales from './locales';
import masks from './masks.json';
import touch from './touch.json';

declare const window: any;

export type DatePickerPopoverOptions = PopoverOptions & {
  visibility: PopoverAction;
  isInteractive: boolean;
};

export interface Defaults {
  componentPrefix: string;
  color: string;
  isDark: DarkModeConfig;
  navVisibility?: PopoverAction;
  navPopover: Partial<PopoverOptions>;
  titlePosition: string;
  transition: string;
  touch: object;
  masks: object;
  locales: any;
  datePicker: {
    updateOnInput: boolean;
    inputDebounce: number;
    popover: Partial<DatePickerPopoverOptions>;
  };
}

const defaultConfig: Defaults = {
  componentPrefix: 'V',
  color: 'blue',
  isDark: false,
  navPopover: {
    action: 'click',
    flip: false,
    arrowHidden: false,
    transitions: ['fade', 'slide', 'scale'],
    offset: 8,
  },
  titlePosition: 'center',
  transition: 'slide-h',
  touch,
  masks,
  locales,
  datePicker: {
    updateOnInput: true,
    inputDebounce: 1000,
    popover: {
      action: 'hover-focus',
      placement: 'bottom-start',
      interactive: true,
    },
  },
};

const state = shallowReactive<Defaults>(defaultConfig);

const defaultLocales = computed(() => {
  return mapValues(state.locales, (l: any) => {
    l.masks = defaultsDeep(l.masks, state.masks);
    return l;
  });
});

export { defaultLocales };

export const getDefault = (path: string) => {
  if (typeof window !== 'undefined' && has(window.__vcalendar__, path)) {
    return get(window.__vcalendar__, path);
  }
  return get(state, path);
};

export const setupDefaults = (app: App, userDefaults?: Partial<Defaults>) => {
  app.config.globalProperties.$VCalendar = state;
  if (userDefaults) {
    if (userDefaults.navVisibility) {
      state.navPopover.action = userDefaults.navVisibility;
      delete userDefaults.navVisibility;
      console.warn(
        'The `navVisibility` option is deprecated. Use `navPopover` instead.',
      );
    }
    if (userDefaults.datePicker?.popover) {
      state.datePicker.popover = cleanPopoverOptions(
        userDefaults.datePicker.popover,
      );
    }
  }
  return Object.assign(state, defaultsDeep(userDefaults, state));
};
