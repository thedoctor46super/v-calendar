import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
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
import type { ElementTarget, PopoverAction, PopoverPlacement, PopoverOptions } from 'v-popover';
export declare const getType: (value: any) => string;
export declare const isDate: (value: unknown) => value is Date;
export declare const isObject: (value: unknown) => value is Object;
export declare const has: <T>(object: T, path: import("lodash").PropertyPath) => boolean;
export declare const hasAny: (obj: object, props: string[]) => boolean;
export declare const some: {
    <T>(collection: import("lodash").List<T> | null | undefined, predicate?: import("lodash").ListIterateeCustom<T, boolean> | undefined): boolean;
    <T_1 extends object>(collection: T_1 | null | undefined, predicate?: import("lodash").ObjectIterateeCustom<T_1, boolean> | undefined): boolean;
};
export declare const pad: (val: string | number, len: number, char?: string) => string;
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
declare const warnings: {
    visibility: {
        shown: boolean;
        message: string;
    };
    navVisibility: {
        shown: boolean;
        message: string;
    };
    target: {
        shown: boolean;
        message: string;
    };
    interactive: {
        shown: boolean;
        message: string;
    };
    positionFixed: {
        shown: boolean;
        message: string;
    };
    modifiers: {
        shown: boolean;
        message: string;
    };
};
export declare function displayWarning(key: keyof typeof warnings): void;
export declare function cleanPopoverOptions(opts: Partial<LegacyPopoverOptions> & Partial<PopoverOptions>): {
    id?: PropertyKey | undefined;
    autoHide?: boolean | undefined;
    force?: boolean | undefined;
    placement?: import("@floating-ui/utils").Placement | undefined;
    data?: any;
    showDelay?: number | undefined;
    hideDelay?: number | undefined;
    anchor?: ElementTarget;
    name?: PropertyKey | undefined;
    action?: PopoverAction | undefined;
    arrowHidden?: boolean | undefined;
    arrowInsetHorizontal?: number | undefined;
    arrowInsetVertical?: number | undefined;
    arrowSize?: number | undefined;
    autoPlacement?: boolean | {
        crossAxis?: boolean | undefined;
        rootBoundary?: import("@floating-ui/core").RootBoundary | undefined;
        elementContext?: import("@floating-ui/core").ElementContext | undefined;
        altBoundary?: boolean | undefined;
        padding?: import("@floating-ui/utils").Padding | undefined;
        alignment?: import("@floating-ui/utils").Alignment | null | undefined;
        autoAlignment?: boolean | undefined;
        allowedPlacements?: import("@floating-ui/utils").Placement[] | undefined;
        boundary?: import("@floating-ui/dom").Boundary | undefined;
    } | undefined;
    contentClass?: string | undefined;
    componentPrefix?: string | undefined;
    flip?: boolean | {
        mainAxis?: boolean | undefined;
        crossAxis?: boolean | undefined;
        fallbackPlacements?: import("@floating-ui/utils").Placement[] | undefined;
        fallbackStrategy?: "bestFit" | "initialPlacement" | undefined;
        fallbackAxisSideDirection?: "none" | "start" | "end" | undefined;
        flipAlignment?: boolean | undefined;
        rootBoundary?: import("@floating-ui/core").RootBoundary | undefined;
        elementContext?: import("@floating-ui/core").ElementContext | undefined;
        altBoundary?: boolean | undefined;
        padding?: import("@floating-ui/utils").Padding | undefined;
        boundary?: import("@floating-ui/dom").Boundary | undefined;
    } | undefined;
    interactive?: boolean | undefined;
    offset?: import("@floating-ui/dom").OffsetOptions | null | undefined;
    strategy?: import("@floating-ui/utils").Strategy | undefined;
    teleport?: string | null | undefined;
    theme?: "" | "light" | "dark" | null | undefined;
    transitions?: import("v-popover/dist/types/src/utils/types").PopoverTransition[] | undefined;
};
export declare const roundTenth: (n: number) => number;
export declare const isArray: (val: any) => val is any[];
export declare const arrayHasItems: (array: any) => boolean;
export interface ElementPosition {
    top: number;
    left: number;
}
export interface CustomElement {
    addEventListener: Function;
    removeEventListener: Function;
    dispatchEvent: Function;
}
export declare const off: (element: CustomElement, event: string, handler: (e: any) => void, opts?: boolean | EventListenerOptions | undefined) => void;
export declare const on: (element: CustomElement, event: string, handler: (e: any) => void, opts?: boolean | AddEventListenerOptions | undefined) => () => void;
export declare const elementContains: (element: Node, child: Node) => boolean;
export declare const onSpaceOrEnter: (event: KeyboardEvent, handler: (e: KeyboardEvent) => void) => void;
export declare const capitalize: (str: string) => string;
export declare const omit: <T extends object, K extends (keyof T)[]>(obj: T, ...keys: K) => { [K_1 in keyof T]: T[K_1]; };
export declare const pick: <T extends object, K extends keyof T>(obj: T, keys: K[]) => Pick<T, K>;
export declare function extend<T extends object, E extends object>(value: T, ext: E): T & E;
export declare function defaults(target: any, ...sources: any[]): any;
export declare function defaultsDeep(target: any, ...sources: any[]): any;
export declare function clamp(num: number, min: number, max: number): number;
