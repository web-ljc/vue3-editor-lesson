import { defineComponent, inject, reactive } from "vue";

export default defineComponent({
  props: {
    block: { type: Object }, // 最后选中的元素
    data: { type: Object } // 所有数据
  },
  setup(props) {
    const form = reactive({
      name: ''
    })
    const config = inject('config') // 组件的配置信息

    return () => {
      let content = []
      if (!props.block) {
        content.push(<>
          <el-form-item label="容器宽度">
            <el-input-number />
          </el-form-item>
          <el-form-item label="容器高度">
            <el-input-number />
          </el-form-item>
        </>)
      } else {
        let component = config.componentMap[props.block.key]
        if (component && component.props) { // {text:{}, size:{}, color:{}}
          const arr = Object.entries(component.props).map(([propName, propConfig]) => {
            console.log(propName);
            return <el-form-item label={propConfig.label}>
              {{
                input: () => <el-input />,
                color: () => <el-color-picker />,
                select: () => <el-select>
                  {propConfig.options.map(opt => {
                    return <el-option label={opt.label} value={opt.value} />
                  })}
                </el-select>
              }[propConfig.type]()}
            </el-form-item>
          })
          content.push(arr)
        }
      }

      return <el-form model={form} labelPosition="top">
        {content}
        <el-form-item>
          <el-button type="primary">应用</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>
    }
  }
})