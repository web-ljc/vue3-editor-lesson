<template>
  <MyEditor :data="state" />
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import MyEditor from './packages/myEditor.jsx'


export default defineComponent({
  name: 'App',
  components: {
    MyEditor
  },
  setup() {
    const data = require('./components/data.json')
    const state = ref(data)
    console.log(state, 2);
    
    return {
      state
    }
  }
});
</script>
