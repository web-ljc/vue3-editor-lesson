import { ref, computed, defineComponent, inject, onMounted } from "vue";

export default defineComponent({
  props: ['block'],
  emits: ['update: block'],

  setup(props, ctx) {
    const blockData = computed({
      get: () => props.block,
      set: (val) => {
        ctx.emit('update: block', val)
      }
    })
    // 模块样式属性
    const blockStyles = computed(() => ({
      top: `${blockData.value.top}px`,
      left: `${blockData.value.left}px`,
      zIndex: blockData.value.zIndex
    }))

    // 获取物料信息
    const config = inject('config')

    const blockRef = ref(null)
    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value
      if(blockData.value.alginCenter) { // 说明是拖拽松手的时候才渲染，其它的默认渲染到页面上内容不需要居中
        blockData.value.top = blockData.value.top - offsetHeight / 2
        blockData.value.left = blockData.value.left - offsetWidth / 2
        blockData.value.alginCenter = false // 让渲染后的结果才能去居中
      }
      blockData.value.width = offsetWidth
      blockData.value.height = offsetHeight
    })
    
    return () =>  {
      // 获取对应的物料信息
      const component = config.componentMap[blockData.value.key]
      // 获取渲染方法
      const RnderComponent = component.render()
      
      return (
        <div class="editor-block" style={blockStyles.value} ref={blockRef}>
          { RnderComponent }
        </div>
      )
    }
  }
})