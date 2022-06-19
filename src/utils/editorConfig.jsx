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

const createInputProp = (label) => ({type: 'input', label})
const createColorProp = (label) => ({type: 'color', label})
const createSelectProp = (label, options) => ({type: 'select', label, options})

// 注册物料信息
registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text',
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      {label: '14px', value: '14px'},
      {label: '24px', value: '24px'},
      {label: '34px', value: '34px'}
    ])
  }
})

registerConfig.register({
  label: '按钮',
  preview: () => <el-button>预览按钮</el-button>,
  render: () => <el-button>渲染按钮</el-button>,
  key: 'button',
  props: {
    text: createInputProp('按钮内容'),
    type: createSelectProp('按钮类型', [
      {label: '基础', value: 'primary'},
      {label: '成功', value: 'success'},
      {label: '警告', value: 'warning'},
      {label: '危险', value: 'danger'},
      {label: '文本', value: 'text'},
    ]),
    size: createSelectProp('按钮尺寸', [
      {label: '默认', value: ''},
      {label: '中等', value: 'medium'},
      {label: '小', value: 'small'},
      {label: '极小', value: 'mini'}
    ])
  }
})

registerConfig.register({
  label: '输入框',
  preview: () => <el-input>预览输入框</el-input>,
  render: () => <el-input>渲染输入框</el-input>,
  key: 'input'
})
