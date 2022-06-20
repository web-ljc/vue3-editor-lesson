import { defineComponent, inject, reactive, watch } from "vue";
import deepcopy from "deepcopy"

export default defineComponent({
  props: {
    block: { type: Object }, // 最后选中的元素
    data: { type: Object }, // 所有数据
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },
  setup(props) {
    const config = inject('config') // 组件的配置信息
    const state = reactive({
      editData: {}
    })
    const reset = () => {
      if (!props.block) { // 说明要绑定的是容器宽高
        state.editData = deepcopy(props.data.container)
      } else {
        state.editData = deepcopy(props.block)
      }
    }
    const apply = () => {
      if (!props.block) { // 更改组件容器大小
        props.updateContainer({ ...props.data, container: state.editData })
      } else { // 更改组件的配置
        props.updateBlock(state.editData, props.block)
      }
    }
    watch(() => props.block, reset, { immediate: true })

    return () => {
      let content = []
      if (!props.block) {
        content.push(<>
          <el-form-item label="容器宽度">
            <el-input-number v-model={state.editData.width} />
          </el-form-item>
          <el-form-item label="容器高度">
            <el-input-number v-model={state.editData.height} />
          </el-form-item>
        </>)
      } else {
        let component = config.componentMap[props.block.key]
        if (component && component.props) { // {text:{}, size:{}, color:{}}
          content.push(Object.entries(component.props).map(([propName, propConfig]) => {
            return <el-form-item label={propConfig.label}>
              {{
                input: () => <el-input v-model={state.editData.props[propName]} />,
                color: () => <el-color-picker v-model={state.editData.props[propName]} />,
                select: () => <el-select v-model={state.editData.props[propName]}>
                  {propConfig.options.map(opt => {
                    return <el-option label={opt.label} value={opt.value} />
                  })}
                </el-select>
              }[propConfig.type]()}
            </el-form-item>
          }))
        }
        if (component && component.model) {
          content.push(Object.entries(component.model).map(([modelName, label]) => { // default
            return <el-form-item label={label}>
              {/* model => {deafult: 'username'} */}
              <el-input v-model={state.editData.model[modelName]} />
            </el-form-item>
          }))
        }
      }

      return <el-form labelPosition="top">
        {content}
        <el-form-item>
          <el-button type="primary" onClick={() => apply()}>应用</el-button>
          <el-button onClick={reset}>重置</el-button>
        </el-form-item>
      </el-form>
    }
  }
})