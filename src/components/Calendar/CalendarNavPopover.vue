<template>
  <PopoverContent
    :name="navPopoverName"
    :class="['vc-nav-popover-container', `vc-${color}`, `vc-${displayMode}`]"
  >
    <template #default="{ data }">
      <CalendarPageProvider :page="data.page">
        <CalendarSlot name="nav">
          <CalendarNav />
        </CalendarSlot>
      </CalendarPageProvider>
    </template>
  </PopoverContent>
</template>

<script setup lang="ts">
import { PopoverContent } from 'v-popover';
import { useCalendar } from '../../use/calendar';
import CalendarNav from './CalendarNav.vue';
import CalendarPageProvider from './CalendarPageProvider.vue';
import CalendarSlot from './CalendarSlot.vue';

const { navPopoverName, color, displayMode } = useCalendar();
</script>
