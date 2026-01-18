<script setup>
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const props = defineProps({
  habit: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['log'])

// Responsive grid configuration
const isMobile = useMediaQuery('(max-width: 480px)')
const columns = computed(() => isMobile.value ? 10 : 15)
const rows = 7
const totalDots = computed(() => columns.value * rows)

const filledCount = computed(() => props.habit.logs.length)
// Determine color (default green if not specified)
const color = computed(() => props.habit.color || '#2ed573')
</script>

<template>
  <div class="habit-card" @click="$emit('log', habit.id)">
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
    
    <div class="card-glow" :style="{ background: color }"></div>
  </div>
</template>

<style scoped>
.habit-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 24px;
  overflow: hidden;
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.habit-card:active {
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
