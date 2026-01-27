import ElementPlus from 'element-plus';
import { createApp } from 'vue';
import App from './App.vue';
import 'element-plus/dist/index.css';

// 挂载应用并注册 Element Plus
createApp(App).use(ElementPlus).mount('#app');
