<!-- src/views/MyOrdersView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Заголовок и кнопка назад -->
      <div class="flex items-center justify-between mb-8">
        <router-link 
          to="/profile" 
          class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>←</span> Назад в профиль
        </router-link>
        <h1 class="text-4xl font-bold dark:text-white text-center">
          Мои заказы 📦
        </h1>
        <div class="w-24"></div>
      </div>
      
      <div v-if="user" class="space-y-6">
        <!-- СТАТИСТИКА: общее количество заказов пользователя -->
        <div v-if="orders.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <span class="text-2xl">📦</span>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Всего моих заказов</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalOrders }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <span class="text-2xl">💿</span>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Пластинки</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ vinylOrdersCount }}</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-4">
            <div class="flex items-center gap-3">
              <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <span class="text-2xl">🎤</span>
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Услуги</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ serviceOrdersCount }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>

        <!-- Нет заказов -->
        <div v-else-if="orders.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
          <p class="text-6xl mb-4">📭</p>
          <h2 class="text-2xl font-bold dark:text-white mb-2">У вас пока нет заказов</h2>
          <p class="text-gray-500 dark:text-gray-400 mb-6">
            Выберите пластинки в каталоге или закажите артиста на мероприятие
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <router-link 
              to="/" 
              class="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              <span>💿</span>
              Перейти в каталог
            </router-link>
            <router-link 
              to="/services" 
              class="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
            >
              <span>🎤</span>
              Заказать услугу
            </router-link>
          </div>
        </div>

        <!-- Список заказов -->
        <div v-else class="space-y-4">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-2xl font-bold dark:text-white">История заказов</h2>
              <div class="text-right">
                <span class="text-sm text-gray-500 dark:text-gray-400 block">
                  Всего копий: {{ totalItemsQuantity }}
                </span>
              </div>
            </div>
            
            <div class="space-y-4">
              <OrderCard 
                v-for="order in orders" 
                :key="order.id" 
                :order="order"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Если не авторизован -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
        <p class="text-6xl mb-4">🔒</p>
        <h2 class="text-2xl font-bold dark:text-white mb-2">Требуется авторизация</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Войдите в аккаунт, чтобы просмотреть свои заказы
        </p>
        <router-link 
          to="/login" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Войти
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, inject, watch, computed } from 'vue'
import { ordersApi } from '../api/orders'
import OrderCard from '../components/OrderCard.vue'

const { user } = inject('auth')
const orders = ref([])
const loading = ref(false)
const lastError = ref('')

// НОВЫЕ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ДЛЯ СТАТИСТИКИ
const totalOrders = computed(() => orders.value.length)
const vinylOrdersCount = computed(() => orders.value.filter(o => o.order_type === 'vinyl').length)
const serviceOrdersCount = computed(() => orders.value.filter(o => o.order_type === 'service').length)

// Общее количество копий товаров во всех заказах
const totalItemsQuantity = computed(() => {
  let total = 0
  orders.value.forEach(order => {
    try {
      const items = JSON.parse(order.items_json || '[]')
      items.forEach(item => {
        total += item.quantity || 1
      })
    } catch (e) {
      console.error('Ошибка парсинга items_json:', e)
    }
  })
  return total
})

// Загрузка заказов пользователя
const loadUserOrders = async () => {
  if (!user.value?.email) {
    console.log('❌ Нет email пользователя')
    lastError.value = 'Нет email пользователя'
    return
  }
  
  console.log('👤 Текущий пользователь:', user.value)
  console.log('📧 Email пользователя:', user.value.email)
  
  loading.value = true
  lastError.value = ''
  
  try {
    console.log('📦 Загружаем заказы для email:', user.value.email)
    const data = await ordersApi.getUserOrders(user.value.email)
    console.log('✅ Получены заказы (сырые данные):', data)
    
    if (Array.isArray(data)) {
      orders.value = data
      console.log('📊 Количество заказов:', data.length)
      if (data.length === 0) {
        console.log('ℹ️ Нет заказов для этого пользователя')
      }
    } else {
      console.log('❌ data не является массивом:', data)
      orders.value = []
      lastError.value = 'Неверный формат данных'
    }
    
  } catch (error) {
    console.error('❌ Ошибка загрузки заказов:', error)
    orders.value = []
    lastError.value = error.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserOrders()
})

// Следим за изменениями user
watch(() => user.value, (newUser) => {
  if (newUser?.email) {
    console.log('👤 Пользователь изменился, перезагружаем заказы')
    loadUserOrders()
  }
}, { immediate: true, deep: true })
</script>