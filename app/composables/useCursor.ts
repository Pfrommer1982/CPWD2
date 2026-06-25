export type CursorState = 'default' | 'hover' | 'view' | 'drag'

const cursorState = ref<CursorState>('default')
const cursorVisible = ref(false)

export function useCursor() {
  function setCursorState(state: CursorState) {
    cursorState.value = state
  }

  function setCursorVisible(visible: boolean) {
    cursorVisible.value = visible
  }

  return {
    cursorState: readonly(cursorState),
    cursorVisible: readonly(cursorVisible),
    setCursorState,
    setCursorVisible,
  }
}
