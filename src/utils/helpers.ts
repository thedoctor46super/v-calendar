import _has from 'lodash/has';
import _isDate from 'lodash/isDate';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import _some from 'lodash/some';

export { isFunction, isString };
export { default as isBoolean } from 'lodash/isBoolean';
export { default as isNumber } from 'lodash/isNumber';
export { default as isUndefined } from 'lodash/isUndefined';
export { default as get } from 'lodash/get';
export { default as set } from 'lodash/set';
export { default as mapValues } from 'lodash/mapValues';
export { default as map } from 'lodash/map';
export { default as head } from 'lodash/head';
export { default as last } from 'lodash/last';

import type {
  ElementTarget,
  PopoverAction,
  PopoverPlacement,
  PopoverOptions,
} from 'v-popover';

// Type checkers
export const getType = (value: any) =>
  Object.prototype.toString.call(value).slice(8, -1);
export const isDate = (value: unknown): value is Date =>
  _isDate(value) && !isNaN(value.getTime());
export const isObject = (value: unknown): value is Object =>
  getType(value) === 'Object';

// Object utils
export const has = _has;
export const hasAny = (obj: object, props: string[]) =>
  _some(props, p => _has(obj, p));

// Collection utils
export const some = _some;

export const pad = (val: string | number, len: number, char = '0') => {
  val = val !== null && val !== undefined ? String(val) : '';
  len = len || 2;
  while (val.length < len) {
    val = `${char}${val}`;
  }
  return val;
};

export interface LegacyPopoverOptions {
  id: PropertyKey;
  visibility: PopoverAction;
  isInteractive: boolean;
  autoHide: boolean;
  force: boolean;
  target: ElementTarget;
  modifiers: any;
  placement: PopoverPlacement;
  positionFixed: boolean;
  data: any;
  showDelay: number;
  hideDelay: number;
}

const warnings = {
  visibility: {
    shown: false,
    message: 'Popover option `visibility` is deprecated. Use `action` instead.',
  },
  navVisibility: {
    shown: false,
    message:
      'The `navVisibility` prop is deprecated. Use `navPopover` instead.',
  },
  target: {
    shown: false,
    message: 'Popover option `target` is deprecated. Use `anchor` instead.',
  },
  interactive: {
    shown: false,
    message:
      'Popover option `isInteractive` is deprecated. Use `interactive` instead.',
  },
  positionFixed: {
    shown: false,
    message:
      'Popover option `positionFixed` is deprecated. Use `strategy` instead.',
  },
  modifiers: {
    shown: false,
    message: 'Popover option `modifiers` is deprecated.',
  },
};

export function displayWarning(key: keyof typeof warnings) {
  if (!warnings[key].shown) {
    console.warn(warnings[key].message);
    warnings[key].shown = true;
  }
}

export function cleanPopoverOptions(
  opts: Partial<LegacyPopoverOptions> & Partial<PopoverOptions>,
) {
  const {
    visibility,
    target,
    isInteractive,
    modifiers,
    positionFixed,
    ...cleanOpts
  } = opts;
  if (visibility != null) {
    displayWarning('visibility');
    cleanOpts.action = visibility;
  }
  if (target != null) {
    displayWarning('target');
    cleanOpts.anchor = target;
  }
  if (isInteractive != null) {
    displayWarning('interactive');
    cleanOpts.interactive = isInteractive;
  }
  if (positionFixed != null) {
    displayWarning('positionFixed');
    cleanOpts.strategy = positionFixed ? 'fixed' : 'absolute';
  }
  if (modifiers != null) {
    displayWarning('modifiers');
  }
  return cleanOpts;
}

export const roundTenth = (n: number) => {
  return Math.round(n * 100) / 100;
};

export const isArray = (val: any): val is any[] => Array.isArray(val);

export const arrayHasItems = (array: any): boolean =>
  isArray(array) && array.length > 0;

export interface ElementPosition {
  top: number;
  left: number;
}

export interface CustomElement {
  addEventListener: Function;
  removeEventListener: Function;
  dispatchEvent: Function;
}

export const off = (
  element: CustomElement,
  event: string,
  handler: (e: any) => void,
  opts: boolean | EventListenerOptions | undefined = undefined,
) => {
  element.removeEventListener(event, handler, opts);
};

export const on = (
  element: CustomElement,
  event: string,
  handler: (e: any) => void,
  opts: boolean | AddEventListenerOptions | undefined = undefined,
) => {
  element.addEventListener(event, handler, opts);
  return () => off(element, event, handler, opts);
};

export const elementContains = (element: Node, child: Node) =>
  !!element && !!child && (element === child || element.contains(child));

export const onSpaceOrEnter = (
  event: KeyboardEvent,
  handler: (e: KeyboardEvent) => void,
) => {
  if (event.key === ' ' || event.key === 'Enter') {
    handler(event);
    event.preventDefault();
  }
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const omit = <T extends object, K extends [...(keyof T)[]]>(
  obj: T,
  ...keys: K
) => {
  const ret = {} as {
    [K in keyof typeof obj]: (typeof obj)[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const ret: any = {};
  keys.forEach(key => {
    if (key in obj) ret[key] = obj[key];
  });
  return ret;
};

export function extend<T extends object, E extends object>(
  value: T,
  ext: E,
): T & E {
  const handler = {
    get(target: T, prop: keyof (T | E)) {
      if ((prop as string) in target) {
        return target[prop];
      }
      return ext[prop];
    },
  };
  // @ts-ignore
  return new Proxy(value, handler) as T & E;
}

export function defaults(target: any, ...sources: any[]) {
  for (let source of sources) {
    if (source != null) {
      for (const key in source) {
        if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

export function defaultsDeep(target: any, ...sources: any[]) {
  for (let source of sources) {
    if (source != null) {
      for (const key in source) {
        if (typeof source[key] === 'object' && target[key]) {
          defaultsDeep(target[key], source[key]);
        } else if (target[key] === undefined) {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

export function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}
