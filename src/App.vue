<script setup>
import { ref, computed } from 'vue'
import { useStorage } from '@vueuse/core'
import draggable from 'vuedraggable'
import HabitCard from './components/HabitCard.vue'

const habits = useStorage('my-liquid-habits', [])

const showModal = ref(false)
const editingId = ref(null)
const formName = ref('')
const formColor = ref('#2ed573')
const formHours = ref(0)

const colors = [
  '#2ed573',
  '#ff4757',
  '#2f3542',
  '#ffa502',
  '#1e90ff',
  '#3742fa',
  '#ff6b81'
]

const isEditing = computed(() => editingId.value !== null)

const normalizeHours = (value) => Math.max(0, Math.floor(Number(value) || 0))

const resizeLogs = (logs, count) => {
  const n = normalizeHours(count)
  if (n <= logs.length) return logs.slice(0, n)
  const next = [...logs]
  while (next.length < n) next.push(new Date().toISOString())
  return next
}

const openCreateModal = () => {
  editingId.value = null
  formName.value = ''
  formColor.value = '#2ed573'
  formHours.value = 0
  showModal.value = true
}

const openEditModal = (id) => {
  const habit = habits.value.find(h => h.id === id)
  if (!habit) return
  editingId.value = id
  formName.value = habit.name
  formColor.value = habit.color || '#2ed573'
  formHours.value = habit.logs.length
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
  formName.value = ''
  formHours.value = 0
}

const adjustHours = (delta) => {
  formHours.value = Math.max(0, normalizeHours(formHours.value) + delta)
}

const saveHabit = () => {
  if (!formName.value.trim()) return

  const hours = normalizeHours(formHours.value)

  if (isEditing.value) {
    const habit = habits.value.find(h => h.id === editingId.value)
    if (!habit) return
    habit.name = formName.value.trim()
    habit.color = formColor.value
    habit.logs = resizeLogs(habit.logs, hours)
  } else {
    habits.value.push({
      id: Date.now(),
      name: formName.value.trim(),
      color: formColor.value,
      logs: resizeLogs([], hours)
    })
  }

  closeModal()
}

const logHabit = (id) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    habit.logs.push(new Date().toISOString())
    if (navigator.vibrate) navigator.vibrate(10)
  }
}

const deleteHabit = () => {
  if (!isEditing.value) return
  if (!confirm('Delete this habit?')) return
  habits.value = habits.value.filter(h => h.id !== editingId.value)
  closeModal()
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
        <button class="icon-btn" @click="openCreateModal" title="Add Habit">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
    </header>

    <main>
      <div v-if="habits.length === 0" class="empty-state">
        <p>No habits yet. Start flowing.</p>
        <button class="cta-btn" @click="openCreateModal">Create Habit</button>
      </div>

      <draggable
        v-else
        v-model="habits"
        item-key="id"
        tag="div"
        class="habit-grid"
        handle=".habit-drag-handle"
        :animation="200"
        ghost-class="habit-card-ghost"
      >
        <template #item="{ element }">
          <HabitCard
            :habit="element"
            @log="logHabit"
            @edit="openEditModal"
          />
        </template>
      </draggable>
    </main>

    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ isEditing ? 'Edit Habit' : 'New Habit' }}</h2>
        <input
          v-model="formName"
          type="text"
          placeholder="e.g. Tennis, Reading..."
          class="glass-input"
          autofocus
          @keyup.enter="saveHabit"
        />

        <label class="field-label">Hours</label>
        <div class="hours-control">
          <button type="button" class="hours-btn" @click="adjustHours(-1)" aria-label="Decrease hours">−</button>
          <input
            v-model.number="formHours"
            type="number"
            min="0"
            class="hours-input"
            @keyup.enter="saveHabit"
          />
          <button type="button" class="hours-btn" @click="adjustHours(1)" aria-label="Increase hours">+</button>
        </div>

        <div class="color-picker">
          <div
            v-for="color in colors"
            :key="color"
            class="color-dot"
            :style="{ background: color, border: formColor === color ? '2px solid white' : 'none' }"
            @click="formColor = color"
          ></div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="closeModal">Cancel</button>
          <button class="save-btn" @click="saveHabit">{{ isEditing ? 'Save' : 'Create' }}</button>
        </div>

        <button v-if="isEditing" type="button" class="delete-btn" @click="deleteHabit">
          Delete habit
        </button>
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
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .app-container {
    padding: 16px;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
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
  background: var(--bg-color);
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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

.field-label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.hours-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.hours-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(255,255,255,0.08);
  color: white;
  font-size: 22px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hours-btn:active {
  background: rgba(255,255,255,0.16);
}

.hours-input {
  flex: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px;
  border-radius: 14px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  -moz-appearance: textfield;
}

.hours-input::-webkit-outer-spin-button,
.hours-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.hours-input:focus {
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

.delete-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: transparent;
  color: #ff4757;
  font-size: 14px;
  font-weight: 600;
}

.delete-btn:active {
  opacity: 0.7;
}
</style>

<style>
.habit-card-ghost {
  opacity: 0.45;
}
</style>
