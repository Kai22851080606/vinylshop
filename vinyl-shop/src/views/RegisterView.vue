<template>
  <main class="py-8">
    <div class="max-w-md mx-auto px-4">
      <h1 class="text-4xl font-bold dark:text-white text-center mb-8">
        Регистрация 📝
      </h1>

      <form @submit.prevent="handleRegister" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 space-y-6">
        
        <!-- ФИО -->
        <div class="space-y-3">
          <h3 class="text-md font-semibold text-gray-900 dark:text-white">ФИО <span class="text-red-500">*</span></h3>
          
          <!-- Фамилия -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Фамилия <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.lastName"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.lastName }"
              @input="validateLastName"
            >
            <p v-if="errors.lastName" class="text-xs text-red-500 mt-1">{{ errors.lastName }}</p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Только буквы, первая заглавная</p>
          </div>

          <!-- Имя -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Имя <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.firstName"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.firstName }"
              @input="validateFirstName"
            >
            <p v-if="errors.firstName" class="text-xs text-red-500 mt-1">{{ errors.firstName }}</p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Только буквы, первая заглавная</p>
          </div>

          <!-- Отчество -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Отчество <span class="text-red-500">*</span>
            </label>
            <input 
              v-model="form.middleName"
              type="text"
              required
              class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              :class="{ 'border-red-500': errors.middleName }"
              @input="validateMiddleName"
            >
            <p v-if="errors.middleName" class="text-xs text-red-500 mt-1">{{ errors.middleName }}</p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Только буквы, первая заглавная</p>
          </div>
        </div>

        <!-- Логин -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Логин <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.username"
            type="text"
            required
            minlength="3"
            maxlength="20"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.username }"
            @input="validateUsername"
          >
          <p v-if="errors.username" class="text-xs text-red-500 mt-1">{{ errors.username }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Латинские буквы, цифры, _ . - (3-20 символов)</p>
        </div>

        <!-- Никнейм -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Никнейм <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.nickname"
            type="text"
            required
            minlength="2"
            maxlength="30"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.nickname }"
            @input="validateNickname"
          >
          <p v-if="errors.nickname" class="text-xs text-red-500 mt-1">{{ errors.nickname }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Любые символы (2-30 символов)</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.email"
            type="email"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.email }"
            @input="validateEmail"
          >
          <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">На этот email будет приходить подтверждение заказов</p>
        </div>

        <!-- Дата рождения (от 1940 до сегодня) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Дата рождения <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.birthDate"
            type="date"
            required
            :min="minDate"
            :max="maxDate"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.birthDate }"
            @change="validateBirthDate"
          >
          <p v-if="errors.birthDate" class="text-xs text-red-500 mt-1">{{ errors.birthDate }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">От 1940 года до сегодняшнего дня</p>
        </div>

        <!-- Пол -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Пол <span class="text-red-500">*</span>
          </label>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.gender" value="male" class="w-4 h-4" @change="validateGender">
              <span class="text-gray-700 dark:text-gray-300">Мужской</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.gender" value="female" class="w-4 h-4" @change="validateGender">
              <span class="text-gray-700 dark:text-gray-300">Женский</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="form.gender" value="other" class="w-4 h-4" @change="validateGender">
              <span class="text-gray-700 dark:text-gray-300">Другой</span>
            </label>
          </div>
          <p v-if="errors.gender" class="text-xs text-red-500 mt-1">{{ errors.gender }}</p>
        </div>

        <!-- Аватар -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Аватар
          </label>
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
              <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover">
              <span v-else class="text-2xl">👤</span>
            </div>
            <label class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Выбрать файл
              <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange">
            </label>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">JPG, PNG до 2MB (необязательно)</p>
        </div>

        <!-- Пароль -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Пароль <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.password }"
            @input="validatePassword"
          >
          <p v-if="errors.password" class="text-xs text-red-500 mt-1">{{ errors.password }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">Минимум 6 символов (буквы, цифры, спецсимволы)</p>
        </div>

        <!-- Повтор пароля -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Повторите пароль <span class="text-red-500">*</span>
          </label>
          <input 
            v-model="form.confirmPassword"
            type="password"
            required
            class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            :class="{ 'border-red-500': errors.confirmPassword }"
            @input="validateConfirmPassword"
          >
          <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
        </div>

        <!-- Ошибка регистрации -->
        <div v-if="registerError" class="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
          {{ registerError }}
        </div>

        <!-- Кнопка регистрации -->
        <button 
          type="submit"
          :disabled="loading || !isFormValid"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>

        <!-- Ссылка на вход -->
        <p class="text-center text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт? 
          <router-link to="/login" class="text-blue-600 dark:text-blue-400 hover:underline">
            Войти
          </router-link>
        </p>
      </form>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'

const router = useRouter()
const loading = ref(false)
const registerError = ref('')
const avatarPreview = ref(null)
const avatarFile = ref(null)

const form = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  username: '',
  nickname: '',
  email: '',
  birthDate: '',
  gender: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  firstName: '',
  lastName: '',
  middleName: '',
  username: '',
  nickname: '',
  email: '',
  birthDate: '',
  gender: '',
  password: '',
  confirmPassword: ''
})

// Минимальная дата: 1 января 1940
const minDate = computed(() => '1940-01-01')

// Максимальная дата: сегодняшний день
const maxDate = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

// ===== ВАЛИДАЦИЯ ОТДЕЛЬНЫХ ПОЛЕЙ =====

const validateLastName = () => {
  const value = form.value.lastName
  const regex = /^[А-ЯA-Z][а-яa-z]*$/
  if (!value) {
    errors.value.lastName = 'Фамилия обязательна'
  } else if (!regex.test(value)) {
    errors.value.lastName = 'Только буквы, первая заглавная'
  } else {
    errors.value.lastName = ''
  }
}

const validateFirstName = () => {
  const value = form.value.firstName
  const regex = /^[А-ЯA-Z][а-яa-z]*$/
  if (!value) {
    errors.value.firstName = 'Имя обязательно'
  } else if (!regex.test(value)) {
    errors.value.firstName = 'Только буквы, первая заглавная'
  } else {
    errors.value.firstName = ''
  }
}

const validateMiddleName = () => {
  const value = form.value.middleName
  const regex = /^[А-ЯA-Z][а-яa-z]*$/
  if (!value) {
    errors.value.middleName = 'Отчество обязательно'
  } else if (!regex.test(value)) {
    errors.value.middleName = 'Только буквы, первая заглавная'
  } else {
    errors.value.middleName = ''
  }
}

const validateUsername = () => {
  const value = form.value.username
  const regex = /^[a-zA-Z0-9_.-]{3,20}$/
  if (!value) {
    errors.value.username = 'Логин обязателен'
  } else if (!regex.test(value)) {
    errors.value.username = 'Латинские буквы, цифры, _ . - (3-20 символов)'
  } else {
    errors.value.username = ''
  }
}

const validateNickname = () => {
  const value = form.value.nickname
  if (!value) {
    errors.value.nickname = 'Никнейм обязателен'
  } else if (value.length < 2) {
    errors.value.nickname = 'Минимум 2 символа'
  } else if (value.length > 30) {
    errors.value.nickname = 'Максимум 30 символов'
  } else {
    errors.value.nickname = ''
  }
}

const validateEmail = () => {
  const value = form.value.email
  const regex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
  if (!value) {
    errors.value.email = 'Email обязателен'
  } else if (!regex.test(value)) {
    errors.value.email = 'Введите корректный email'
  } else {
    errors.value.email = ''
  }
}

// Дата рождения (от 1940 до сегодня)
const validateBirthDate = () => {
  const value = form.value.birthDate
  if (!value) {
    errors.value.birthDate = 'Дата рождения обязательна'
    return
  }
  
  const birthYear = new Date(value).getFullYear()
  const today = new Date()
  const currentYear = today.getFullYear()
  
  if (birthYear < 1940) {
    errors.value.birthDate = 'Год рождения не может быть раньше 1940'
  } else if (birthYear > currentYear) {
    errors.value.birthDate = 'Год рождения не может быть в будущем'
  } else {
    errors.value.birthDate = ''
  }
}

const validateGender = () => {
  if (!form.value.gender) {
    errors.value.gender = 'Выберите пол'
  } else {
    errors.value.gender = ''
  }
}

const validatePassword = () => {
  const value = form.value.password
  const regex = /^[a-zA-Z0-9!@#$%^&*]{6,}$/
  if (!value) {
    errors.value.password = 'Пароль обязателен'
  } else if (value.length < 6) {
    errors.value.password = 'Минимум 6 символов'
  } else if (!regex.test(value)) {
    errors.value.password = 'Латинские буквы, цифры, спецсимволы'
  } else {
    errors.value.password = ''
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Пароли не совпадают'
  } else if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Подтвердите пароль'
  } else {
    errors.value.confirmPassword = ''
  }
}

// Проверка валидности всей формы
const isFormValid = computed(() => {
  return (
    !errors.value.lastName &&
    !errors.value.firstName &&
    !errors.value.middleName &&
    !errors.value.username &&
    !errors.value.nickname &&
    !errors.value.email &&
    !errors.value.birthDate &&
    !errors.value.gender &&
    !errors.value.password &&
    !errors.value.confirmPassword &&
    form.value.lastName &&
    form.value.firstName &&
    form.value.middleName &&
    form.value.username &&
    form.value.nickname &&
    form.value.email &&
    form.value.birthDate &&
    form.value.gender &&
    form.value.password &&
    form.value.confirmPassword
  )
})

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      alert('Файл не должен превышать 2MB')
      return
    }
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleRegister = async () => {
  validateLastName()
  validateFirstName()
  validateMiddleName()
  validateUsername()
  validateNickname()
  validateEmail()
  validateBirthDate()
  validateGender()
  validatePassword()
  validateConfirmPassword()
  
  if (!isFormValid.value) return

  loading.value = true
  registerError.value = ''

  try {
    let avatarBase64 = null
    if (avatarFile.value) {
      avatarBase64 = avatarPreview.value
    }

    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: form.value.firstName,
        last_name: form.value.lastName,
        middle_name: form.value.middleName,
        username: form.value.username,
        nickname: form.value.nickname,
        email: form.value.email,
        password: form.value.password,
        birth_date: form.value.birthDate,
        gender: form.value.gender,
        avatar: avatarBase64
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      const loginResponse = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: form.value.email,
          password: form.value.password
        })
      })

      const loginData = await loginResponse.json()

      if (loginResponse.ok && loginData.success) {
        localStorage.setItem('user', JSON.stringify(loginData.user))
        router.push('/profile')
      } else {
        router.push('/login')
      }
    } else {
      registerError.value = data.message || 'Ошибка при регистрации'
    }
  } catch (error) {
    console.error('Ошибка регистрации:', error)
    registerError.value = 'Ошибка сервера. Попробуйте позже.'
  } finally {
    loading.value = false
  }
}
</script>