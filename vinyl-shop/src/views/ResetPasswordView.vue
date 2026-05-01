<!-- src/views/ResetPasswordView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8">
        
        <h1 class="text-3xl font-bold dark:text-white text-center mb-8">
          Восстановление пароля 🔐
        </h1>

        <!-- Загрузка -->
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Проверка токена...</p>
        </div>

        <!-- Токен недействителен -->
        <div v-else-if="tokenError" class="text-center">
          <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span class="text-5xl">❌</span>
          </div>
          <h2 class="text-xl font-bold dark:text-white mb-4">Ссылка недействительна</h2>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ tokenError }}</p>
          <router-link to="/login" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
            Вернуться на страницу входа
          </router-link>
        </div>

        <!-- Форма смены пароля -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          
          <!-- Сообщение об ошибке -->
          <div v-if="error" class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Сообщение об успехе -->
          <div v-if="successMessage" class="bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-center">
            {{ successMessage }}
          </div>

          <template v-if="!successMessage">
            <!-- Новый пароль -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Новый пароль <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="newPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': passwordError }"
                placeholder="Минимум 6 символов"
                @input="validatePassword"
              >
              <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
            </div>

            <!-- Повторите пароль -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Повторите пароль <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="confirmPassword"
                type="password"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': confirmError }"
                placeholder="Повторите новый пароль"
                @input="validateConfirmPassword"
              >
              <p v-if="confirmError" class="text-xs text-red-500 mt-1">{{ confirmError }}</p>
            </div>

            <!-- Кнопка смены пароля -->
            <button 
              type="submit"
              :disabled="submitting || !!passwordError || !!confirmError || !newPassword || !confirmPassword"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Сохранение...' : 'Сменить пароль' }}
            </button>
          </template>

          <!-- Кнопка после успешной смены -->
          <div v-else class="text-center">
            <router-link to="/login" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              Войти с новым паролем
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const token = ref('')
const loading = ref(true)
const tokenError = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordError = ref('')
const confirmError = ref('')
const error = ref('')
const successMessage = ref('')
const submitting = ref(false)

// Валидация пароля
const validatePassword = () => {
  const value = newPassword.value
  const regex = /^[a-zA-Z0-9!@#$%^&*]{6,}$/
  
  if (!value) {
    passwordError.value = ''
  } else if (value.length < 6) {
    passwordError.value = 'Минимум 6 символов'
  } else {
    passwordError.value = ''
    // Проверяем подтверждение заново
    if (confirmPassword.value) {
      validateConfirmPassword()
    }
  }
}

// Валидация подтверждения пароля
const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmError.value = ''
  } else if (newPassword.value !== confirmPassword.value) {
    confirmError.value = 'Пароли не совпадают'
  } else {
    confirmError.value = ''
  }
}

// Проверка токена при загрузке
const checkToken = async () => {
  token.value = route.query.token || ''
  
  if (!token.value) {
    tokenError.value = 'Токен не указан. Проверьте ссылку из письма.'
    loading.value = false
    return
  }
  
  loading.value = false
}

// Смена пароля
const handleResetPassword = async () => {
  // Финальная валидация
  validatePassword()
  validateConfirmPassword()
  
  if (passwordError.value || confirmError.value) {
    return
  }
  
  if (!newPassword.value || !confirmPassword.value) {
    error.value = 'Заполните все поля'
    return
  }
  
  submitting.value = true
  error.value = ''
  
  try {
    const response = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token.value,
        newPassword: newPassword.value
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      successMessage.value = 'Пароль успешно изменён! Теперь вы можете войти с новым паролем.'
      newPassword.value = ''
      confirmPassword.value = ''
    } else {
      error.value = result.message || 'Ошибка при смене пароля'
    }
  } catch (err) {
    error.value = 'Ошибка соединения с сервером'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  checkToken()
})
</script>