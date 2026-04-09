<script setup>
import { computed, ref } from 'vue'
import { useMediaQuery, onLongPress } from '@vueuse/core'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['log', 'delete'])

// Responsive grid configuration
const isMobile = useMediaQuery('(max-width: 480px)')
const columns = computed(() => isMobile.value ? 10 : 15)
const rows = 7
const totalDots = computed(() => columns.value * rows)

const filledCount = computed(() => props.habit.logs.length)
// Determine color (default green if not specified)
const color = computed(() => props.habit.color || '#2ed573')

const cardRef = ref(null)

// Long press to delete
onLongPress(cardRef, () => {
  // Vibration for feedback
  if (navigator.vibrate) navigator.vibrate([50, 50, 50])
  emit('delete', props.habit.id)
}, {
  delay: 800, // 800ms hold time
  modifiers: { prevent: true } // Attempt to prevent other interactions
})

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
    <div
      class="habit-card-main"
      ref="cardRef"
      @click="$emit('log', habit.id)"
    >
      <div class="card-header">
        <div class="habit-info">
          <div class="habit-icon">
            <span>{{ habit.name.charAt(0).toUpperCase() }}</span>
          </div>
          <h3 class="habit-name">{{ habit.name }}</h3>
        </div>
        <div class="habit-stats">
          <span class="count">{{ filledCount }}</span>
          <span class="unit">h</span>
        </div>
      </div>

      <div class="grid-container">
        <div
          v-for="i in totalDots"
          :key="i"
          class="grid-dot"
          :style="{
            backgroundColor: i <= filledCount ? color : 'rgba(255,255,255,0.05)',
            boxShadow: i <= filledCount ? `0 0 8px ${color}` : 'none'
          }"
        ></div>
      </div>
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
  cursor: pointer;
}

.habit-card:has(.habit-card-main:active) {
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
  max-width: 150px;
}

.habit-stats {
  text-align: right;
  background: rgba(0,0,0,0.2);
  padding: 6px 12px;
  border-radius: 20px;
  flex-shrink: 0;
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
  /* Use v-bind to inject the reactive column count */
  grid-template-columns: repeat(v-bind(columns), 1fr);
  gap: 6px;
  z-index: 2;
  position: relative;
}

.grid-dot {
  aspect-ratio: 1;
  border-radius: 4px;
  transition: all 0.3s ease;
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

/* Mobile Adjustments */
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
    max-width: 120px;
  }
  
  .grid-container {
    gap: 4px; /* Tighter gap on mobile */
  }
  
  .grid-dot {
    border-radius: 2px;
  }
}
</style>
