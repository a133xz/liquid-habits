<script setup>
import { ref } from 'vue'
import { useStorage } from '@vueuse/core'
import HabitCard from './components/HabitCard.vue'

// Store habits in localStorage
const habits = useStorage('my-liquid-habits', [])

// Modal State
const showAddModal = ref(false)
const newHabitName = ref('')
const newHabitColor = ref('#2ed573') // Default green

const colors = [
  '#2ed573', // Green
  '#ff4757', // Red
  '#2f3542', // Grey
  '#ffa502', // Orange
  '#1e90ff', // Blue
  '#3742fa', // Indigo
  '#ff6b81'  // Pink
]

const addHabit = () => {
  if (!newHabitName.value.trim()) return
  
  habits.value.push({
    id: Date.now(),
    name: newHabitName.value,
    color: newHabitColor.value,
    logs: []
  })
  
  newHabitName.value = ''
  showAddModal.value = false
}

const logHabit = (id) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    // Add current timestamp
    habit.logs.push(new Date().toISOString())
    // Trigger haptic feedback if available for PWA feel
    if (navigator.vibrate) navigator.vibrate(10)
  }
}

const deleteHabit = (id) => {
    if(confirm('Delete this habit?')) {
        habits.value = habits.value.filter(h => h.id !== id)
    }
}

const exportData = () => {
  const dataStr = JSON.stringify(habits.value, null, 2)
  const blob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `liquid-habits-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="app-container">
    <header>
      <h1>Liquid Habits</h1>
      <div class="header-actions">
        <button class="icon-btn" @click="exportData" title="Export Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        <button class="icon-btn" @click="showAddModal = true" title="Add Habit">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </header>

    <main>
      <div v-if="habits.length === 0" class="empty-state">
        <p>No habits yet. Start flowing.</p>
        <button class="cta-btn" @click="showAddModal = true">Create Habit</button>
      </div>
      
      <div class="habit-grid" v-else>
        <HabitCard 
          v-for="habit in habits" 
          :key="habit.id" 
          :habit="habit" 
          @log="logHabit"
          @delete="deleteHabit"
        />
      </div>
    </main>

    <!-- Floating Action Button (Mobile) -->
    <button class="fab" @click="showAddModal = true">
      +
    </button>

    <!-- Add Habit Modal -->
    <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
      <div class="modal-content">
        <h2>New Habit</h2>
        <input 
          v-model="newHabitName" 
          type="text" 
          placeholder="e.g. Tennis, Reading..."
          class="glass-input"
          autofocus
          @keyup.enter="addHabit"
        />
        
        <div class="color-picker">
          <div 
            v-for="color in colors" 
            :key="color" 
            class="color-dot"
            :style="{ background: color, border: newHabitColor === color ? '2px solid white' : 'none' }"
            @click="newHabitColor = color"
          ></div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showAddModal = false">Cancel</button>
          <button class="save-btn" @click="addHabit">Create</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  padding-bottom: 120px; /* Space for FAB */
  box-sizing: border-box; /* Ensure padding doesn't overflow */
}

@media (max-width: 480px) {
  .app-container {
    padding: 16px;
    padding-bottom: 100px;
  }
}

header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: max(20px, env(safe-area-inset-top));
  padding-bottom: 20px;
  margin-bottom: 20px;
  /* Glass effect for header */
  background: var(--bg-color); /* Fallback */
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  /* Expand header to full width to cover scroll area */
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

@media (max-width: 480px) {
  header {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 24px;
  }
}

h1 {
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(to right, #fff, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -1px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.icon-btn:active {
  transform: scale(0.95);
}

main {
  width: 100%;
}

.habit-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (max-width: 480px) {
  .habit-grid {
    gap: 16px;
  }
}

.empty-state {
  text-align: center;
  margin-top: 100px;
  color: var(--text-secondary);
}

.cta-btn {
  margin-top: 20px;
  background: white;
  color: black;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: 600;
  font-size: 16px;
}

.fab {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background: linear-gradient(135deg, var(--accent-color), #2ed573);
  box-shadow: 0 10px 30px rgba(46, 213, 115, 0.4);
  color: black;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: transform 0.2s;
  /* Safe area for iphone */
  margin-bottom: env(safe-area-inset-bottom);
}

@media (max-width: 480px) {
  .fab {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }
}

.fab:active {
  transform: scale(0.9);
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: rgba(30,30,40, 0.9);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 30px;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

@media (max-width: 480px) {
  .modal-content {
    padding: 24px;
    border-radius: 20px;
  }
}

@keyframes slideUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 20px;
}

.glass-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 16px;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  margin-bottom: 20px;
  outline: none;
  box-sizing: border-box;
}

.glass-input:focus {
  border-color: var(--accent-color);
  background: rgba(255,255,255,0.08);
}

.color-picker {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  justify-content: center;
}

.color-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.color-dot:active {
  transform: scale(0.9);
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.modal-actions button {
  flex: 1;
  padding: 16px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 16px;
  transition: opacity 0.2s;
}

.cancel-btn {
  background: transparent;
  color: var(--text-secondary);
}

.save-btn {
  background: white;
  color: black;
}

.save-btn:active {
  opacity: 0.8;
}
</style>
