import { computed, defineComponent } from "vue";

export default defineComponent({
  props: {
    block: {type: Object},
    component: {type: Object}
  },
  emits: ['update: block'],
  setup(props, ctx) {
    const blockData = computed({
      get: () => props.block,
      set: (val) => {
        ctx.emit('update: block', val)
      }
    })
    const {width, height} = props.component.resize || {}

    let obj = {
      'left': { horizontal: 'start', vertical: 'center' },
      'right': { horizontal: 'end', vertical: 'center' },
      'top': { horizontal: 'center', vertical: 'start' },
      'bottom': { horizontal: 'center', vertical: 'end' },

      'top-left': { horizontal: 'start', vertical: 'start' },
      'top-right': { horizontal: 'end', vertical: 'start' },
      'bottom-left': { horizontal: 'start', vertical: 'end' },
      'bottom-right': { horizontal: 'end', vertical: 'end' }
    },
    data = {}

    const onmousemove = (e) => {
      let {clientX, clientY} = e,
        {startX, startY, startWidth, startHeight,startLeft, startTop, direction} = data
      
      if(direction.horizontal === 'center') { // 如果拖拽的是 中间的点x轴不变
        clientX = startX
      }
      if(direction.vertical === 'center') { // 只能改横向 纵向是不发生变化
        clientY = startY
      }

      let durX = clientX - startX,
        durY = clientY - startY

      if(direction.vertical === 'start') { // 反向拖拽的点，需要取反
        durY = -durY
        blockData.value.top = startTop - durY
      }
      if(direction.horizontal === 'start') {
        durX = -durX
        blockData.value.left = startLeft - durX
      }
      
      const width = startWidth + durX,
       height = startHeight + durY
      
       blockData.value.width = width
       blockData.value.height = height
       blockData.value.hasResize = true
    }

    const onmouseup = () => {
      document.body.removeEventListener('mousemove', onmousemove)
      document.body.removeEventListener('mouseup', onmouseup)
    }

    const onmousedown = (e) => {
      e.stopPropagation()
      let key = e.target.className.split(' ')[1].slice(13)
      data = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: blockData.value.width,
        startHeight: blockData.value.height,
        startLeft: blockData.value.left,
        startTop: blockData.value.top,
        direction: obj[key]
      }
      document.body.addEventListener('mousemove', onmousemove)
      document.body.addEventListener('mouseup', onmouseup)
    }

    return () => {
      return <div onMousedown={e => onmousedown(e)}>
        {width && <>
          <div class="block-resize block-resize-left"/>
          <div class="block-resize block-resize-right"></div>
        </>}
        {height && <>
          <div class="block-resize block-resize-top"></div>
          <div class="block-resize block-resize-bottom"></div>
        </>}
        {width && height && <>
          <div class="block-resize block-resize-top-left"></div>
          <div class="block-resize block-resize-top-right"></div>
          <div class="block-resize block-resize-bottom-left"></div>
          <div class="block-resize block-resize-bottom-right"></div>
        </>}
      </div>
    }
  }
})