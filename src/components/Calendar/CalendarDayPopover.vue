<template>
  <PopoverContent
    :name="dayPopoverName"
    :class="[`vc-${color}`, `vc-${displayMode}`]"
  >
    <template #default="{ data: { day, attributes }, hide }">
      <CalendarSlot
        name="day-popover"
        :day="day"
        :dayTitle="dayTitle(day)"
        :attributes="attributes"
        :format="format"
        :masks="masks"
        :hide="hide"
      >
        <div class="vc-day-popover-container">
          <div v-if="masks.dayPopover" class="vc-day-popover-header">
            {{ dayTitle(day) }}
          </div>
          <CalendarDayPopoverRow
            v-for="attribute in attributes"
            :key="attribute.key"
            :attribute="attribute"
          />
        </div>
      </CalendarSlot>
    </template>
  </PopoverContent>
</template>

<script setup lang="ts">
import { PopoverContent } from 'v-popover';
import { useCalendar } from '../../use/calendar';
import { CalendarDay } from '../../utils/page';
import CalendarDayPopoverRow from './CalendarDayPopoverRow.vue';
import CalendarSlot from './CalendarSlot.vue';

const { dayPopoverName, displayMode, color, masks, locale } = useCalendar();

function format(date: Date, mask: string) {
  return locale.value.formatDate(date, mask);
}

function dayTitle(day: CalendarDay) {
  return locale.value.formatDate(day.date, masks.value.dayPopover);
}
</script>

<style>
.vc-day-popover-container {
  font-size: var(--vc-text-xs);
  font-weight: var(--vc-font-medium);
}

.vc-day-popover-header {
  font-size: var(--vc-text-xs);
  color: var(--vc-day-popover-header-color);
  font-weight: var(--vc-font-semibold);
  text-align: center;
}
</style>
