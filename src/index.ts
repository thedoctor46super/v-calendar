import type { App } from 'vue';
import * as components from './components/index';
import './styles/index.css';
import 'v-popover/style.css';
import { setVueInstance } from './utils/config/index';
import { type Defaults, setupDefaults } from './utils/defaults';

const install = (app: App, defaults: Partial<Defaults> = {}) => {
  setVueInstance(app);
  app.use(setupDefaults, defaults);
  const prefix = app.config.globalProperties.$VCalendar.componentPrefix;
  for (const componentKey in components) {
    const component = (components as any)[componentKey];
    app.component(`${prefix}${componentKey}`, component);
  }
};

export default { install };
export * from './components';
export { setupDefaults as setupCalendar } from './utils/defaults';
export { createCalendar, useCalendar } from './use/calendar';
export { createDatePicker, useDatePicker } from './use/datePicker';
export * as Popover from 'v-popover';
