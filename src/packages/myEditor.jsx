import { computed, defineComponent, inject, ref } from "vue";
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
import './editor.less'
import EditorBlock from "./editorBlock";
import deepcopy from "deepcopy";
import useMenuDragger from './useMenuDragger'
import useFocus from './useFocus'
import useBlockDragger from './useBlockDragger'
import useCommand from "./useCommand"

export default defineComponent({
  props: {
    modelValue: { type: Object }
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // 获取入参
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })

    // 根据入参获取显示区域的宽高
    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))

    // 获取左侧物料区数据
    const config = inject('config')
    // 文本渲染区
    const containerRef = ref(null)

    // 1.实现菜单拖拽
    const { dragstart, dragend } = useMenuDragger(containerRef, data)

    // 2.实现获取焦点，选中后可以直接拖拽
    const { blockMousedown, containerMousedown, focusData, lastSelectBlock } = useFocus(data, (e) => {
      // 获取焦点后进行拖拽
      mousedown(e)
    })
    // 2.实现组件拖拽
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)

    // 3.撤销&重做
    const {commands} = useCommand(data)
    const buttons = [
      { label: '撤销', icon: <DArrowLeft />, handler: () => commands.undo() },
      { label: '还原', icon: <DArrowRight />, handler: () => commands.redo() }
    ]

    return () => <div class="editor">
      <div class="editor-left">
        {/* 根据注册列表 渲染对应的内容。 可实现H5的拖拽 */}
        {config.componentList.map((component) => (
          <div
            class="editor-left-item"
            draggable
            onDragstart={e => dragstart(e, component)}
            onDragend={dragend}
          >
            <span>{component.label}</span>
            {component.preview()}
          </div>
        ))}
      </div>
      <div class="editor-center">
        <div class="editor-top">
          {buttons.map((btn, index) => {
            return  <el-button type="primary" icon={btn.icon}  key={index} onClick={btn.handler}>
              <span>{btn.label}</span>
            </el-button>
          })}
        </div>
        <div class="editor-container">
          {/* 负责产生滚动条 */}
          <div class="editor-container-canvas">
            {/* 产生内容区域 */}
            <div
              class="editor-container-canvas_content"
              style={containerStyles.value}
              ref={containerRef}
              onMousedown={containerMousedown}
            >
              {data.value.blocks.map((block, index) =>
                <EditorBlock
                  class={block.focus ? 'editor-block-focus' : ''}
                  v-model:block={block}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                />
              )}
              {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
              {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
            </div>
          </div>
        </div>
      </div>
      <div class="editor-right">属性控制栏目</div>
    </div>
  }
})