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
  render: ({props}) => <span style={{color: props.color, fontSize:props.size}}>
      {props.text || '渲染文本'}
    </span>,
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
  render: ({props}) => <el-button type={props.type} size={props.size}>
    { props.text || '渲染按钮' }
  </el-button>,
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
      {label: '默认', value: 'default'},
      {label: '大', value: 'large'},
      {label: '小', value: 'small'}
    ])
  }
})

registerConfig.register({
  label: '输入框',
  preview: () => <el-input placeholder="预览输入框" />,
  render: ({model}) => <el-input placeholder="渲染输入框" {...model.default} />,
  key: 'input',
  model: { // {default: 'username'}
    default: '绑定字段'
  }
})
