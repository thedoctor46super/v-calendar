import { type App } from 'vue';
import type { DarkModeConfig } from 'vue-screen-utils';
import { PopoverOptions, PopoverAction } from 'v-popover';
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
declare const defaultLocales: import("vue").ComputedRef<{
    [x: string]: any;
}>;
export { defaultLocales };
export declare const getDefault: (path: string) => any;
export declare const setupDefaults: (app: App, userDefaults?: Partial<Defaults>) => any;
