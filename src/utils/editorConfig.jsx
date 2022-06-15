// 列表区可以显示所有的物料
// key对应的组件映射关系

// interface IComponent {
//   label: string
//   preview: () => {}
//   render: () => {}
//   key: string
// }

function createEditorConfig() {
  const componentList = [] // 左侧物料显示内容
  const componentMap = {} // 显示区域匹配对应物料
  return {
    componentList,
    componentMap,
    register: (component)=> {
      componentList.push(component)
      componentMap[component.key] = component
    }
  }
}

export const registerConfig = createEditorConfig()

// 注册物料信息
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text'
})

registerConfig.register({
  label: '按钮',
  preview: () => <el-button>预览按钮</el-button>,
  render: () => <el-button>渲染按钮</el-button>,
  key: 'button'
})

registerConfig.register({
  label: '输入框',
  preview: () => <el-input>预览输入框</el-input>,
  render: () => <el-input>渲染输入框</el-input>,
  key: 'input'
})
