<template>
  <Example centered>
    <div class="text-lg font-semibold mb-2 mt-0" v-if="action === 'focus'">
      Focus
    </div>
    <div class="text-lg font-semibold mb-2 mt-0" v-if="action === 'click'">
      Click
    </div>
    <VCalendar :attributes="attributes" />
  </Example>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  action: { type: String, default: 'hover' },
  hideIndicators: Boolean,
});

const todos = ref([
  {
    description: 'Take Noah to basketball practice.',
    isComplete: false,
    dates: { repeat: { weekdays: 6 } }, // Every Friday
    color: 'red',
  },
]);

const attributes = computed(() => [
  // Attributes for todos
  ...todos.value.map(todo => ({
    dates: todo.dates,
    dot: {
      color: todo.color,
      ...(todo.isComplete && { class: 'opacity-75' }),
    },
    popover: {
      label: todo.description,
      action: props.action,
      hideIndicator: props.hideIndicators,
    },
  })),
]);
</script>
