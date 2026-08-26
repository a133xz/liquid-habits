<script setup>
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { formatDistanceToNow } from 'date-fns'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['log', 'edit'])

const isMobile = useMediaQuery('(max-width: 480px)')
const baseColumns = computed(() => isMobile.value ? 10 : 15)
const rows = 7

const filledCount = computed(() => props.habit.logs.length)

// Grow columns once the grid would be full so squares shrink and never stay completely filled
const columns = computed(() => {
  const base = baseColumns.value
  const minDots = Math.max(base * rows, filledCount.value + 1)
  return Math.max(base, Math.ceil(minDots / rows))
})
const totalDots = computed(() => columns.value * rows)

const color = computed(() => props.habit.color || '#2ed573')

const lastLoggedLabel = computed(() => {
  const logs = props.habit.logs
  if (!logs?.length) return 'Not logged yet'
  const last = logs[logs.length - 1]
  return formatDistanceToNow(new Date(last), { addSuffix: true })
})

const onEdit = () => {
  if (navigator.vibrate) navigator.vibrate(10)
  emit('edit', props.habit.id)
}

const onLog = () => {
  emit('log', props.habit.id)
}
</script>

<template>
  <div class="habit-card">
    <button
      type="button"
      class="habit-drag-handle"
      aria-label="Drag to reorder"
      title="Drag to reorder"
      @click.stop
    >
      <span class="handle-bar" aria-hidden="true" />
      <span class="handle-bar" aria-hidden="true" />
      <span class="handle-bar" aria-hidden="true" />
    </button>
    <div class="habit-card-main">
      <div class="card-header">
        <div class="habit-info">
          <div class="habit-icon" :style="{ background: color }">
            <span>{{ habit.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="habit-meta">
            <h3 class="habit-name">{{ habit.name }}</h3>
            <p class="habit-last">{{ lastLoggedLabel }}</p>
          </div>
        </div>
        <div class="habit-actions">
          <div class="habit-stats">
            <span class="count">{{ filledCount }}</span>
            <span class="unit">h</span>
          </div>
          <button
            type="button"
            class="edit-btn"
            aria-label="Edit habit"
            title="Edit habit"
            @click.stop="onEdit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="grid-container"
        aria-label="Log one hour"
        title="Tap to log 1 hour"
        @click="onLog"
      >
        <div
          v-for="i in totalDots"
          :key="i"
          class="grid-dot"
          :style="{
            backgroundColor: i <= filledCount ? color : 'var(--accent-soft)',
          }"
        ></div>
      </button>
    </div>
  </div>
</template>

<style scoped>
.habit-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  padding-left: 10px;
  overflow: hidden;
  transition: border-color 80ms linear;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.habit-card:hover {
  border-color: var(--glass-highlight);
}

.habit-drag-handle {
  flex-shrink: 0;
  align-self: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 28px;
  min-height: 44px;
  padding: 8px 6px;
  margin: -4px 0;
  border: none;
  border-radius: var(--radius);
  background: var(--accent-soft);
  color: var(--text-secondary);
  cursor: grab;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 80ms linear, color 80ms linear;
}

.habit-drag-handle:active {
  cursor: grabbing;
  background: var(--border);
}

.handle-bar {
  display: block;
  height: 2px;
  width: 100%;
  border-radius: 1px;
  background: currentColor;
  opacity: 0.7;
}

.habit-card-main {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  z-index: 2;
  position: relative;
  min-width: 0;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.habit-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  flex-shrink: 0;
  opacity: 0.95;
}

.habit-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.habit-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-last {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.habit-stats {
  text-align: right;
  background: var(--accent-soft);
  padding: 6px 10px;
  border-radius: var(--radius);
}

.edit-btn {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: var(--radius);
  background: var(--accent-soft);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 80ms linear, color 80ms linear;
  -webkit-tap-highlight-color: transparent;
}

.edit-btn:hover {
  background: var(--border);
  color: var(--text-primary);
}

.edit-btn:active {
  transform: scale(0.96);
}

.count {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.unit {
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: 2px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), minmax(0, 1fr));
  gap: 5px;
  z-index: 2;
  position: relative;
  width: 100%;
  min-width: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: gap 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.grid-dot {
  aspect-ratio: 1;
  min-width: 0;
  min-height: 0;
  border-radius: 2px;
  transition: background-color 120ms linear;
  pointer-events: none;
}

@media (max-width: 480px) {
  .habit-card {
    padding: 14px;
    padding-left: 8px;
  }

  .card-header {
    margin-bottom: 12px;
  }

  .habit-name {
    font-size: 14px;
  }

  .edit-btn {
    width: 32px;
    height: 32px;
  }

  .grid-container {
    gap: 4px;
  }
}
</style>
