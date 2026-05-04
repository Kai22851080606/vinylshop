<template>
  <main class="py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Акции и предложения 🎁
      </h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Эксклюзивные предложения для наших покупателей
      </p>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка акций...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      <button @click="fetchPromotions" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Попробовать снова
      </button>
    </div>

    <!-- Список акций -->
    <div v-else-if="promotions.length > 0" class="flex flex-col items-center px-4">
      <div v-for="promotion in promotions" :key="promotion.id"
           class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full max-w-3xl mx-auto mb-8">
        
        <!-- Изображение акции (если есть) -->
        <div v-if="promotion.image" class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
          <img :src="promotion.image" :alt="promotion.name" class="w-full h-full object-cover" @error="handleImageError">
        </div>
        
        <!-- Заголовок и тип акции -->
        <div class="p-6 pb-0">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">{{ getPromotionIcon(promotion.type) }}</span>
            <span class="text-sm px-3 py-1 rounded-full" :class="getPromotionBadgeClass(promotion.type)">
              {{ getPromotionTypeName(promotion.type) }}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ promotion.name }}</h2>
        </div>

        <!-- Контент -->
        <div class="p-6 flex flex-col flex-grow">
          <p class="text-gray-600 dark:text-gray-300 mb-4">{{ promotion.description }}</p>
          
          <!-- Условия акции -->
          <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <p class="text-blue-700 dark:text-blue-300 font-medium">
              {{ getPromotionDetails(promotion) }}
            </p>
          </div>
          
          <!-- Срок действия -->
          <div class="text-sm text-gray-500 dark:text-gray-400">
            <span v-if="promotion.start_date && promotion.end_date">
              📅 Действует с {{ formatDate(promotion.start_date) }} по {{ formatDate(promotion.end_date) }}
            </span>
            <span v-else-if="promotion.start_date">
              📅 Начинается с {{ formatDate(promotion.start_date) }}
            </span>
            <span v-else-if="promotion.end_date">
              📅 Действует до {{ formatDate(promotion.end_date) }}
            </span>
            <span v-else>📅 Бессрочная акция</span>
          </div>
          
          <!-- Кнопка перехода в каталог (для скидок) -->
          <div class="mt-6">
            <router-link 
              v-if="promotion.type === 'discount' || promotion.type === 'bundle'"
              to="/"
              class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Перейти в каталог
            </router-link>
            <div v-else-if="promotion.type === 'cashback'" class="text-sm text-gray-500 dark:text-gray-400">
              💰 Кэшбэк начисляется после покупки. Для получения обратитесь в поддержку.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Нет акций -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Акций пока нет</p>
      <p class="text-gray-400 dark:text-gray-500">Следите за обновлениями</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const promotions = ref([])
const loading = ref(true)
const error = ref(null)

const getPromotionIcon = (type) => {
  switch(type) {
    case 'discount': return '🏷️'
    case 'bundle': return '🎁'
    case 'cashback': return '💰'
    default: return '🎉'
  }
}

const getPromotionTypeName = (type) => {
  switch(type) {
    case 'discount': return 'Скидка'
    case 'bundle': return 'Выгодное предложение'
    case 'cashback': return 'Кэшбэк'
    default: return 'Акция'
  }
}

const getPromotionBadgeClass = (type) => {
  switch(type) {
    case 'discount': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    case 'bundle': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    case 'cashback': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300'
  }
}

const getPromotionDetails = (promotion) => {
  switch(promotion.type) {
    case 'discount':
      return promotion.discount_type === 'percentage' 
        ? `Скидка ${promotion.discount_value}% на ${promotion.target_type === 'all' ? 'все пластинки' : 'выбранные пластинки'}`
        : `Скидка ${promotion.discount_value} ₽ на ${promotion.target_type === 'all' ? 'все пластинки' : 'выбранные пластинки'}`
    case 'bundle':
      return `Купи ${promotion.buy_quantity} пластинки, получи ${promotion.get_quantity} бесплатно!`
    case 'cashback':
      return `Кэшбэк ${promotion.cashback_percent}% от стоимости покупки`
    default:
      return promotion.description
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}

const fetchPromotions = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('http://localhost:3001/api/promotions/active')
    if (!response.ok) throw new Error('Ошибка загрузки акций')
    promotions.value = await response.json()
    console.log('✅ Загружено акций:', promotions.value.length)
  } catch (err) {
    console.error('Ошибка:', err)
    error.value = 'Не удалось загрузить акции'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPromotions()
})
</script>