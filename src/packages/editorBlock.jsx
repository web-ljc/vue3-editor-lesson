import { ref, computed, defineComponent, inject, onMounted } from "vue";
import BlockResize from "./blockResize";

export default defineComponent({
  props: {
    block: { type: Object },
    formData: { type: Object }
  },
  emits: ['update: block', 'update: formData'],

  setup(props, ctx) {
    const blockData = computed({
      get: () => props.block,
      set: (val) => {
        ctx.emit('update: block', val)
      }
    })
    const formData = computed({
      get: () => props.formData,
      set: (val) => {
        ctx.emit('update: formData', val)
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
      if (blockData.value.alginCenter) { // 说明是拖拽松手的时候才渲染，其它的默认渲染到页面上内容不需要居中
        blockData.value.top = blockData.value.top - offsetHeight / 2
        blockData.value.left = blockData.value.left - offsetWidth / 2
        blockData.value.alginCenter = false // 让渲染后的结果才能去居中
      }
      blockData.value.width = offsetWidth
      blockData.value.height = offsetHeight
    })

    return () => {
      // 获取对应的物料信息
      const component = config.componentMap[blockData.value.key]
      // 获取渲染方法
      const RnderComponent = component.render({
        size: props.block.hasResize ? {width: blockData.value.width, height: blockData.value.height} : {},
        props: blockData.value.props,
        // model: props.block.model > {default:'username'} => {modelValue: FormData.username, 'onUpdate:modelValue':v => FormData.username = v}
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          let propName = blockData.value.model[modelName] // 'username'
          prev[modelName] = {
            modelValue: formData.value[propName], // 值
            'onUpdate:modelValue': v => formData.value[propName] = v
          }
          return prev
        }, {})
      })
      const { width, height } = component.resize || {}
      return <div class="editor-block" style={blockStyles.value} ref={blockRef}>
        {RnderComponent}
        {/* 传递block的目的是为了修改当前block的宽高， component中存放了是修改高度还是宽度 */}
        {blockData.value.focus && (width || height) && <BlockResize 
          block={blockData.value}
          component={component}
        />}
      </div>
    }
  }
})