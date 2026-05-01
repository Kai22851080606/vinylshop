<!-- src/views/AdminOrdersView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Управление заказами 📦
        </h1>
        <router-link 
          to="/admin" 
          class="px-4 py-2 text-gray dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          ← Назад в админ-панель
        </router-link>
      </div>

      <!-- СТАТИСТИКА: общее количество заказов -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <span class="text-2xl">📦</span>
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">Всего заказов</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalOrders }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
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
        
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
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

      <!-- Фильтры -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div class="flex gap-4">
          <select 
            v-model="filterType"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">Все заказы</option>
            <option value="vinyl">Пластинки</option>
            <option value="service">Услуги</option>
          </select>
          
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Поиск по email или имени..."
            class="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
        </div>
      </div>

      <!-- Список заказов -->
      <div class="bg-white dark:bg-gray rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        </div>

        <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="text-4xl mb-2">📭</p>
          <p>Заказов пока нет</p>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div 
            v-for="order in filteredOrders" 
            :key="order.id"
            class="p-6 hover:bg-gray dark:hover:bg-gray/50 transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-2xl">{{ order.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
                  <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                    {{ getOrderTitle(order) }}
                  </h3>
                  <span class="px-2 py-1 text-xs rounded-full" 
                    :class="order.order_type === 'vinyl' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'"
                  >
                    {{ order.order_type === 'vinyl' ? 'Пластинка' : 'Услуга' }}
                  </span>
                </div>
                
                <div class="grid md:grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Клиент:</p>
                    <p class="text-gray-900 dark:text-white font-medium">
                      {{ order.customer_lastname }} {{ order.customer_name }} {{ order.customer_middlename || '' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Email:</p>
                    <p class="text-gray-900 dark:text-white">{{ order.customer_email }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400">Сумма:</p>
                    <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ order.total_price }} ₽</p>
                  </div>
                </div>

                <!-- Список товаров в заказе (кратко) с количеством -->
                <div class="mt-2 text-sm">
                  <p class="text-gray-500 dark:text-gray-400 mb-1">Товары в заказе:</p>
                  <div class="flex flex-wrap gap-2">
                    <span 
                      v-for="(item, idx) in getOrderItems(order).slice(0, 3)" 
                      :key="idx"
                      class="inline-flex items-center gap-1 px-2 py-1 bg-gray dark:bg-gray-700 rounded-md text-xs"
                    >
                      <span>{{ order.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
                      <span class="text-gray-700 dark:text-gray">{{ item.title || item.name }}</span>
                      <!-- Количество для каждого товара -->
                      <span v-if="item.quantity && item.quantity > 1" class="px-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
                        x{{ item.quantity }}
                      </span>
                      <span class="font-medium text-blue-600 dark:text-blue-400">{{ item.price }} ₽</span>
                    </span>
                    <span v-if="getOrderItems(order).length > 3" class="text-xs text-gray-500 dark:text-gray-400">
                      и ещё {{ getOrderItems(order).length - 3 }}
                    </span>
                  </div>
                </div>
                
                <!-- Дата заказа -->
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">
                  Заказ от {{ formatDate(order.created_at) }}
                </p>
              </div>
              
              <!-- ИСПРАВЛЕНО: теперь кнопка вызывает модальное окно -->
              <button 
                @click.stop="selectOrder(order)"
                class="ml-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Просмотр →
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Модальное окно с деталями заказа (ПОЛНОСТЬЮ ВОССТАНОВЛЕНО) -->
      <div v-if="selectedOrder" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="selectedOrder = null">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          
          <!-- Заголовок -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Детали заказа #{{ selectedOrder.id }}
              </h2>
              <button @click="selectedOrder = null" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <span class="text-2xl">✕</span>
              </button>
            </div>
          </div>

          <!-- Контент -->
          <div class="p-6 space-y-6">
            <!-- Тип заказа -->
            <div class="flex items-center gap-3 p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
              <span class="text-3xl">{{ selectedOrder.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">Тип заказа</p>
                <p class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ selectedOrder.order_type === 'vinyl' ? 'Пластинки' : 'Услуги' }}
                </p>
              </div>
            </div>

            <!-- Полный список товаров с количеством под каждым товаром -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Состав заказа</h3>
              <div class="space-y-4">
                <div 
                  v-for="(item, index) in orderItems" 
                  :key="index"
                  class="p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-start gap-3">
                      <span class="text-2xl">{{ selectedOrder.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
                      <div>
                        <p class="font-medium text-gray-900 dark:text-white">
                          {{ item.title || item.name }}
                        </p>
                        <p v-if="item.artist" class="text-sm text-gray-500 dark:text-gray-400">
                          {{ item.artist }}
                        </p>
                        <p v-if="item.description" class="text-sm text-gray-500 dark:text-gray-400">
                          {{ item.description.substring(0, 100) }}...
                        </p>
                      </div>
                    </div>
                    <span class="text-lg font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap ml-4">
                      {{ item.totalPrice || item.price }} ₽
                    </span>
                  </div>
                  
                  <!-- Блок с количеством под каждым товаром (ТОЛЬКО ДЛЯ ПЛАСТИНОК) -->
                  <div v-if="selectedOrder.order_type === 'vinyl'" class="mt-3 pl-11 flex items-center gap-2 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Количество:</span>
                    <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-full">
                      {{ item.quantity || 1 }} шт.
                    </span>
                    <span v-if="item.quantity && item.quantity > 1" class="text-gray-500 dark:text-gray-400 text-xs">
                      ({{ item.price }} ₽ × {{ item.quantity }} = {{ item.price * item.quantity }} ₽)
                    </span>
                  </div>
                  
                  <!-- Для услуг просто показываем количество 1 -->
                  <div v-else class="mt-3 pl-11 flex items-center gap-2 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">Количество:</span>
                    <span class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium rounded-full">
                      1 услуга
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Данные клиента -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Данные клиента</h3>
              <div class="grid md:grid-cols-2 gap-4 p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">ФИО</p>
                  <p class="text-gray-900 dark:text-white">
                    {{ selectedOrder.customer_lastname }} {{ selectedOrder.customer_name }} {{ selectedOrder.customer_middlename || '' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.customer_email }}</p>
                </div>
              </div>
            </div>

            <!-- Адрес доставки (для пластинок) -->
            <div v-if="selectedOrder.order_type === 'vinyl' && selectedOrder.delivery_json" class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Адрес доставки</h3>
              <div class="p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
                <p class="text-gray-900 dark:text-white">{{ parsedDelivery.address }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {{ parsedDelivery.city }}, {{ parsedDelivery.country }}, {{ parsedDelivery.zipCode }}
                </p>
              </div>
            </div>

            <!-- Адрес доставки (для старых заказов) -->
            <div v-else-if="selectedOrder.order_type === 'vinyl' && selectedOrder.delivery_address" class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Адрес доставки</h3>
              <div class="p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
                <p class="text-gray-900 dark:text-white">{{ JSON.parse(selectedOrder.delivery_address).address }}</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {{ JSON.parse(selectedOrder.delivery_address).city }}, {{ JSON.parse(selectedOrder.delivery_address).country }}, {{ JSON.parse(selectedOrder.delivery_address).zipCode }}
                </p>
              </div>
            </div>

            <!-- Детали мероприятия (для услуг) -->
            <div v-if="selectedOrder.order_type === 'service'" class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Детали мероприятия</h3>
              <div class="grid md:grid-cols-2 gap-4 p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Адрес</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.event_address }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Дата и время</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.event_date }} в {{ selectedOrder.event_time }}</p>
                </div>
                <div v-if="selectedOrder.event_duration">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Длительность</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.event_duration }} ч.</p>
                </div>
                <div v-if="selectedOrder.event_requirements" class="md:col-span-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Требования</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.event_requirements }}</p>
                </div>
              </div>
            </div>

            <!-- Платёжные данные -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Платёжные данные</h3>
              <div class="grid md:grid-cols-2 gap-4 p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Карта</p>
                  <p class="text-gray-900 dark:text-white">**** **** **** {{ selectedOrder.card_last4 }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Владелец</p>
                  <p class="text-gray-900 dark:text-white">{{ selectedOrder.card_holder }}</p>
                </div>
              </div>
            </div>

            <!-- Итого -->
            <div class="flex justify-between items-center p-4 bg-gray dark:bg-gray-700/50 rounded-lg border border-gray dark:border-gray-600">
              <span class="text-lg font-medium text-gray-700 dark:text-gray-300">Итого к оплате:</span>
              <span class="text-3xl font-black text-blue-600 dark:text-blue-400">{{ selectedOrder.total_price }} ₽</span>
            </div>

            <!-- Дата заказа -->
            <p class="text-xs text-gray-400 dark:text-gray-500 text-right">
              Заказ оформлен: {{ formatDate(selectedOrder.created_at, true) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const orders = ref([])
const loading = ref(true)
const filterType = ref('all')
const searchQuery = ref('')
const selectedOrder = ref(null)

// НОВЫЕ ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ДЛЯ СТАТИСТИКИ
const totalOrders = computed(() => orders.value.length)
const vinylOrdersCount = computed(() => orders.value.filter(o => o.order_type === 'vinyl').length)
const serviceOrdersCount = computed(() => orders.value.filter(o => o.order_type === 'service').length)

// Функция для получения списка товаров из заказа
const getOrderItems = (order) => {
  if (!order) return []
  
  // Сначала пробуем получить из items_json
  if (order.items_json) {
    try {
      const items = JSON.parse(order.items_json)
      return Array.isArray(items) ? items : []
    } catch {
      // Если не удалось распарсить, игнорируем
    }
  }
  
  // Если нет items_json, пробуем получить из order_data
  if (order.order_data) {
    try {
      const data = JSON.parse(order.order_data)
      return data.items || []
    } catch {
      // Если не удалось распарсить, игнорируем
    }
  }
  
  // Если ничего не нашли, возвращаем пустой массив
  return []
}

// Функция для получения заголовка заказа
const getOrderTitle = (order) => {
  const items = getOrderItems(order)
  if (items.length === 0) return order.item_title || 'Заказ'
  if (items.length === 1) {
    const item = items[0]
    const baseTitle = item.title || item.name || order.item_title
    if (order.order_type === 'vinyl' && item.quantity && item.quantity > 1) {
      return `${baseTitle} (${item.quantity} шт.)`
    }
    return baseTitle
  }
  const totalQty = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  return `Заказ (${items.length} ${order.order_type === 'vinyl' ? 'пластинок' : 'услуг'}, всего ${totalQty} шт.)`
}

// Товары для выбранного заказа
const orderItems = computed(() => {
  return getOrderItems(selectedOrder.value)
})

// Функция для форматирования даты
const formatDate = (dateString, withTime = true) => {
  if (!dateString) return 'Дата неизвестна'
  
  try {
    const date = new Date(dateString)
    
    // Проверяем, валидная ли дата
    if (isNaN(date.getTime())) {
      return dateString // Возвращаем как есть, если не удалось распарсить
    }
    
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...(withTime && { hour: '2-digit', minute: '2-digit' })
    }
    
    return date.toLocaleString('ru-RU', options)
  } catch (e) {
    console.error('Ошибка форматирования даты:', e)
    return dateString
  }
}

// Парсинг delivery_json
const parsedDelivery = computed(() => {
  if (!selectedOrder.value?.delivery_json) return {}
  try {
    return JSON.parse(selectedOrder.value.delivery_json)
  } catch {
    return {}
  }
})

// Загрузка заказов
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/orders')
    if (response.ok) {
      orders.value = await response.json()
      console.log('📦 Загружены заказы:', orders.value)
    }
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error)
  } finally {
    loading.value = false
  }
}

// Фильтрация заказов
const filteredOrders = computed(() => {
  let filtered = orders.value
  
  if (filterType.value !== 'all') {
    filtered = filtered.filter(o => o.order_type === filterType.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(o => 
      o.customer_email?.toLowerCase().includes(query) ||
      o.customer_name?.toLowerCase().includes(query) ||
      o.customer_lastname?.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const selectOrder = (order) => {
  selectedOrder.value = order
}

onMounted(() => {
  fetchOrders()
})
</script>