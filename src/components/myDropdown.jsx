import { provide, inject, computed, createVNode, defineComponent, onMounted, reactive, render, ref, onBeforeUnmount } from "vue";

export const DropdownItem = defineComponent({
  props: {
    label: String,
    icon: Object
  },
  setup(props) {
    let hide = inject('hide')
    return () => <div class="dropdown-item" onClick={hide}>
      {props.icon}
      <span>{props.label}</span>
    </div>
  }
})

const DropdownComponent = defineComponent({
  props: {
    option: { type: Object }
  },
  setup(props, ctx) {
    const state = reactive({
      option: props.option, // 用户给组件的属性
      isShow: false,
      top: 0,
      left: 0
    })
    ctx.expose({
      showDropdown(option) {
        state.option = option
        state.isShow = true
        let {top, left, height} = option.el.getBoundingClientRect()
        state.top = top + height
        state.left = left
      }
    })
    provide('hide', () => state.isShow = false)
    const classes = computed(() => [
      'dropdown',
      {
        'dropdown-isShow': state.isShow
      }
    ])
    const styles = computed(() => ({
      top: state.top+'px',
      left: state.left+'px',
      zIndex: 10000
    }))
    const el = ref(null)
    const onmousedownDocument = (e) => {
      if(!el.value.contains(e.target)) { // 如果点击的是dropdown内部 什么都不做
        state.isShow = false
      }
    }
    onMounted(() => {
      // 事件的传递行为 先捕获再冒泡
      // 之前为了阻止事件传播 给block 都增加了stopPropagation
      document.body.addEventListener('mousedown', onmousedownDocument ,true)
    })
    onBeforeUnmount(() => {
      document.body.removeEventListener('mousedown', onmousedownDocument)
    })
    return () => {
      return <div class={classes.value} style={styles.value} ref={el}>
        { state.option.content() }
      </div>
    }
  }
})

let vm
export function $dropdown(option) {
  // element-plus中有el-dialog组件
  // 手动挂载组件
  if (!vm) {
    let el = document.createElement('div')
    vm = createVNode(DropdownComponent, { option }) // 将组件渲染成虚拟节点

    // 将el 渲染到页面中
    document.body.appendChild((render(vm, el), el)) // 渲染成真实节点扔到页面
  }
  // 将组件渲染到这个el元素上
  let { showDropdown } = vm.component.exposed
  showDropdown(option) // 其他说明组件已经有了，只需要显示出来就行
}
