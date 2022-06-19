import deepcopy from "deepcopy"
import { onUnmounted } from "vue"
import { events } from "./events"

export default function (data, focusData) {
  const state = { // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作指令
    commands: {}, // 制作命令和执行功能一个映射表 
    commandArray: [], // 存放所有的命令
    destroyArray: [] // 存放所有要销毁的订阅
  }

  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = (...args) => { // 命令对应执行函数
      const { redo, undo } = command.execute(...args)
      redo()
      if (!command.pushQueue) return // 不需要放到队列直接跳过
      let { queue, current } = state

      // 组件1 -- 组件2 -- 撤销组件2 -- 组件3
      // 组件1 -- 组件3
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1) // 可能在放置过程中有撤销操作，所以根据当前最新的current值来计算新的队列
        state.queue = queue
      }

      queue.push({ redo, undo }) // 保存指令的前进后退
      state.current = current + 1
      console.log(queue);
    }
  }

  // 注册需要的命令
  // 还原
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          let item = state.queue[state.current + 1] // 还原撤销
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      }
    }
  })
  // 撤销
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return // 没有可撤销的了
          let item = state.queue[state.current] // 找到上一步还原
          if (item) {
            item.undo && item.undo() // 这里没有操作队列
            state.current--
          }
        }
      }
    }
  })
  registry({ // 如果希望将操作放到队列中可以增加一个属性， 标识等会操作要放到队列中
    name: 'drag',
    pushQueue: true,
    init() { // 初始化操作 默认就会执行
      this.before = null
      // 监控拖拽开始事件，保存状态
      const start = () => this.before = deepcopy(data.value.blocks)
      // 拖拽之后需要出发对应的指令
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)
      return () => {
        events.off('start', start)
        events.off('end', end)
      }
    },
    execute() {
      let before = this.before
      let after = data.value.blocks // 之后状态
      return {
        redo() { // 默认一送后 直接把当前事情做了
          data.value = { ...data.value, blocks: after }
        },
        undo() { // 前一步
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  })
  // 带有历史记录模式
  registry({
    name: 'updateContainer',
    pushQueue: true,
    execute(newValue) {
      let state = {
        before: data.value,
        after: newValue
      }

      return {
        redo: () => {
          data.value = state.after
        },
        undo: () => {
          data.value = state.before
        }
      }
    }
  })

  registry({ // 置顶操作
    name: 'placeTop',
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks)
      let after = (() => { // 置顶就是在所有blocks中找到最大的
        let { focus, unfocused } = focusData.value
        // 遍历未选中的最大index值
        let maxZIndex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex)
        }, -Infinity)
        // 让当前选中比最大+1
        focus.forEach(block => block.zIndex = maxZIndex + 1)
        return data.value.blocks
      })()
      return {
        undo: () => {
          // blocks 前后一致则不更新
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      }
    }
  })
  registry({ // 置底操作
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      let before = deepcopy(data.value.blocks)
      let after = (() => { // 置顶就是在所有blocks中找到最大的
        let { focus, unfocused } = focusData.value
        // 遍历未选中的最大index值
        let minZIndex = unfocused.reduce((prev, block) => {
          return Math.min(prev, block.zIndex)
        }, Infinity) - 1
        // 不能直接减1 因为index不能出现负值 负值久看不到组件
        if (minZIndex < 0) { // 如果是负值，让每选中的向上， 自己变成0
          const dur = Math.abs(minZIndex)
          minZIndex = 0
          unfocused.forEach(block => block.zIndex += dur)
        }
        focus.forEach(block => block.zIndex = minZIndex) // 控制选中的值
        return data.value.blocks
      })()
      return {
        undo: () => {
          // blocks 前后一致则不更新
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      }
    }
  })
  registry({ // 删除操作
    name: 'delete',
    pushQueue: true,
    execute() {
      let state = {
        before: deepcopy(data.value.blocks), // 当前值
        after: focusData.value.unfocused // 选中的都删除，留下未选中的
      }
      return {
        undo: () => {
          // blocks 前后一致则不更新
          data.value = { ...data.value, blocks: state.before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: state.after }
        }
      }
    }
  })
  registry({ // 更新某一个
    name: 'updateBlock',
    pushQueue: true,
    execute(newBlock, oldBlock) {
      let state = {
        before: data.value.blocks,
        after: (() => {
          let blocks = [...data.value.blocks] // 拷贝一份用于新block
          const index = data.value.blocks.indexOf(oldBlock) // 找到老的位置
          if (index > -1) blocks.splice(index, 1, newBlock)
          return blocks
        })()
      }
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after }
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before }
        }
      }
    }
  })

  // 按键事件
  const keyboardEvent = (() => {
    const keyCodes = {
      90: 'z',
      89: 'y'
    }
    const onKeydown = (ev) => {
      const { ctrlKey, keyCode } = ev
      let keyString = []
      if (ctrlKey) keyString.push('ctrl')
      keyString.push(keyCodes[keyCode])
      keyString = keyString.join('+')
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return // 没有键盘事件
        if (keyboard === keyString) {
          state.commands[name]()
          ev.preventDefault()
        }
      })
    }

    const init = () => { // 初始化事件
      window.addEventListener('keydown', onKeydown)
      return () => { // 销毁事件
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })()

  ~(() => {
    // 监听键盘事件
    state.destroyArray.push(keyboardEvent())
    // 存放所有待销毁订阅
    state.commandArray.forEach(command => command.init && state.destroyArray.push(command.init()))
  })()

  onUnmounted(() => { // 清理绑定的事件
    state.destroyArray.forEach(fn => fn && fn())
  })

  return state
}