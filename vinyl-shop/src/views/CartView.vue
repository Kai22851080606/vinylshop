<!-- src/views/CartView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Корзина 🛒
      </h1>
      
      <!-- Вкладки -->
      <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button 
          @click="activeTab = 'vinyls'"
          class="px-6 py-3 font-medium transition-colors relative"
          :class="[
            activeTab === 'vinyls' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          Пластинки
          <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">{{ cartStore.totalVinyls }}</span>
        </button>
        <button 
          @click="activeTab = 'services'"
          class="px-6 py-3 font-medium transition-colors relative"
          :class="[
            activeTab === 'services' 
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          Услуги
          <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white">{{ cartStore.totalServices }}</span>
        </button>
      </div>

      <!-- Панель выбора -->
      <div v-if="currentItems.length > 0" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                :checked="selectAll"
                @change="toggleSelectAll"
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              >
              <span class="text-gray-700 dark:text-gray-300 font-medium">Выбрать все</span>
            </div>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              Выбрано: {{ selectedItems.length }} из {{ currentItems.length }}
            </span>
          </div>
          
          <div class="flex items-center gap-4">
            <div class="text-right">
              <span class="text-sm text-gray-500 dark:text-gray-400">Исходная сумма:</span>
              <span v-if="selectedOriginalTotal !== selectedFinalTotal" class="ml-2 text-lg font-medium text-gray-700 dark:text-gray-300 line-through">
                {{ selectedOriginalTotal }} ₽
              </span>
              <span class="ml-2 text-xl font-bold text-blue-600 dark:text-blue-400">{{ selectedFinalTotal }} ₽</span>
            </div>
            <button 
              @click="buySelected"
              :disabled="selectedItems.length === 0"
              class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>💳</span>
              Оплатить выбранное ({{ selectedItems.length }})
            </button>
          </div>
        </div>
      </div>

      <!-- Пластинки (кликабельные) -->
      <div v-if="activeTab === 'vinyls'" class="space-y-4">
        <div v-if="cartStore.vinylItems.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="text-4xl mb-2">💿</p>
          <p>В корзине нет пластинок</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="item in cartStore.vinylItems" 
            :key="item.id"
            @click="goToVinylDetail(item.id)"
            class="group flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            
            <div class="flex items-center gap-4 flex-1">
              <input 
                type="checkbox"
                v-model="selectedItems"
                :value="item"
                @click.stop
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              >
              
              <div class="w-16 h-16 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" alt="">
                <span v-else class="text-2xl">💿</span>
              </div>
              
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">{{ item.title }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.artist }}</span>
                  <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                  <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ item.price }} ₽</span>
                </div>
                
                <div class="mt-2 flex items-center gap-2">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Количество:</span>
                  <div class="flex items-center gap-1">
                    <button 
                      @click.stop="decreaseQuantity(item.id)"
                      class="w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors text-gray hover:bg-blue-400 hover:text-gray dark:text-black dark:hover:bg-gray dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                      :disabled="(itemQuantities[item.id] || 1) <= 1"
                    >
                      −
                    </button>
                    <span class="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                      {{ itemQuantities[item.id] || 1 }}
                    </span>
                    <button 
                      @click.stop="increaseQuantity(item.id)"
                      class="w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors text-gray hover:bg-blue-400 hover:text-gray dark:text-black dark:hover:bg-gray dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span class="text-xs" :class="getStockClass(item)">
                    (доступно: {{ item.stock || 0 }})
                  </span>
                </div>
                
                <div v-if="getItemDiscountedPrice(item, itemQuantities[item.id] || 1) !== item.price * (itemQuantities[item.id] || 1)" class="mt-1 text-xs text-green-600 dark:text-green-400">
                  🏷️ Цена со скидкой: {{ getItemDiscountedPrice(item, itemQuantities[item.id] || 1) }} ₽
                  <span class="text-gray-500 line-through ml-1">{{ item.price * (itemQuantities[item.id] || 1) }} ₽</span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="text-right">
                <span class="text-sm text-gray-500 dark:text-gray-400">Сумма:</span>
                <p class="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {{ getItemDiscountedPrice(item, itemQuantities[item.id] || 1) }} ₽
                </p>
                <p v-if="getItemDiscountedPrice(item, itemQuantities[item.id] || 1) !== item.price * (itemQuantities[item.id] || 1)" class="text-xs text-gray-500 line-through">
                  {{ item.price * (itemQuantities[item.id] || 1) }} ₽
                </p>
              </div>
              <button 
                @click.stop="removeFromCart(item.id, 'vinyl')"
                class="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить"
              >
                <span class="text-xl">🗑️</span>
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="cartStore.vinylItems.length > 0" class="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600 dark:text-gray-400">Исходная сумма:</span>
              <span class="font-medium text-gray-900 dark:text-white">{{ cartOriginalTotal }} ₽</span>
            </div>
            <div v-if="cartDiscountTotal > 0" class="flex justify-between items-center text-green-600 dark:text-green-400">
              <span class="text-sm">Скидка:</span>
              <span class="font-medium">- {{ cartDiscountTotal }} ₽</span>
            </div>
            <div v-if="bundlePromotion && bundleFreeTotal > 0" class="flex justify-between items-center text-purple-600 dark:text-purple-400">
              <span class="text-sm">{{ bundlePromotion.name }}:</span>
              <span class="font-medium">- {{ bundleFreeTotal }} ₽</span>
            </div>
            <div class="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-gray-900 dark:text-white">Итого к оплате:</span>
                <span class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ cartFinalTotal }} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Услуги (кликабельные - ведут на страницу услуги с выбранным артистом) -->
      <div v-if="activeTab === 'services'" class="space-y-4">
        <div v-if="cartStore.serviceItems.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="text-4xl mb-2">🎤</p>
          <p>В корзине нет услуг</p>
        </div>

        <div v-else class="space-y-2">
          <div 
            v-for="item in cartStore.serviceItems" 
            :key="item.id"
            @click="goToServiceWithArtist(item.id)"
            class="group flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-200 border border-gray-200 dark:border-gray-700 cursor-pointer"
          >
            
            <div class="flex items-center gap-4 flex-1">
              <input 
                type="checkbox"
                v-model="selectedItems"
                :value="item"
                @click.stop
                class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              >
              
              <div class="w-16 h-16 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-600">
                <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" alt="Фото услуги">
                <span v-else class="text-2xl">🎤</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900 dark:text-white">{{ item.name }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.description?.substring(0, 50) }}...</span>
                  <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                  <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ item.price }} ₽</span>
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>⏰</span>
                  <span>Время записи: {{ getServiceBookingTime(item.id) || 'по согласованию' }}</span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button 
                @click.stop="removeFromCart(item.id, 'service')"
                class="p-2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Удалить"
              >
                <span class="text-xl">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Кнопка подбора новостей по интересам из внешних источников -->
      <div class="mt-8 text-center">
        <button 
          @click="fetchNewsByInterests"
          :disabled="loadingNews"
          class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
        >
          <span>📰</span>
          {{ loadingNews ? 'Поиск новостей...' : 'Подобрать новости по интересам из внешних источников' }}
        </button>
        
        <!-- Результаты подбора новостей -->
        <div v-if="recommendedNews.length > 0" class="mt-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Рекомендованные новости по вашим интересам
          </h3>
          <div class="grid grid-cols-1 gap-4">
            <div 
              v-for="(newsItem, idx) in recommendedNews.slice(0, 6)" 
              :key="idx"
              class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-xl transition-all"
            >
              <div class="flex items-start gap-4">
                <div class="w-20 h-20 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="newsItem.urlToImage" :src="newsItem.urlToImage" class="w-full h-full object-cover" alt="" @error="handleImageError(newsItem, idx)">
                  <span v-else class="text-3xl">📰</span>
                </div>
                <div class="flex-1 text-left">
                  <a 
                    :href="newsItem.url" 
                    target="_blank"
                    class="font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-lg"
                  >
                    {{ newsItem.title }}
                  </a>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ newsItem.source?.name || 'Внешний источник' }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatNewsDate(newsItem.publishedAt) }}</span>
                    <span class="text-xs text-yellow-500 flex items-center gap-1">
                      <span>⭐</span>
                      <span>{{ newsItem.rating || (Math.random() * 2 + 3).toFixed(1) }}</span>
                    </span>
                    <span v-if="detectLanguage(newsItem.title || newsItem.description)" class="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                      {{ detectLanguage(newsItem.title || newsItem.description) === 'en' ? '🇬🇧 EN' : '🇷🇺 RU' }}
                    </span>
                  </div>
                  
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 dark:text-gray-300" :class="{ 'line-clamp-3': !isExpanded[idx] }">
                      <span v-if="isTranslated[idx] && translatedTexts[idx]">{{ translatedTexts[idx] }}</span>
                      <span v-else>{{ newsItem.description || newsItem.content || 'Нет описания' }}</span>
                    </p>
                    <div class="flex flex-wrap gap-2 mt-1">
                      <button 
                        v-if="shouldShowExpandButton(newsItem)"
                        @click="toggleExpand(idx)"
                        class="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {{ isExpanded[idx] ? 'Свернуть ▲' : 'Развернуть ▼' }}
                      </button>
                      <button 
                        v-if="detectLanguage(newsItem.title || newsItem.description) !== 'ru'"
                        @click="translateNews(newsItem, idx)"
                        :disabled="translating[idx]"
                        class="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
                      >
                        <span>🌐</span>
                        {{ translating[idx] ? 'Перевод...' : (isTranslated[idx] ? 'Оригинал' : 'Перевести на русский') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-center mt-8">
        <router-link 
          to="/profile" 
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>←</span> Назад в профиль
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'

const router = useRouter()
const cartStore = useCartStore()
const activeTab = ref('vinyls')
const selectedItems = ref([])
const itemQuantities = ref({})
const loadingNews = ref(false)
const recommendedNews = ref([])
const isExpanded = ref({})
const isTranslated = ref({})
const translatedTexts = ref({})
const translating = ref({})

// Хранилище времени записи на услуги
const serviceBookingTimes = ref({})

// Функция определения языка текста
const detectLanguage = (text) => {
  if (!text) return 'ru'
  const cyrillicPattern = /[а-яё]/i
  return cyrillicPattern.test(text) ? 'ru' : 'en'
}

// Функция перевода текста через бесплатный API
const translateNews = async (newsItem, idx) => {
  if (isTranslated.value[idx]) {
    isTranslated.value[idx] = false
    return
  }
  
  translating.value[idx] = true
  
  try {
    const textToTranslate = newsItem.description || newsItem.content || ''
    if (!textToTranslate) {
      alert('Нет текста для перевода')
      translating.value[idx] = false
      return
    }
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|ru`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.responseData && data.responseData.translatedText) {
        translatedTexts.value[idx] = data.responseData.translatedText
        isTranslated.value[idx] = true
      } else {
        alert('Не удалось перевести текст')
      }
    } else {
      alert('Ошибка при переводе')
    }
  } catch (error) {
    console.error('Ошибка перевода:', error)
    alert('Не удалось подключиться к сервису перевода')
  } finally {
    translating.value[idx] = false
  }
}

const loadPromotions = async () => {
  await cartStore.loadPromotions()
}

const discountPromotion = computed(() => {
  return cartStore.activePromotions?.value?.find(p => p.type === 'discount' && p.active === 1) || null
})
const bundlePromotion = computed(() => cartStore.getBundlePromotion())
const cashbackPromotion = computed(() => cartStore.getCashbackPromotion())

const getItemDiscountedPrice = (item, quantity) => {
  return cartStore.getDiscountedPrice(item, quantity)
}

const cartOriginalTotal = computed(() => {
  let total = 0
  for (const item of cartStore.vinylItems) {
    const qty = itemQuantities.value[item.id] || 1
    total += item.price * qty
  }
  return total
})

const cartDiscountedTotal = computed(() => {
  let total = 0
  for (const item of cartStore.vinylItems) {
    const qty = itemQuantities.value[item.id] || 1
    total += getItemDiscountedPrice(item, qty)
  }
  return total
})

const cartDiscountTotal = computed(() => {
  return cartOriginalTotal.value - cartDiscountedTotal.value
})

const bundleFreeTotal = computed(() => {
  if (!bundlePromotion.value) return 0
  
  const buyQty = bundlePromotion.value.buy_quantity || 2
  const getQty = bundlePromotion.value.get_quantity || 1
  let totalQty = 0
  for (const item of cartStore.vinylItems) {
    totalQty += itemQuantities.value[item.id] || 1
  }
  const freeCount = Math.floor(totalQty / (buyQty + getQty)) * getQty
  
  if (freeCount === 0) return 0
  
  const allItems = []
  for (const item of cartStore.vinylItems) {
    const qty = itemQuantities.value[item.id] || 1
    for (let i = 0; i < qty; i++) {
      allItems.push(item)
    }
  }
  allItems.sort((a, b) => a.price - b.price)
  
  let freeTotal = 0
  for (let i = 0; i < freeCount && i < allItems.length; i++) {
    freeTotal += allItems[i].price
  }
  
  return freeTotal
})

const cartFinalTotal = computed(() => {
  let total = cartDiscountedTotal.value
  total -= bundleFreeTotal.value
  return Math.max(0, total)
})

const initializeQuantities = () => {
  cartStore.vinylItems.forEach(item => {
    if (!itemQuantities.value[item.id]) {
      itemQuantities.value[item.id] = 1
    }
  })
}

watch(() => cartStore.vinylItems, (newItems) => {
  newItems.forEach(item => {
    if (!itemQuantities.value[item.id]) {
      itemQuantities.value[item.id] = 1
    }
  })
}, { deep: true, immediate: true })

const increaseQuantity = (itemId) => {
  const item = cartStore.vinylItems.find(i => i.id === itemId)
  if (item && (itemQuantities.value[itemId] || 1) < (item.stock || 0)) {
    itemQuantities.value[itemId] = (itemQuantities.value[itemId] || 1) + 1
  }
}

const decreaseQuantity = (itemId) => {
  if ((itemQuantities.value[itemId] || 1) > 1) {
    itemQuantities.value[itemId] = (itemQuantities.value[itemId] || 1) - 1
  }
}

const getStockClass = (item) => {
  if (!item.stock || item.stock === 0) return 'text-red-600 dark:text-red-400 font-bold'
  if (item.stock < 5) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-green-600 dark:text-green-400'
}

const getServiceBookingTime = (serviceId) => {
  return serviceBookingTimes.value[serviceId] || null
}

const loadServiceBookingTimes = () => {
  const saved = localStorage.getItem('service-booking-times')
  if (saved) {
    try {
      serviceBookingTimes.value = JSON.parse(saved)
    } catch (e) {
      serviceBookingTimes.value = {}
    }
  }
}

const currentItems = computed(() => {
  return activeTab.value === 'vinyls' ? cartStore.vinylItems : cartStore.serviceItems
})

const selectedOriginalTotal = computed(() => {
  return selectedItems.value.reduce((sum, item) => {
    if (activeTab.value === 'vinyls') {
      const qty = itemQuantities.value[item.id] || 1
      return sum + (item.price * qty)
    } else {
      return sum + (item.price || 0)
    }
  }, 0)
})

const selectedFinalTotal = computed(() => {
  if (activeTab.value !== 'vinyls') return selectedOriginalTotal.value
  
  let total = 0
  for (const item of selectedItems.value) {
    const qty = itemQuantities.value[item.id] || 1
    total += getItemDiscountedPrice(item, qty)
  }
  
  if (bundlePromotion.value && selectedItems.value.length > 0) {
    const buyQty = bundlePromotion.value.buy_quantity || 2
    const getQty = bundlePromotion.value.get_quantity || 1
    let totalQty = 0
    for (const item of selectedItems.value) {
      totalQty += itemQuantities.value[item.id] || 1
    }
    const freeCount = Math.floor(totalQty / (buyQty + getQty)) * getQty
    
    if (freeCount > 0) {
      const allItems = []
      for (const item of selectedItems.value) {
        const qty = itemQuantities.value[item.id] || 1
        for (let i = 0; i < qty; i++) {
          allItems.push(item)
        }
      }
      allItems.sort((a, b) => a.price - b.price)
      
      let freeTotal = 0
      for (let i = 0; i < freeCount && i < allItems.length; i++) {
        freeTotal += allItems[i].price
      }
      total -= freeTotal
    }
  }
  
  return Math.max(0, total)
})

const selectAll = computed(() => {
  return currentItems.value.length > 0 && selectedItems.value.length === currentItems.value.length
})

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedItems.value = [...currentItems.value]
  } else {
    selectedItems.value = []
  }
}

watch(activeTab, () => {
  selectedItems.value = []
})

const removeFromCart = (id, type) => {
  if (type === 'vinyl') {
    delete itemQuantities.value[id]
    cartStore.removeVinyl(id)
  } else {
    cartStore.removeService(id)
  }
  selectedItems.value = selectedItems.value.filter(item => item.id !== id)
}

const goToVinylDetail = (id) => {
  router.push(`/vinyl/${id}`)
}

const goToServiceWithArtist = (artistId) => {
  router.push(`/service/1?artist=${artistId}`)
}

const shouldShowExpandButton = (newsItem) => {
  const text = newsItem.description || newsItem.content || ''
  return text.length > 150
}

const toggleExpand = (index) => {
  isExpanded.value[index] = !isExpanded.value[index]
}

const formatNewsDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleImageError = (newsItem, idx) => {
  newsItem.urlToImage = null
  recommendedNews.value = [...recommendedNews.value]
}

const fetchNewsByInterests = async () => {
  loadingNews.value = true
  recommendedNews.value = []
  isExpanded.value = {}
  isTranslated.value = {}
  translatedTexts.value = {}
  
  try {
    const interests = []
    
    cartStore.vinylItems.forEach(vinyl => {
      if (vinyl.title) interests.push(vinyl.title)
      if (vinyl.artist) interests.push(vinyl.artist)
    })
    
    cartStore.serviceItems.forEach(service => {
      if (service.name) interests.push(service.name)
    })
    
    const searchQuery = interests.length > 0 
      ? interests.slice(0, 5).join(' OR ')
      : 'music vinyl records concert'
    
    // RSS-ленты популярных музыкальных изданий
    const rssFeeds = [
      { url: 'https://www.rollingstone.com/music/music-news/feed/', name: 'Rolling Stone' },
      { url: 'https://www.billboard.com/category/news/feed/', name: 'Billboard' },
      { url: 'https://pitchfork.com/feed/news/', name: 'Pitchfork' },
      { url: 'https://www.nme.com/feed', name: 'NME' },
      { url: 'https://www.spin.com/feed/', name: 'SPIN' },
      { url: 'https://consequence.net/feed/', name: 'Consequence' }
    ]
    
    const allArticles = []
    
    for (const feed of rssFeeds) {
      try {
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
        const response = await fetch(proxyUrl)
        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
              allArticles.push({
                title: item.title,
                description: item.description?.replace(/<[^>]*>/g, '').substring(0, 500),
                content: item.content?.replace(/<[^>]*>/g, ''),
                url: item.link,
                urlToImage: item.enclosure?.link || item.thumbnail,
                source: { name: feed.name },
                publishedAt: item.pubDate,
                rating: (Math.random() * 2 + 3).toFixed(1)
              })
            })
          }
        }
      } catch (e) {
        console.log(`Ошибка загрузки RSS: ${feed.url}`)
      }
    }
    
    if (allArticles.length > 0) {
      const filtered = allArticles.filter(article => {
        const text = (article.title + ' ' + article.description).toLowerCase()
        return interests.some(interest => text.includes(interest.toLowerCase()))
      })
      
      recommendedNews.value = filtered.slice(0, 6)
      if (recommendedNews.value.length === 0) {
        recommendedNews.value = allArticles.slice(0, 6)
      }
    } else {
      recommendedNews.value = generateDemoNews(interests)
    }
    
  } catch (error) {
    console.error('Ошибка получения новостей:', error)
    recommendedNews.value = generateDemoNews(['музыка', 'рок', 'джаз'])
  } finally {
    loadingNews.value = false
  }
}

const generateDemoNews = (interests) => {
  const topics = interests.length ? interests : ['Музыка', 'Rock', 'Jazz', 'Electronic', 'Classical']
  const titles = [
    'New album release announced for next month',
    'Concert in Moscow: all tickets sold out in 2 hours',
    'Exclusive interview with famous musician',
    'Festival announces headliners for this year',
    'Remastered version of legendary album',
    'Musician announces tour across Russia',
    'Vinyl records are back in fashion',
    'Rare recording found in the attic'
  ]
  
  const images = [
    'https://picsum.photos/id/29/200/150',
    'https://picsum.photos/id/30/200/150',
    'https://picsum.photos/id/32/200/150',
    'https://picsum.photos/id/34/200/150',
    'https://picsum.photos/id/36/200/150'
  ]
  
  const sources = ['Rolling Stone', 'Billboard', 'NME', 'Pitchfork', 'Music News']
  
  return titles.slice(0, 6).map((title, i) => ({
    title: `${topics[i % topics.length]}: ${title}`,
    description: 'Breaking news: The music industry is buzzing with excitement as major announcements are being made. Fans are eagerly awaiting the upcoming releases and tour dates. Stay tuned for more updates on this developing story. Musicians and producers are working hard to bring you the best content possible.',
    content: 'Full news content...',
    url: '#',
    urlToImage: images[i % images.length],
    source: { name: sources[i % sources.length] },
    publishedAt: new Date().toISOString(),
    rating: (Math.random() * 2 + 3).toFixed(1)
  }))
}

const buySelected = () => {
  if (selectedItems.value.length === 0) {
    alert('Выберите товары для оплаты')
    return
  }
  
  if (activeTab.value === 'vinyls') {
    const outOfStock = selectedItems.value.filter(item => {
      const qty = itemQuantities.value[item.id] || 1
      return qty > (item.stock || 0)
    })
    
    if (outOfStock.length > 0) {
      alert('Для некоторых товаров выбрано больше количества, чем есть в наличии')
      return
    }
  }
  
  // Формируем массив выбранных товаров с количествами
  const itemsForCheckout = selectedItems.value.map(item => {
    if (activeTab.value === 'vinyls') {
      return {
        ...item,
        isVinyl: true,
        quantity: itemQuantities.value[item.id] || 1,
        title: item.title,
        name: item.name || item.title,
        artist: item.artist
      }
    } else {
      return {
        ...item,
        isVinyl: false,
        quantity: 1,
        title: item.title || item.name,
        name: item.name,
        artist: item.artist || item.name // ДОБАВЛЕНО: если artist нет, используем name
      }
    }
  })
  
  // Переходим на страницу оформления заказа с выбранными товарами
  router.push({
    path: '/checkout',
    state: {
      selectedItems: itemsForCheckout
    }
  })
}

onMounted(() => {
  initializeQuantities()
  loadPromotions()
  loadServiceBookingTimes()
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>