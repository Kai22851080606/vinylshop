<script setup>
import { ref, onMounted, provide } from 'vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { authApi } from './api/auth'

const isDark = ref(false)
const isVisionMode = ref(false)
const isAuthenticated = ref(!!authApi.getCurrentUser())
const user = ref(authApi.getCurrentUser())

// Создание сеанса при загрузке страницы
const createSessionOnLoad = async () => {
  const currentUser = authApi.getCurrentUser()
  if (currentUser && currentUser.id) {
    try {
      console.log('🔄 Создание сеанса при загрузке страницы для пользователя:', currentUser.id)
      const response = await fetch('http://localhost:3001/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      })
      const result = await response.json()
      if (result.success) {
        console.log('✅ Сеанс успешно создан')
      } else {
        console.log('⚠️ Ошибка создания сеанса:', result.message)
      }
    } catch (error) {
      console.error('❌ Ошибка при создании сеанса:', error)
    }
  }
}

// Предоставляем состояние всем дочерним компонентам
provide('auth', {
  isAuthenticated,
  user,
  updateAuth: () => {
    isAuthenticated.value = !!authApi.getCurrentUser()
    user.value = authApi.getCurrentUser()
    if (user.value) {
      createSessionOnLoad()
    }
  }
})

// Предоставляем состояние режима для слабовидящих
provide('vision', {
  isVisionMode,
  toggleVision: () => {
    isVisionMode.value = !isVisionMode.value
    if (isVisionMode.value) {
      document.documentElement.classList.add('vision-mode')
      localStorage.setItem('vinyl-vision-mode', 'enabled')
      if (isDark.value) {
        toggleTheme()
      }
    } else {
      document.documentElement.classList.remove('vision-mode')
      localStorage.setItem('vinyl-vision-mode', 'disabled')
    }
  }
})

const toggleTheme = () => {
  if (isVisionMode.value) return
  
  // Мгновенное применение темы с помощью requestAnimationFrame
  requestAnimationFrame(() => {
    isDark.value = !isDark.value
    
    if (isDark.value) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#000000'
      localStorage.setItem('vinyl-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f8fafc'
      localStorage.setItem('vinyl-theme', 'light')
    }
    
    // Принудительное обновление фона для всех элементов
    const mainElement = document.querySelector('main')
    if (mainElement) {
      mainElement.style.backgroundColor = isDark.value ? '#000000' : 'transparent'
    }
  })
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  
  const savedVision = localStorage.getItem('vinyl-vision-mode')
  if (savedVision === 'enabled') {
    isVisionMode.value = true
    document.documentElement.classList.add('vision-mode')
  }
  
  createSessionOnLoad()
})
</script>

<template>
  <div :class="{ 'dark': isDark, 'vision-mode': isVisionMode }" class="min-h-screen flex flex-col">
    <Header @toggle-theme="toggleTheme" />
    <main class="flex-grow container mx-auto px-4 py-8">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style>
@import './assets/main.css';

/* Убираем transition для фона, чтобы цвет менялся мгновенно */
* {
  transition-property: color, border-color, box-shadow, transform, opacity !important;
  transition-duration: 0.2s !important;
}

html, body {
  height: 100%;
  transition: none !important;
}

body {
  margin: 0;
  background-color: #f8fafc;
  transition: none !important;
}

/* Принудительное мгновенное изменение фона для body и main при смене темы */
.dark body,
.dark main {
  background-color: #000000 !important;
  transition: none !important;
}

body,
main {
  transition: none !important;
}

a {
  text-decoration: none !important;
}

/* ===== СВЕТЛАЯ ТЕМА ===== */
a[href="/"] span {
  color: #000000 !important;
}
a[href="/"]:hover span {
  color: #3b82f6 !important;
}

nav a {
  color: #4b5563 !important;
}
nav a:hover {
  color: #3b82f6 !important;
}

a[href="/login"] {
  background-color: transparent !important;
  color: #3b82f6 !important;
  border: none !important;
  font-weight: bold !important;
}
a[href="/login"]:hover {
  background-color: #3b82f6 !important;
  color: white !important;
  border-radius: 0.5rem;
}

a[href="/register"] {
  background-color: transparent !important;
  color: #000000 !important;
  border: none !important;
  font-weight: bold !important;
}
a[href="/register"]:hover {
  background-color: #000000 !important;
  color: white !important;
  border-radius: 0.5rem;
}

a[href="/profile"] {
  color: #4b5563 !important;
}
a[href="/profile"]:hover {
  background-color: #f3f4f6 !important;
  color: #3b82f6 !important;
  border-radius: 0.5rem;
}

button.text-red-600 {
  color: #dc2626 !important;
  text-decoration: none !important;
}
button.text-red-600:hover {
  background-color: #fee2e2 !important;
  color: #b91c1c !important;
  border-radius: 0.5rem;
  padding: 0.25rem 0.5rem;
}

.bg-blue-600 {
  background-color: #3b82f6 !important;
}
.bg-blue-600:hover {
  background-color: #2563eb !important;
}

.text-gray-900 { color: #111827 !important; }
.text-gray-800 { color: #1f2937 !important; }
.text-gray-700 { color: #374151 !important; }
.text-gray-600 { color: #4b5563 !important; }
.text-gray-500 { color: #6b7280 !important; }
.text-gray-400 { color: #9ca3af !important; }

/* ===== ТЁМНАЯ ТЕМА ===== */
.dark body {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.dark header {
  background-color: #000000 !important;
  border-bottom: 2px solid #ffffff !important;
}

.dark header span, 
.dark header nav a, 
.dark header button {
  color: #ffffff !important;
}

.dark a[href="/"] span {
  color: #ffffff !important;
}
.dark a[href="/"]:hover span {
  color: #60a5fa !important;
}

.dark nav a {
  color: #ffffff !important;
}
.dark nav a:hover {
  color: #60a5fa !important;
}

.dark a[href="/login"] {
  background-color: transparent !important;
  color: #ffffff !important;
}
.dark a[href="/login"]:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.dark a[href="/register"] {
  background-color: transparent !important;
  color: #ffffff !important;
}
.dark a[href="/register"]:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.dark a[href="/profile"] {
  color: #ffffff !important;
}
.dark a[href="/profile"]:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}
.dark a[href="/profile"]:hover span {
  color: #000000 !important;
}

.dark button.text-red-600 {
  color: #ffffff !important;
}
.dark button.text-red-600:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.dark .bg-blue-600 {
  background-color: #3b82f6 !important;
  color: white !important;
  border: 2px solid #ffffff !important;
}
.dark .bg-blue-600:hover {
  background-color: #1e40af !important;
}

.dark .text-gray-900,
.dark .text-gray-800,
.dark .text-gray-700,
.dark .text-gray-600 {
  color: #ffffff !important;
}

.dark .text-gray-500,
.dark .text-gray-400 {
  color: #e5e5e5 !important;
}

.dark .bg-white {
  background-color: #000000 !important;
  border: 2px solid #ffffff !important;
}

.dark .aspect-square {
  background-color: #000000 !important;
  border: 2px solid #ffffff !important;
}

.dark input[type="date"] {
  background-color: #1f2937 !important;
  color: #f9fafb !important;
  border-color: #4b5563 !important;
}

.dark input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.dark,
.dark main,
.dark .bg-gray-50,
.dark .bg-gray-100,
.dark .bg-gray-200,
.dark .dark\:bg-slate-800,
.dark .bg-white.dark\:bg-slate-800 {
  background-color: #000000 !important;
}

.dark .text-gray-900,
.dark .text-gray-800,
.dark .text-gray-700,
.dark .text-gray-600,
.dark .text-gray-500,
.dark .text-gray-400,
.dark .dark\:text-white,
.dark .dark\:text-gray-300,
.dark .dark\:text-gray-400 {
  color: #ffffff !important;
}

/* ===== РЕЖИМ ДЛЯ СЛАБОВИДЯЩИХ ===== */
.vision-mode {
  font-size: 125% !important;
}

.vision-mode body {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.vision-mode,
.vision-mode main,
.vision-mode .bg-white,
.vision-mode .bg-gray-50,
.vision-mode .bg-gray-100,
.vision-mode .bg-gray-200,
.vision-mode .dark\:bg-slate-800,
.vision-mode .bg-white.dark\:bg-slate-800 {
  background-color: #000000 !important;
}

.vision-mode .border,
.vision-mode .border-2,
.vision-mode .border-gray-200,
.vision-mode .border-black,
.vision-mode .dark\:border-white,
.vision-mode .dark\:border-gray-600 {
  border-color: #ffff00 !important;
  border-width: 2px !important;
}

.vision-mode .text-gray-900,
.vision-mode .text-gray-800,
.vision-mode .text-gray-700,
.vision-mode .text-gray-600,
.vision-mode .text-gray-500,
.vision-mode .text-gray-400,
.vision-mode .dark\:text-white,
.vision-mode .dark\:text-gray-300,
.vision-mode .dark\:text-gray-400 {
  color: #ffffff !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-xs,
.vision-mode .bg-white .text-xs,
.vision-mode .dark\:bg-slate-800 .text-xs {
  font-size: 0.75rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-sm,
.vision-mode .bg-white .text-sm,
.vision-mode .dark\:bg-slate-800 .text-sm {
  font-size: 0.875rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-base,
.vision-mode .bg-white .text-base,
.vision-mode .dark\:bg-slate-800 .text-base {
  font-size: 1rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-lg,
.vision-mode .bg-white .text-lg,
.vision-mode .dark\:bg-slate-800 .text-lg {
  font-size: 1.125rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-xl,
.vision-mode .bg-white .text-xl,
.vision-mode .dark\:bg-slate-800 .text-xl {
  font-size: 1.25rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .text-2xl,
.vision-mode .bg-white .text-2xl,
.vision-mode .dark\:bg-slate-800 .text-2xl {
  font-size: 1.5rem !important;
  white-space: nowrap !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .p-6,
.vision-mode .bg-white .p-6,
.vision-mode .dark\:bg-slate-800 .p-6 {
  padding: 1.5rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .px-3,
.vision-mode .bg-white .px-3,
.vision-mode .dark\:bg-slate-800 .px-3 {
  padding-left: 0.75rem !important;
  padding-right: 0.75rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .py-2,
.vision-mode .bg-white .py-2,
.vision-mode .dark\:bg-slate-800 .py-2 {
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .px-4,
.vision-mode .bg-white .px-4,
.vision-mode .dark\:bg-slate-800 .px-4 {
  padding-left: 1rem !important;
  padding-right: 1rem !important;
}

.vision-mode .bg-white.dark\:bg-slate-800 .py-3,
.vision-mode .bg-white .py-3,
.vision-mode .dark\:bg-slate-800 .py-3 {
  padding-top: 0.75rem !important;
  padding-bottom: 0.75rem !important;
}

.vision-mode .text-xs { font-size: 0.9rem !important; }
.vision-mode .text-sm { font-size: 1.1rem !important; }
.vision-mode .text-base { font-size: 1.25rem !important; }
.vision-mode .text-lg { font-size: 1.4rem !important; }
.vision-mode .text-xl { font-size: 1.6rem !important; }
.vision-mode .text-2xl { font-size: 1.8rem !important; }
.vision-mode .text-3xl { font-size: 2.1rem !important; }
.vision-mode .text-4xl { font-size: 2.4rem !important; }

.vision-mode .p-1 { padding: 0.4rem !important; }
.vision-mode .p-2 { padding: 0.7rem !important; }
.vision-mode .p-3 { padding: 1rem !important; }
.vision-mode .p-4 { padding: 1.3rem !important; }
.vision-mode .p-6 { padding: 1.9rem !important; }
.vision-mode .p-8 { padding: 2.2rem !important; }

.vision-mode .px-2 { padding-left: 0.7rem !important; padding-right: 0.7rem !important; }
.vision-mode .px-4 { padding-left: 1.3rem !important; padding-right: 1.3rem !important; }
.vision-mode .px-6 { padding-left: 1.9rem !important; padding-right: 1.9rem !important; }

.vision-mode .py-1 { padding-top: 0.4rem !important; padding-bottom: 0.4rem !important; }
.vision-mode .py-2 { padding-top: 0.7rem !important; padding-bottom: 0.7rem !important; }
.vision-mode .py-3 { padding-top: 1rem !important; padding-bottom: 1rem !important; }
.vision-mode .py-4 { padding-top: 1.3rem !important; padding-bottom: 1.3rem !important; }

.vision-mode .gap-1 { gap: 0.4rem !important; }
.vision-mode .gap-2 { gap: 0.7rem !important; }
.vision-mode .gap-3 { gap: 1rem !important; }
.vision-mode .gap-4 { gap: 1.3rem !important; }
.vision-mode .gap-6 { gap: 1.9rem !important; }
.vision-mode .gap-8 { gap: 2.2rem !important; }

.vision-mode header {
  background-color: #000000 !important;
  border-bottom: 2px solid #ffff00 !important;
}

.vision-mode header span, 
.vision-mode header nav a, 
.vision-mode header button {
  color: #ffffff !important;
}

.vision-mode a[href="/"] span {
  color: #ffffff !important;
}
.vision-mode a[href="/"]:hover span {
  color: #ffff00 !important;
}

.vision-mode nav a {
  color: #ffffff !important;
}
.vision-mode nav a:hover {
  color: #ffff00 !important;
}

.vision-mode a[href="/login"],
.vision-mode a[href="/register"] {
  background-color: transparent !important;
  color: #ffffff !important;
  border: 2px solid #ffff00 !important;
}
.vision-mode a[href="/login"]:hover,
.vision-mode a[href="/register"]:hover {
  background-color: #ffff00 !important;
  color: #000000 !important;
}

.vision-mode a[href="/profile"] {
  color: #ffffff !important;
}
.vision-mode a[href="/profile"]:hover {
  background-color: #ffff00 !important;
  color: #000000 !important;
}
.vision-mode a[href="/profile"]:hover span {
  color: #000000 !important;
}

.vision-mode button.text-red-600 {
  color: #ffffff !important;
}
.vision-mode button.text-red-600:hover {
  background-color: #ffff00 !important;
  color: #000000 !important;
}

.vision-mode .bg-blue-600 {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
  border: 2px solid #ffff00 !important;
}
.vision-mode .bg-blue-600:hover {
  background-color: #1e40af !important;
}

.vision-mode .bg-green-600 {
  background-color: #22c55e !important;
  color: #ffffff !important;
  border: 2px solid #ffff00 !important;
}
.vision-mode .bg-green-600:hover {
  background-color: #16a34a !important;
}

.vision-mode .aspect-square {
  background-color: #000000 !important;
  border: 2px solid #ffff00 !important;
}

.vision-mode input,
.vision-mode select,
.vision-mode textarea {
  background-color: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffff00 !important;
}

.vision-mode .bg-yellow-200,
.vision-mode .dark\:bg-yellow-800 {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}

.vision-mode mark {
  background-color: #3b82f6 !important;
  color: #ffffff !important;
}

.vision-mode .absolute.right-2.top-2 {
  position: absolute !important;
  right: 0.5rem !important;
  top: 0.5rem !important;
  font-size: 1.5rem !important;
  background: transparent !important;
  border: none !important;
  cursor: pointer !important;
  padding: 0 !important;
  color: #ffff00 !important;
}

.vision-mode input[type="text"] {
  padding-right: 2.5rem !important;
}

.vision-mode button.absolute.right-2.top-2:hover {
  transform: scale(1.1) !important;
}

.vision-mode .w-8.h-8 {
  width: 3.5rem !important;
  height: 3.5rem !important;
}

.vision-mode .w-8.h-8 .text-lg {
  font-size: 2rem !important;
}

.vision-mode .w-24.h-24 {
  width: 8rem !important;
  height: 8rem !important;
}

.vision-mode .w-24.h-24 .text-4xl {
  font-size: 4rem !important;
}

.vision-mode .absolute.bottom-0.right-0 {
  width: 2.5rem !important;
  height: 2.5rem !important;
  font-size: 1.3rem !important;
  background-color: #ffff00 !important;
  color: #000000 !important;
  border-radius: 9999px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  border: 2px solid #000000 !important;
}

.vision-mode .absolute.bottom-0.right-0:hover {
  background-color: #ffffff !important;
  color: #000000 !important;
}

.vision-mode button[title="Режим для слабовидящих"] {
  background-color: #ffff00 !important;
  color: #000000 !important;
  border-color: #000000 !important;
}
</style>