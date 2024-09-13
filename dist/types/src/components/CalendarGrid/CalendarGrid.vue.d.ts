declare const _default: import("vue").DefineComponent<{
    events: {
        type: import("vue").PropType<import("../../utils/calendar/event").EventConfig[]>;
        default: () => never[];
    };
    view: {
        type: import("vue").PropType<import("../../use/calendar").CalendarView>;
        default: string;
        validator(value: string): boolean;
    };
    rows: {
        type: NumberConstructor;
        default: number;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    step: NumberConstructor;
    titlePosition: {
        type: import("vue").PropType<import("../../utils/page").TitlePosition>;
        default: () => import("../../utils/page").TitlePosition;
    };
    navVisibility: {
        type: import("vue").PropType<import("v-popover").PopoverAction>;
        default: () => import("v-popover").PopoverAction;
    };
    navPopover: {
        type: import("vue").PropType<Partial<import("v-popover").PopoverOptions>>;
        default: () => any;
    };
    showWeeknumbers: (BooleanConstructor | StringConstructor)[];
    showIsoWeeknumbers: (BooleanConstructor | StringConstructor)[];
    expanded: BooleanConstructor;
    borderless: BooleanConstructor;
    transparent: BooleanConstructor;
    initialPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    initialPagePosition: {
        type: NumberConstructor;
        default: number;
    };
    minPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    maxPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    transition: import("vue").PropType<import("../../use/calendar").MoveTransition>;
    attributes: import("vue").PropType<Partial<{
        key: string | number;
        content: import("../../utils/glyph").ContentConfig;
        highlight: import("../../utils/glyph").HighlightConfig;
        dot: import("../../utils/glyph").DotConfig;
        bar: import("../../utils/glyph").BarConfig;
        popover: Partial<import("../../utils/attribute").AttributePopoverConfig>;
        event: Partial<{
            label: string;
        }>;
        dates: import("../../utils/date/range").DateRangeSource[];
        customData: any;
        order: number;
        pinPage: boolean;
    }>[]>;
    trimWeeks: BooleanConstructor;
    disablePageSwipe: BooleanConstructor;
    color: {
        type: StringConstructor;
        default: () => any;
    };
    isDark: {
        type: import("vue").PropType<boolean | "system" | import("vue-screen-utils").DarkModeClassConfig>;
        default: () => any;
    };
    firstDayOfWeek: import("vue").PropType<import("../../utils/date/helpers").DayOfWeek>;
    masks: ObjectConstructor;
    locale: import("vue").PropType<string | import("../../utils/locale").default | Record<string, any>>;
    timezone: StringConstructor;
    minDate: null;
    maxDate: null;
    disabledDates: null;
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, string[], string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    events: {
        type: import("vue").PropType<import("../../utils/calendar/event").EventConfig[]>;
        default: () => never[];
    };
    view: {
        type: import("vue").PropType<import("../../use/calendar").CalendarView>;
        default: string;
        validator(value: string): boolean;
    };
    rows: {
        type: NumberConstructor;
        default: number;
    };
    columns: {
        type: NumberConstructor;
        default: number;
    };
    step: NumberConstructor;
    titlePosition: {
        type: import("vue").PropType<import("../../utils/page").TitlePosition>;
        default: () => import("../../utils/page").TitlePosition;
    };
    navVisibility: {
        type: import("vue").PropType<import("v-popover").PopoverAction>;
        default: () => import("v-popover").PopoverAction;
    };
    navPopover: {
        type: import("vue").PropType<Partial<import("v-popover").PopoverOptions>>;
        default: () => any;
    };
    showWeeknumbers: (BooleanConstructor | StringConstructor)[];
    showIsoWeeknumbers: (BooleanConstructor | StringConstructor)[];
    expanded: BooleanConstructor;
    borderless: BooleanConstructor;
    transparent: BooleanConstructor;
    initialPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    initialPagePosition: {
        type: NumberConstructor;
        default: number;
    };
    minPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    maxPage: import("vue").PropType<import("../../utils/page").PageAddress>;
    transition: import("vue").PropType<import("../../use/calendar").MoveTransition>;
    attributes: import("vue").PropType<Partial<{
        key: string | number;
        content: import("../../utils/glyph").ContentConfig;
        highlight: import("../../utils/glyph").HighlightConfig;
        dot: import("../../utils/glyph").DotConfig;
        bar: import("../../utils/glyph").BarConfig;
        popover: Partial<import("../../utils/attribute").AttributePopoverConfig>;
        event: Partial<{
            label: string;
        }>;
        dates: import("../../utils/date/range").DateRangeSource[];
        customData: any;
        order: number;
        pinPage: boolean;
    }>[]>;
    trimWeeks: BooleanConstructor;
    disablePageSwipe: BooleanConstructor;
    color: {
        type: StringConstructor;
        default: () => any;
    };
    isDark: {
        type: import("vue").PropType<boolean | "system" | import("vue-screen-utils").DarkModeClassConfig>;
        default: () => any;
    };
    firstDayOfWeek: import("vue").PropType<import("../../utils/date/helpers").DayOfWeek>;
    masks: ObjectConstructor;
    locale: import("vue").PropType<string | import("../../utils/locale").default | Record<string, any>>;
    timezone: StringConstructor;
    minDate: null;
    maxDate: null;
    disabledDates: null;
}>> & {
    [x: `on${Capitalize<string>}`]: ((...args: any[]) => any) | undefined;
}, {
    view: import("../../use/calendar").CalendarView;
    navVisibility: import("v-popover").PopoverAction;
    trimWeeks: boolean;
    titlePosition: import("../../utils/page").TitlePosition;
    color: string;
    isDark: boolean | "system" | import("vue-screen-utils").DarkModeClassConfig;
    navPopover: Partial<import("v-popover").PopoverOptions>;
    rows: number;
    columns: number;
    expanded: boolean;
    borderless: boolean;
    transparent: boolean;
    initialPagePosition: number;
    disablePageSwipe: boolean;
    events: import("../../utils/calendar/event").EventConfig[];
}>;
export default _default;
