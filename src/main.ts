import './public-path'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import routes from './router'

// @ts-ignore
let instance:any = null;
function render(props = {}) {
  // @ts-ignore
  const { container } = props;
  instance = createApp(App)
  instance.use(routes)
  instance.use(ElementPlus)
  instance.mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时
// @ts-ignore
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

// createApp(App).mount('#app')

export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}
// @ts-ignore
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  render(props);
  instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
  instance.config.globalProperties.$setGlobalState = props.setGlobalState;
}
// @ts-ignore
export async function unmount() {
  instance.unmount();
  instance._container.innerHTML = '';
  instance = null;
}
