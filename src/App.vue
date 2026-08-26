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
  '#3D46C2',
  '#ff4757',
  '#ffa502',
  '#1e90ff',
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
      <div class="brand">
        <img class="brand-mark" src="/favicon.png" alt="" width="28" height="28" />
        <h1>Liquid Habits</h1>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click="exportData" title="Export Data">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        <button class="icon-btn" @click="openCreateModal" title="Add Habit">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
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
            :style="{ background: color, outline: formColor === color ? '2px solid var(--text-primary)' : 'none', outlineOffset: '2px' }"
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
  padding: 0 20px 20px;
  padding-bottom: max(20px, env(safe-area-inset-bottom));
  box-sizing: border-box;
}

@media (max-width: 480px) {
  .app-container {
    padding: 0 16px 16px;
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
  padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
  padding-bottom: 12px;
  margin-bottom: 20px;
  background: var(--bg-color);
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  padding-right: 20px;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 480px) {
  header {
    margin-left: -16px;
    margin-right: -16px;
    padding-left: 16px;
    padding-right: 16px;
    margin-bottom: 20px;
  }
}

h1 {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.brand-mark {
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  flex-shrink: 0;
  display: block;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  transition: background-color 80ms linear, border-color 80ms linear;
}

.icon-btn:hover {
  background: var(--accent-soft);
}

.icon-btn:active {
  border-color: var(--text-primary);
}

main {
  width: 100%;
}

.habit-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 480px) {
  .habit-grid {
    gap: 10px;
  }
}

.empty-state {
  text-align: center;
  margin-top: 100px;
  color: var(--text-secondary);
}

.cta-btn {
  margin-top: 20px;
  background: var(--create-color);
  color: var(--on-accent);
  padding: 10px 18px;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 14px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 350px;
  animation: slideUp 0.2s ease-out;
}

@media (max-width: 480px) {
  .modal-content {
    padding: 20px;
  }
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.glass-input {
  width: 100%;
  background: var(--c-1);
  border: 1px solid transparent;
  padding: 12px 14px;
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 15px;
  margin-bottom: 16px;
  outline: none;
  box-sizing: border-box;
  transition: background-color 80ms linear, border-color 80ms linear;
}

.glass-input:hover {
  border-color: var(--border);
}

.glass-input:focus {
  border-color: var(--accent-color);
  background: var(--c-1);
}

.field-label {
  display: block;
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.hours-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.hours-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius);
  background: var(--c-1);
  color: var(--text-primary);
  font-size: 20px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color 80ms linear;
}

.hours-btn:active {
  background: var(--border);
}

.hours-input {
  flex: 1;
  background: var(--c-1);
  border: 1px solid transparent;
  padding: 10px;
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  -moz-appearance: textfield;
  transition: border-color 80ms linear;
}

.hours-input::-webkit-outer-spin-button,
.hours-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.hours-input:focus {
  border-color: var(--accent-color);
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 24px;
  justify-content: center;
}

.color-dot {
  width: 28px;
  height: 28px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 80ms linear;
  box-sizing: border-box;
}

.color-dot:active {
  transform: scale(0.92);
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 14px;
  transition: opacity 80ms linear;
}

.cancel-btn {
  background: var(--c-1);
  color: var(--text-secondary);
}

.save-btn {
  background: var(--create-color);
  color: var(--on-accent);
}

.save-btn:active {
  opacity: 0.85;
}

.delete-btn {
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: transparent;
  color: var(--danger-color);
  font-size: 13px;
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
