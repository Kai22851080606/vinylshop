<!-- src/views/LoginView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-md mx-auto px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8">
        
        <h1 class="text-3xl font-bold dark:text-white text-center mb-8">
          Авторизация 🔐
        </h1>

        <!-- Форма входа -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          
          <!-- Сообщение об ошибке -->
          <div v-if="error" class="bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {{ error }}
          </div>

          <!-- Поле для ввода логина -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Логин <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="loginInput"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Введите ваш логин"
            >
          </div>

          <!-- Поле для ввода пароля -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Пароль <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            >
          </div>

          <!-- Кнопка входа -->
          <button 
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Вход...' : 'Войти' }}
          </button>

          <!-- Кнопка "Забыли пароль?" -->
          <div class="text-center">
            <button 
              type="button"
              @click="showForgotPassword = true"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Забыли пароль?
            </button>
          </div>
        </form>

        <!-- Ссылка на регистрацию -->
        <p class="mt-6 text-center text-gray-600 dark:text-gray-400">
          Нет аккаунта?
          <router-link to="/register" class="text-blue-600 dark:text-blue-400 hover:underline ml-1">
            Зарегистрироваться
          </router-link>
        </p>
      </div>
    </div>

    <!-- Модальное окно восстановления пароля -->
    <div v-if="showForgotPassword" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeForgotPassword">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-2xl font-bold dark:text-white mb-4">Восстановление пароля</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          Введите ваш логин и почту (Яндекс Почта). Мы отправим инструкцию для восстановления пароля.
        </p>
        
        <!-- Поле логина -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Логин <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="resetLogin"
            type="text"
            placeholder="Введите ваш логин"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
          <p v-if="resetLoginError" class="text-xs text-red-500 mt-1">{{ resetLoginError }}</p>
        </div>

        <!-- Поле Яндекс-почты -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email для отправки на него инструкции по смене пароля <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="resetEmail"
            type="email"
            placeholder="ivan@yandex.ru"
            class="w-full px-4 py-3 rounded-lg border"
            :class="resetEmailError ? 'border-red-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white'"
            @input="validateResetEmail"
          >
          <p v-if="resetEmailError" class="text-xs text-red-500 mt-1">{{ resetEmailError }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Только Яндекс Почта (@yandex.ru, @ya.ru и др.)</p>
        </div>
        
        <div class="flex gap-3">
          <button 
            @click="closeForgotPassword"
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            Отмена
          </button>
          <button 
            @click="sendResetLink"
            :disabled="resetLoading || !!resetEmailError || !resetEmail || !resetLogin"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ resetLoading ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
        
        <p v-if="resetMessage" class="mt-3 text-sm text-center" :class="resetSuccess ? 'text-green-600' : 'text-red-600'">
          {{ resetMessage }}
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { updateAuth } = inject('auth')
const loginInput = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

// Для восстановления пароля
const showForgotPassword = ref(false)
const resetLogin = ref('')
const resetLoginError = ref('')
const resetEmail = ref('')
const resetEmailError = ref('')
const resetLoading = ref(false)
const resetMessage = ref('')
const resetSuccess = ref(false)

// Закрытие модального окна со сбросом всех полей
const closeForgotPassword = () => {
  showForgotPassword.value = false
  resetLogin.value = ''
  resetLoginError.value = ''
  resetEmail.value = ''
  resetEmailError.value = ''
  resetMessage.value = ''
}

// Валидация Яндекс-почты
const validateResetEmail = () => {
  const email = resetEmail.value.toLowerCase()
  const validDomains = ['@yandex.ru', '@ya.ru', '@yandex.ua', '@yandex.by', '@yandex.kz', '@yandex.com']
  const hasValidDomain = validDomains.some(domain => email.endsWith(domain))
  
  if (!email) {
    resetEmailError.value = ''
  } else if (!hasValidDomain) {
    resetEmailError.value = 'Только Яндекс Почта'
  } else {
    resetEmailError.value = ''
  }
}

// Аутентификация по логину
const handleLogin = async () => {
  error.value = ''
  loading.value = true
  
  try {
    const response = await fetch('api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: loginInput.value,
        password: password.value
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.token) {
        localStorage.setItem('token', result.token)
      }
      updateAuth()
      router.push('/profile')
    } else {
      error.value = result.message || 'Неверный логин или пароль'
    }
  } catch (err) {
    error.value = 'Ошибка соединения с сервером'
  } finally {
    loading.value = false
  }
}

// Восстановление пароля — поиск пользователя по ЛОГИНУ
const sendResetLink = async () => {
  resetLoginError.value = ''
  
  // Проверка логина
  if (!resetLogin.value) {
    resetLoginError.value = 'Введите логин'
    return
  }
  
  // Проверка почты
  if (!resetEmail.value) {
    resetEmailError.value = 'Введите email'
    return
  }
  
  const email = resetEmail.value.toLowerCase()
  const validDomains = ['@yandex.ru', '@ya.ru', '@yandex.ua', '@yandex.by', '@yandex.kz', '@yandex.com']
  const hasValidDomain = validDomains.some(domain => email.endsWith(domain))
  
  if (!hasValidDomain) {
    resetEmailError.value = 'Только Яндекс Почта'
    return
  }
  
  resetLoading.value = true
  resetMessage.value = ''
  
  try {
    // Ищем пользователя по ЛОГИНУ, а не по email
    const response = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        login: resetLogin.value,
        email: resetEmail.value 
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      resetMessage.value = 'Инструкция отправлена на email'
      resetSuccess.value = true
      setTimeout(() => {
        closeForgotPassword()
      }, 3000)
    } else {
      resetMessage.value = result.message || 'Пользователь с таким логином не найден'
      resetSuccess.value = false
    }
  } catch (err) {
    resetMessage.value = 'Ошибка соединения'
    resetSuccess.value = false
  } finally {
    resetLoading.value = false
  }
}
</script>