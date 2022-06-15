export default function() {
  const state = { // 前进后退需要指针
    current: -1, // 前进后退的索引值
    queue: [], // 存放所有的操作指令
    commands: {}, // 制作命令和执行功能一个映射表 
    commandArray: [] // 存放所有的命令
  }

  const registry = (command) => {
    state.commandArray.push(command)
    state.commands[command.name] = () => { // 命令对应执行函数
      const {redo} = command.execute()
      redo()
    }
  }

  // 注册需要的命令
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          console.log(123);
        }
      }
    }
  })
  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          console.log(2222);
        }
      }
    }
  })
  return state
}