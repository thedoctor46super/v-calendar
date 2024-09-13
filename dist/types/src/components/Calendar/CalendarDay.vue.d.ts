import { type PropType } from 'vue';
import type { Attribute } from '../../utils/attribute';
import type { DateRangeCell } from '../../utils/date/range';
import type { CalendarDay } from '../../utils/page';
declare const _default: import("vue").DefineComponent<{
    day: {
        type: PropType<CalendarDay>;
        required: true;
    };
}, {
    attributes: import("vue").ComputedRef<Attribute[]>;
    attributeCells: import("vue").ComputedRef<DateRangeCell<any>[]>;
    bars: import("vue").ComputedRef<import("../../utils/glyph").Glyph[] | undefined>;
    dayClasses: import("vue").ComputedRef<(string | Object | {
        'vc-day-box-center-center': boolean;
        'is-not-in-month'?: undefined;
    } | {
        'is-not-in-month': boolean;
        'vc-day-box-center-center'?: undefined;
    })[]>;
    dayContentProps: import("vue").ComputedRef<{
        class: (string | any[] | {
            'vc-disabled': boolean;
        } | undefined)[];
        style: {
            [x: string]: any;
        };
        tabindex: string;
        'aria-label': string;
        'aria-disabled': boolean;
        role: string;
    }>;
    dayContentEvents: import("vue").ComputedRef<{
        click(event: MouseEvent): void;
        mouseenter(event: MouseEvent): void;
        mouseleave(event: MouseEvent): void;
        focusin(event: FocusEvent): void;
        focusout(event: FocusEvent): void;
        keydown(event: KeyboardEvent): void;
    }>;
    dayPopover: import("vue").ComputedRef<{
        id?: PropertyKey | undefined;
        autoHide?: boolean | undefined;
        force?: boolean | undefined;
        placement?: import("@floating-ui/utils").Placement | undefined;
        data?: any;
        showDelay?: number | undefined;
        hideDelay?: number | undefined;
        anchor?: import("v-popover").ElementTarget;
        name?: PropertyKey | undefined;
        action?: import("v-popover").PopoverAction | undefined;
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
    } | null>;
    glyphs: import("vue").ComputedRef<{
        popovers: never[];
        highlights?: import("../../utils/glyph").Highlight[] | undefined;
        dots?: import("../../utils/glyph").Glyph[] | undefined;
        bars?: import("../../utils/glyph").Glyph[] | undefined;
        content?: import("../../utils/glyph").Glyph[] | undefined;
    }>;
    dots: import("vue").ComputedRef<import("../../utils/glyph").Glyph[] | undefined>;
    hasDots: import("vue").ComputedRef<boolean>;
    hasBars: import("vue").ComputedRef<boolean>;
    highlights: import("vue").ComputedRef<import("../../utils/glyph").Highlight[] | undefined>;
    hasHighlights: import("vue").ComputedRef<boolean>;
    locale: import("vue").ComputedRef<import("../../utils/locale").default>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    day: {
        type: PropType<CalendarDay>;
        required: true;
    };
}>>, {}>;
export default _default;
