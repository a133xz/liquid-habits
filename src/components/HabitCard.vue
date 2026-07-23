<script setup>
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

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
          <div class="habit-icon">
            <span>{{ habit.name.charAt(0).toUpperCase() }}</span>
          </div>
          <h3 class="habit-name">{{ habit.name }}</h3>
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
            backgroundColor: i <= filledCount ? color : 'rgba(255,255,255,0.05)',
            boxShadow: i <= filledCount ? `0 0 8px ${color}` : 'none'
          }"
        ></div>
      </button>
    </div>

    <div class="card-glow" :style="{ background: color }"></div>
  </div>
</template>

<style scoped>
.habit-card {
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 4px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px;
  padding-left: 12px;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
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
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  cursor: grab;
  touch-action: none;
  -webkit-tap-highlight-color: transparent;
}

.habit-drag-handle:active {
  cursor: grabbing;
  background: rgba(255, 255, 255, 0.1);
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

.habit-card:has(.grid-container:active) {
  transform: scale(0.98);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  z-index: 2;
  position: relative;
}

.habit-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.habit-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--text-primary);
  flex-shrink: 0; 
}

.habit-name {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 130px;
}

.habit-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.habit-stats {
  text-align: right;
  background: rgba(0,0,0,0.2);
  padding: 6px 12px;
  border-radius: 20px;
}

.edit-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.14);
  color: var(--text-primary);
}

.edit-btn:active {
  transform: scale(0.94);
}

.count {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.unit {
  font-size: 12px;
  color: var(--text-secondary);
  margin-left: 2px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 6px;
  z-index: 2;
  position: relative;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: gap 0.3s ease;
  -webkit-tap-highlight-color: transparent;
}

.grid-dot {
  aspect-ratio: 1;
  border-radius: 4px;
  transition: all 0.3s ease;
  pointer-events: none;
}

.card-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 1;
  pointer-events: none;
}

@media (max-width: 480px) {
  .habit-card {
    padding: 16px;
    padding-left: 10px;
    border-radius: 20px;
  }
  
  .card-header {
    margin-bottom: 16px; 
  }
  
  .habit-name {
    font-size: 16px;
    max-width: 100px;
  }

  .edit-btn {
    width: 32px;
    height: 32px;
  }
  
  .grid-container {
    gap: 4px;
  }
  
  .grid-dot {
    border-radius: 2px;
  }
}
</style>
