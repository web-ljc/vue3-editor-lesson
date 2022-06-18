import { computed, ref } from 'vue'

export default function (data, previewRef, callback) {
  const selectIndex = ref(-1) // 表示任何一个没选中

  // 最后选择的组件
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value])

  // 获取哪些信息被选中
  const focusData = computed(() => {
    const focus = []
    const unfocused = []
    data.value.blocks.forEach(block => (block.focus ? focus : unfocused).push(block))
    return {
      focus,
      unfocused
    }
  })
  // 置空focus
  const clearBlockFocus = () => {
    data.value.blocks.forEach(block => block.focus = false)
  }
  // 选中事件
  const blockMousedown = (e, block, index) => {
    if(previewRef.value) return
    // 阻止默认事件
    e.preventDefault()
    e.stopPropagation()
    // block设置属性focus 获取焦点后将focus变为ture
    if (e.shiftKey) {
      // 按住shiftKey键
      if(focusData.value.focus.length <= 1) {
        block.focus = true // 当只有一个节点被选中时，按住shift键也不会切换focus状态
      } else {
        block.focus = !block.focus
      }
    } else {
      if (!block.focus) {
        clearBlockFocus() // 清空其他人的focus属性
        block.focus = true
      } // 当自己被选中，再次点击时还是选中状态
    }
    selectIndex.value = index
    callback(e)
  }
  const containerMousedown = () => {
    if(previewRef.value) return
    clearBlockFocus() // 点击容器让选中失去焦点
    selectIndex.value = -1
  }

  return {
    blockMousedown,
    containerMousedown,
    clearBlockFocus,
    focusData,
    lastSelectBlock
  }
}