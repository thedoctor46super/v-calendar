import { CalendarContext } from '@/use/calendar';
import { DatePickerContext } from '@/use/datePicker';
import { VueWrapper } from '@vue/test-utils';
import { ComponentPublicInstance, UnwrapNestedRefs } from 'vue';
export type CalendarComponent = UnwrapNestedRefs<CalendarContext> & ComponentPublicInstance;
export type DatePickerComponent = UnwrapNestedRefs<DatePickerContext> & ComponentPublicInstance;
export type PluginComponent = CalendarComponent | DatePickerComponent;
export type ComponentMount = (props?: any) => VueWrapper<PluginComponent>;
export declare function mountDp(ctx: any): VueWrapper<DatePickerComponent>;
export declare function getDayClass(vm: PluginComponent, date: Date): string;
export declare function getDayContentClass(vm: PluginComponent, date: Date): string;
export declare function expectValueEmitted(dp: VueWrapper<DatePickerComponent>, value: any): void;
export declare function expectNoValueEmitted(dp: VueWrapper<DatePickerComponent>): void;
export declare function renderFnEvents(evts: Record<string, Function>): Record<string, Function>;
export declare function mountWithInputs(ctx: any): VueWrapper<DatePickerComponent>;
export declare function mountWithRangeInputs(ctx: any): VueWrapper<DatePickerComponent>;
export declare function updateInputs(dp: VueWrapper<DatePickerComponent>, startValue: string, endValue?: string): Promise<unknown>;
