import { computed, defineComponent, inject, ref } from "vue";
import { DArrowLeft, DArrowRight, Download, Upload, SortDown, SortUp, Delete, View, Hide, CloseBold } from '@element-plus/icons-vue'
import './editor.less'
import EditorBlock from "./editorBlock"
import EditorOperator from './editorOperator'
import deepcopy from "deepcopy"
import useMenuDragger from './useMenuDragger'
import useFocus from './useFocus'
import useBlockDragger from './useBlockDragger'
import useCommand from "./useCommand"
import { $dialog } from "@/components/myDiaglog"
import { $dropdown, DropdownItem } from "@/components/myDropdown"

export default defineComponent({
  props: {
    modelValue: { type: Object },
    formData: {type: Object}
  },
  emits: ['update:modelValue'],
  setup(props, ctx) {
    // 预览的时候内容不能再操作，可以点击输入内容方便看效果
    const previewRef = ref(false)
    const editorRef = ref(true)

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
    const { blockMousedown, containerMousedown, focusData, lastSelectBlock, clearBlockFocus } = useFocus(data, previewRef, (e) => {
      // 获取焦点后进行拖拽
      mousedown(e)
    })
    // 2.实现组件拖拽
    const { mousedown, markLine } = useBlockDragger(focusData, lastSelectBlock, data)

    // 3.撤销&重做
    const { commands } = useCommand(data, focusData)
    const buttons = [
      { label: '撤销', icon: <DArrowLeft />, handler: () => commands.undo() },
      { label: '还原', icon: <DArrowRight />, handler: () => commands.redo() },
      {
        label: '导出', icon: <Upload />, handler: () => {
          $dialog({
            title: '导出json使用',
            content: JSON.stringify(data.value),
            footer: true
          })
        }
      },
      {
        label: '导入', icon: <Download />, handler: () => {
          $dialog({
            title: '导入json使用',
            content: '',
            footer: true,
            onConfirm(text) {
              // data.value = JSON.parse(text)
              commands.updateContainer(JSON.parse(text))
            }
          })
        }
      },
      { label: '置顶', icon: <SortUp />, handler: () => commands.placeTop() },
      { label: '置底', icon: <SortDown />, handler: () => commands.placeBottom() },
      { label: '删除', icon: <Delete />, handler: () => commands.delete() },
      {
        label: () => previewRef.value ? '编辑' : '预览',
        icon: () => previewRef.value ? <Hide /> : <View />,
        handler: () => {
          previewRef.value = !previewRef.value
          clearBlockFocus()
        }
      },
      { label: '关闭', icon: <CloseBold />, handler: () => {
        editorRef.value = false
        clearBlockFocus()
      } },
    ]

    const onContextMenuBlock = (e, block) => {
      e.preventDefault()
      $dropdown({
        el: e.target, // 以哪个元素为准产生一个dropdown
        content: () => {
          return <>
            <DropdownItem label="删除" icon={<Delete style="width: 1rem" />} onClick={() => commands.delete()} />
            <DropdownItem label="置顶" icon={<SortUp style="width: 1rem" />} onClick={() => commands.placeTop()} />
            <DropdownItem label="置底" icon={<SortDown style="width: 1rem" />} onClick={() => commands.placeBottom()} />
            <DropdownItem label="查看" icon={<View style="width: 1rem" />} onClick={() => {
              $dialog({
                title: '查看节点数据',
                content: JSON.stringify(block)
              })
            }} />
            <DropdownItem label="导入" icon={<Download style="width: 1rem" />} onClick={() => {
              $dialog({
                title: '导入节点数据',
                content: '',
                footer: true,
                onConfirm(text) {
                  commands.updateBlock(JSON.parse(text), block)
                }
              })
            }} />
          </>
        }
      })
    }

    return () => !editorRef.value ? <>
      <div
        class="editor-container-canvas_content2"
        style={containerStyles.value}
      >
        {data.value.blocks.map((block) =>
          <EditorBlock
            class={'editor-block-preview'}
            v-model:block={block}
            formData={props.formData}
          />
        )}
      </div>
      <el-button type="primary" onClick={() => editorRef.value = true}>继续编辑</el-button>
      {JSON.stringify(props.formData)}
    </> : <div class="app editor">
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
          <el-button-group>
            {buttons.map((btn, index) => {
              const label = typeof btn.label === 'function' ? btn.label() : btn.label
              const icon = typeof btn.icon === 'function' ? btn.icon() : btn.icon
              return <el-button type="primary" icon={icon} key={index} onClick={btn.handler}>
                <span>{label}</span>
              </el-button>
            })}
          </el-button-group>
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
                  class={[
                    block.focus ? 'editor-block-focus' : '',
                    previewRef.value ? 'editor-block-preview' : ''
                  ]}
                  v-model:block={block}
                  formData={props.formData}
                  onMousedown={(e) => blockMousedown(e, block, index)}
                  onContextmenu={(e) => onContextMenuBlock(e, block)}
                />
              )}
              {markLine.x !== null && <div class="line-x" style={{ left: markLine.x + 'px' }}></div>}
              {markLine.y !== null && <div class="line-y" style={{ top: markLine.y + 'px' }}></div>}
            </div>
          </div>
        </div>
      </div>
      <div class="editor-right">
        <EditorOperator
          block={lastSelectBlock.value}
          data={data.value}
          updateContainer={commands.updateContainer}
          updateBlock={commands.updateBlock}
        />
      </div>
    </div>
  }
})