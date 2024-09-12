<template>
  <template v-if="$slots.default">
    <slot v-bind="slotCtx" />
    <PopoverContent
      :name="popoverName"
      placement="bottom-start"
      :class="`vc-date-picker-content vc-${color} vc-${displayMode}`"
      @before-show="onPopoverBeforeShow"
      @after-show="onPopoverAfterShow"
      @before-hide="onPopoverBeforeHide"
      @after-hide="onPopoverAfterHide"
    >
      <DatePickerBase v-bind="$attrs" />
    </PopoverContent>
  </template>
  <DatePickerBase v-else v-bind="$attrs" />
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue';
import { PopoverContent } from 'v-popover';
import { createDatePicker, emits, propsDef } from '../../use/datePicker';
import { omit } from '../../utils/helpers';
import DatePickerBase from './DatePickerBase.vue';

export default defineComponent({
  inheritAttrs: false,
  emits,
  props: propsDef,
  components: {
    DatePickerBase,
    PopoverContent,
  },
  setup(props, ctx) {
    const datePicker = createDatePicker(props, ctx);
    const slotCtx = reactive(omit(datePicker, 'calendarRef'));
    const {
      color,
      displayMode,
      popoverName,
      onPopoverBeforeShow,
      onPopoverAfterShow,
      onPopoverBeforeHide,
      onPopoverAfterHide,
    } = datePicker;

    return {
      slotCtx,
      color,
      displayMode,
      popoverName,
      onPopoverBeforeShow,
      onPopoverAfterShow,
      onPopoverBeforeHide,
      onPopoverAfterHide,
    };
  },
});
</script>

<style>
.vc-date-picker-content.__v-popover-content__ {
  background: var(--vc-bg);
  padding: 0;
}
</style>
