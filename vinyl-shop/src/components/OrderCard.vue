<!-- src/components/OrderCard.vue -->
<template>
  <div class="bg-gray dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
    <!-- Заголовок заказа -->
    <div class="bg-gray dark:bg-slate-600/50 px-4 py-3 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <span class="text-xl">{{ order.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
        <span class="font-medium text-gray-900 dark:text-white">
          Заказ #{{ order.id }}
        </span>
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {{ new Date(order.created_at).toLocaleDateString() }}
        </span>
      </div>
      <button 
        @click="toggleExpand"
        class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
      >
        {{ expanded ? 'Свернуть' : 'Подробнее' }}
      </button>
    </div>

    <!-- Краткая информация -->
    <div class="px-4 py-3 flex justify-between items-center">
      <div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          {{ getItemCount }} {{ getItemCount === 1 ? 'товар' : 'товаров' }}
        </p>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Всего копий: {{ totalQuantity }}
        </p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-500 dark:text-gray-400">Сумма:</p>
        <p class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ order.total_price }} ₽</p>
      </div>
    </div>

    <!-- Детальная информация (разворачивается) -->
    <div v-if="expanded" class="border-t border-gray-200 dark:border-gray-600 p-4 space-y-3">
      <!-- Состав заказа с количеством под каждым товаром -->
      <div v-if="orderItems.length > 0">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Состав заказа:</h4>
        <div class="space-y-3">
          <div v-for="(item, index) in orderItems" :key="index"
            class="p-3 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
            
            <!-- Информация о товаре -->
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ item.title || item.name }}
                  <span v-if="item.artist" class="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    — {{ item.artist }}
                  </span>
                </div>
                <p v-if="item.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ item.description.substring(0, 100) }}...
                </p>
              </div>
              <span class="font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap ml-4">
                {{ item.totalPrice || item.price }} ₽
              </span>
            </div>
            
            <!-- Блок с количеством под каждым товаром -->
            <div class="mt-2 flex items-center gap-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-2">
              <span class="text-gray-500 dark:text-gray-400">Количество:</span>
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="order.order_type === 'vinyl' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'"
              >
                {{ item.quantity || 1 }} {{ order.order_type === 'vinyl' ? 'шт.' : 'услуга' }}
              </span>
              <span v-if="item.quantity && item.quantity > 1" class="text-xs text-gray-500 dark:text-gray-400">
                ({{ item.price }} ₽ × {{ item.quantity }})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Данные получателя -->
      <div>
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Получатель:</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ order.customer_name }} {{ order.customer_lastname }}
        </p>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ order.customer_email }}</p>
      </div>

      <!-- Адрес доставки (для пластинок) -->
      <div v-if="order.delivery_json">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Адрес доставки:</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ parsedDelivery.address }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ parsedDelivery.city }}, {{ parsedDelivery.country }}, {{ parsedDelivery.zipCode }}
        </p>
      </div>

      <!-- Детали мероприятия (для услуг) -->
      <div v-if="order.event_json">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Детали мероприятия:</h4>
        <p class="text-sm text-gray-600 dark:text-gray-400">Адрес: {{ parsedEvent.address }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Дата: {{ parsedEvent.date }} в {{ parsedEvent.time }}
        </p>
        <p v-if="parsedEvent.duration" class="text-sm text-gray-600 dark:text-gray-400">
          Длительность: {{ parsedEvent.duration }} ч.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const expanded = ref(false)

// Парсим items_json
const orderItems = computed(() => {
  try {
    const items = JSON.parse(props.order.items_json || '[]')
    return items
  } catch {
    return []
  }
})

// Общее количество единиц товара
const totalQuantity = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + (item.quantity || 1), 0)
})

// Парсим delivery_json
const parsedDelivery = computed(() => {
  try {
    return JSON.parse(props.order.delivery_json || '{}')
  } catch {
    return {}
  }
})

// Парсим event_json
const parsedEvent = computed(() => {
  try {
    return JSON.parse(props.order.event_json || '{}')
  } catch {
    return {}
  }
})

const getItemCount = computed(() => {
  return orderItems.value.length
})

const toggleExpand = () => {
  expanded.value = !expanded.value
}
</script>