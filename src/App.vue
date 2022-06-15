<template>
  <div class="app">
    <MyEditor v-model="state" />
  </div>
</template>

<script lang="ts">
import { defineComponent, provide, ref } from 'vue';
import MyEditor from './packages/myEditor'
import { registerConfig as config } from './utils/editorConfig'

export default defineComponent({
  name: 'App',
  components: {
    MyEditor
  },
  setup() {
    const data = require('./components/data.json')
    const state = ref(data)

    provide('config', config) // 跨层级提供物料数据
    
    return {
      state
    }
  }
});
</script>
<style scoped>
.app {
  position: fixed;
  top: 63px;
  left: 0px;
  right: 0px;
  bottom: 0px;
}
</style>
