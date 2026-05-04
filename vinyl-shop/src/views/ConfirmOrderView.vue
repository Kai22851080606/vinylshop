<!-- src/views/ConfirmOrderView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-2xl mx-auto px-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 text-center">
        
        <!-- Загрузка -->
        <div v-if="loading" class="py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Подтверждение заказа...</p>
        </div>

        <!-- Успешно -->
        <div v-else-if="confirmed">
          <div class="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <span class="text-5xl">✅</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Заказ подтверждён!
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Ваш заказ #{{ orderNumber }} успешно подтверждён и передан в обработку.
          </p>
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-8">
            Мы свяжемся с вами в ближайшее время для уточнения деталей.
          </p>
          <div class="flex gap-4 justify-center">
            <router-link to="/" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
              На главную
            </router-link>
            <router-link to="/my-orders" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Мои заказы
            </router-link>
          </div>
        </div>

        <!-- Уже подтверждён -->
        <div v-else-if="alreadyConfirmed">
          <div class="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
            <span class="text-5xl">ℹ️</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Заказ уже подтверждён
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            Заказ #{{ orderNumber }} был подтверждён ранее.
          </p>
          <div class="flex gap-4 justify-center">
            <router-link to="/" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
              На главную
            </router-link>
            <router-link to="/my-orders" class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors">
              Мои заказы
            </router-link>
          </div>
        </div>

        <!-- Ошибка -->
        <div v-else>
          <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span class="text-5xl">❌</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Заказ не найден
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ errorMessage || 'Не удалось найти заказ для подтверждения.' }}
          </p>
          <router-link to="/" class="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
            На главную
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderNumber = ref('')
const loading = ref(true)
const confirmed = ref(false)
const alreadyConfirmed = ref(false)
const errorMessage = ref('')

const confirmOrder = async () => {
  orderNumber.value = route.params.id
  
  try {
    const response = await fetch(`http://localhost:3001/api/orders/confirm/${orderNumber.value}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    
    const result = await response.json()
    
    if (response.ok) {
      if (result.alreadyConfirmed) {
        alreadyConfirmed.value = true
      } else {
        confirmed.value = true
      }
    } else {
      errorMessage.value = result.message || 'Не удалось подтвердить заказ'
    }
  } catch (error) {
    console.error('Ошибка:', error)
    errorMessage.value = 'Ошибка соединения с сервером'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  confirmOrder()
})
</script>