<!-- src/views/ServicesDetailView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-6">
        <router-link 
          to="/catalog?tab=services"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray dark:text-gray hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад к услугам</span>
        </router-link>
      </div>

      <!-- Если загружена конкретная услуга -->
      <template v-if="selectedService">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ selectedService.name }} 🎤
          </h1>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {{ selectedService.description }}
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-3xl mx-auto mb-8">
          <div class="p-8">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-3xl">🎤</span>
                  <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedService.name }}</h2>
                  <button 
                    @click="toggleLikeService"
                    class="flex items-center gap-1 p-1 rounded-full transition-colors"
                    :class="likedItemsSet.has(`${selectedService.id}-service`) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'"
                    :title="likedItemsSet.has(`${selectedService.id}-service`) ? 'Убрать лайк' : 'Поставить лайк'"
                  >
                    <span class="text-xl">{{ likedItemsSet.has(`${selectedService.id}-service`) ? '👍' : '👍🏻' }}</span>
                    <span class="text-sm font-medium">{{ likesCountMap[`${selectedService.id}-service`] || 0 }}</span>
                  </button>
                </div>
                <p class="text-gray-600 dark:text-gray-400 mt-2">{{ selectedService.description }}</p>
                <div class="mt-3 flex items-center gap-3">
                  <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ selectedService.price }} ₽</span>
                  <span class="text-xs text-orange-500">📦 Заказов: {{ getOrdersCount(selectedService.id) }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                v-if="!isAuthenticated"
                @click="requireAuth('Войдите в аккаунт, чтобы добавить услугу в корзину')"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                🛒 В корзину
              </button>
              <button 
                v-else-if="!isInCart"
                @click="addToCart"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                🛒 В корзину
              </button>
              <button 
                v-else
                disabled
                class="flex-1 bg-gray-400 text-white px-5 py-2 rounded-lg font-bold text-sm cursor-not-allowed opacity-50"
              >
                ✓ В корзине
              </button>
              <button 
                v-if="!isAuthenticated"
                @click="requireAuth('Войдите в аккаунт, чтобы заказать услугу')"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                💳 Заказать
              </button>
              <button 
                v-else
                @click="buyNow"
                class="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                💳 Заказать
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- Если загружен артист -->
      <template v-else-if="selectedArtist">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Заказать артиста на мероприятие 🎤
          </h1>
          <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Детальная информация об артисте
          </p>
        </div>

        <div class="flex flex-col items-center px-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-3xl mx-auto mb-8">
            <div class="p-8">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-3xl">🎤</span>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedArtist.name }}</h2>
                    <button 
                      @click="toggleLikeArtist"
                      class="flex items-center gap-1 p-1 rounded-full transition-colors"
                      :class="likedItemsSet.has(`${selectedArtist.id}-artist`) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'"
                      :title="likedItemsSet.has(`${selectedArtist.id}-artist`) ? 'Убрать лайк' : 'Поставить лайк'"
                    >
                      <span class="text-xl">{{ likedItemsSet.has(`${selectedArtist.id}-artist`) ? '👍' : '👍🏻' }}</span>
                      <span class="text-sm font-medium">{{ likesCountMap[`${selectedArtist.id}-artist`] || 0 }}</span>
                    </button>
                  </div>
                  <p class="text-gray-600 dark:text-gray-400 mt-2">{{ selectedArtist.description }}</p>
                  
                  <div class="flex items-center gap-2 mt-2">
                    <div class="flex items-center gap-0.5">
                      <span v-for="star in 5" :key="star" class="text-lg">
                        {{ star <= artistRating ? '⭐' : '☆' }}
                      </span>
                    </div>
                    <span class="text-sm text-gray-500 dark:text-gray-400">({{ artistRating.toFixed(1) }}) • {{ artistRatingsCount }} оценок</span>
                  </div>
                  
                  <div class="mt-3 flex items-center gap-3">
                    <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ Number(selectedArtist.price).toLocaleString() }} ₽</span>
                    <span class="text-xs text-orange-500">📦 Заказов: {{ getOrdersCount(selectedArtist.id) }}</span>
                  </div>
                </div>
                <div class="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 ml-4">
                  <img 
                    v-if="selectedArtist.image"
                    :src="selectedArtist.image"
                    :alt="selectedArtist.name"
                    class="w-full h-full object-cover"
                    @error="handleImageError"
                  >
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-3xl">🎤</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  v-if="!isAuthenticated"
                  @click="requireAuth('Войдите в аккаунт, чтобы добавить услугу в корзину')"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  🛒 В корзину
                </button>
                <button 
                  v-else-if="!isInCart"
                  @click="addToCart"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  🛒 В корзину
                </button>
                <button 
                  v-else
                  disabled
                  class="flex-1 bg-gray-400 text-white px-5 py-2 rounded-lg font-bold text-sm cursor-not-allowed opacity-50"
                >
                  ✓ В корзине
                </button>
                <button 
                  v-if="!isAuthenticated"
                  @click="requireAuth('Войдите в аккаунт, чтобы заказать услугу')"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  💳 Заказать
                </button>
                <button 
                  v-else
                  @click="buyNow"
                  class="flex-1 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  💳 Заказать
                </button>
              </div>
            </div>
          </div>

          <!-- Отзывы -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full max-w-3xl mx-auto">
            <div class="p-8">
              <h3 class="text-xl font-bold dark:text-white mb-4">💬 Отзывы ({{ reviews.length }})</h3>
              
              <div v-if="approvedReviews.length > 0" class="space-y-4 mb-6">
                <div v-for="review in approvedReviews" :key="review.id" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div class="flex items-center justify-between mb-2">
                    <div>
                      <span class="font-semibold dark:text-white">{{ review.user_name }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">{{ formatDate(review.created_at) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <span v-for="star in 5" :key="star" class="text-lg">
                        {{ star <= review.rating ? '⭐' : '☆' }}
                      </span>
                    </div>
                  </div>
                  <p class="text-gray-700 dark:text-gray-300">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400">
                Пока нет отзывов. Будьте первым!
              </div>

              <div class="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <h4 class="font-semibold dark:text-white mb-3">Оставить отзыв</h4>
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ваша оценка</label>
                    <div class="flex gap-1">
                      <button 
                        v-for="star in 5" 
                        :key="star"
                        @click="newReview.rating = star"
                        class="text-2xl transition-colors"
                        :class="star <= newReview.rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'"
                      >
                        ★
                      </button>
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm text-gray-600 dark:text-gray-400 mb-1">Ваш комментарий</label>
                    <textarea 
                      v-model="newReview.comment" 
                      rows="3"
                      placeholder="Поделитесь впечатлениями об артисте..."
                      class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    ></textarea>
                  </div>
                  <div class="flex items-center justify-between">
                    <p class="text-xs text-gray-500 dark:text-gray-400">⭐ Отзыв будет опубликован после проверки модератором</p>
                    <button 
                      @click="submitReview"
                      :disabled="submittingReview || !newReview.rating || !newReview.comment"
                      class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      {{ submittingReview ? 'Отправка...' : 'Отправить отзыв' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Ничего не найдено</p>
        <router-link to="/catalog?tab=services" class="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          Вернуться к услугам
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { authApi } from '../api/auth'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const selectedService = ref(null)
const selectedArtist = ref(null)
const isInCart = ref(false)
const loading = ref(true)
const reviews = ref([])
const submittingReview = ref(false)
const newReview = ref({ rating: 0, comment: '' })
const artistRating = ref(0)
const artistRatingsCount = ref(0)
const orders = ref([])

// Реактивные структуры для лайков
const likedItemsSet = reactive(new Set())
const likesCountMap = reactive({})

const isAuthenticated = computed(() => !!authApi.getCurrentUser())

const approvedReviews = computed(() => reviews.value.filter(r => r.is_approved))

// Заказы из API (ДОБАВЛЕНО)
const ordersCountMap = computed(() => {
  const counts = {}
  
  if (!orders.value || orders.value.length === 0) {
    return counts
  }
  
  orders.value.forEach((order) => {
    if (order.items_json) {
      try {
        const items = typeof order.items_json === 'string' 
          ? JSON.parse(order.items_json) 
          : order.items_json
        
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (!item.id) return
            counts[item.id] = (counts[item.id] || 0) + 1
          })
        }
      } catch (e) {
        console.error(`Ошибка парсинга items_json:`, e)
      }
    }
  })
  
  return counts
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    let iso = dateString.replace(' ', 'T')
    if (!iso.includes('Z') && !iso.includes('+')) iso += 'Z'
    
    const date = new Date(iso)
    if (isNaN(date.getTime())) return dateString

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date)
  } catch (e) {
    return dateString
  }
}

// Функция для получения счётчика заказов из API
const getOrdersCount = (id) => {
  return ordersCountMap.value[id] || 0
}

// Загрузка данных из localStorage
const loadLikesFromStorage = () => {
  const savedItems = localStorage.getItem('liked-items')
  if (savedItems) {
    try {
      const items = JSON.parse(savedItems)
      likedItemsSet.clear()
      items.forEach(item => {
        likedItemsSet.add(`${item.id}-${item.type}`)
      })
    } catch (e) {
      console.error('Ошибка загрузки liked-items:', e)
    }
  }
  
  const savedCounts = localStorage.getItem('likes-counts')
  if (savedCounts) {
    try {
      const counts = JSON.parse(savedCounts)
      Object.keys(likesCountMap).forEach(key => delete likesCountMap[key])
      Object.entries(counts).forEach(([key, value]) => {
        likesCountMap[key] = value
      })
    } catch (e) {
      console.error('Ошибка загрузки likes-counts:', e)
    }
  }
}

const requireAuth = (message = 'Войдите в аккаунт, чтобы совершить это действие') => {
  alert(message)
  router.push('/login')
}

// Загрузка заказов из API (ДОБАВЛЕНО)
const fetchOrders = async () => {
  try {
    const response = await fetch('/api/orders')
    if (response.ok) {
      orders.value = await response.json()
    }
  } catch (err) {
    console.error('Ошибка загрузки заказов:', err)
  }
}

const fetchReviews = async () => {
  if (!selectedArtist.value) return
  try {
    const response = await fetch(`/api/reviews/artist/${selectedArtist.value.id}`)
    if (response.ok) {
      const allReviews = await response.json()
      reviews.value = allReviews
      
      const approved = allReviews.filter(r => r.is_approved)
      if (approved.length > 0) {
        const sum = approved.reduce((acc, r) => acc + r.rating, 0)
        artistRating.value = Math.round((sum / approved.length) * 10) / 10
        artistRatingsCount.value = approved.length
      } else {
        artistRating.value = 0
        artistRatingsCount.value = 0
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error)
  }
}

const toggleLikeArtist = async () => {
  if (!selectedArtist.value) return
  toggleLike(selectedArtist.value.id, 'artist')
}

const toggleLikeService = async () => {
  if (!selectedService.value) return
  toggleLike(selectedService.value.id, 'service')
}

const toggleLike = (id, type) => {
  const user = authApi.getCurrentUser()
  if (!user) {
    alert('Войдите в аккаунт, чтобы лайкнуть услугу')
    router.push('/login')
    return
  }
  
  const key = `${id}-${type}`
  const likedItems = localStorage.getItem('liked-items')
  let items = likedItems ? JSON.parse(likedItems) : []
  const currentCount = likesCountMap[key] || 0
  
  if (likedItemsSet.has(key)) {
    likedItemsSet.delete(key)
    items = items.filter(item => !(item.id === id && item.type === type))
    likesCountMap[key] = Math.max(0, currentCount - 1)
  } else {
    likedItemsSet.add(key)
    items.push({ id, type })
    likesCountMap[key] = currentCount + 1
  }
  
  localStorage.setItem('liked-items', JSON.stringify(items))
  
  const counts = localStorage.getItem('likes-counts')
  let countsObj = counts ? JSON.parse(counts) : {}
  countsObj[key] = likesCountMap[key]
  localStorage.setItem('likes-counts', JSON.stringify(countsObj))
}

const submitReview = async () => {
  const user = authApi.getCurrentUser()
  if (!user) {
    alert('Войдите в аккаунт, чтобы оставить отзыв')
    return
  }
  
  if (!newReview.value.rating || !newReview.value.comment.trim()) {
    alert('Заполните все поля')
    return
  }
  
  submittingReview.value = true
  
  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'artist',
        entity_id: selectedArtist.value.id,
        user_id: user.id,
        user_name: user.username || user.email,
        rating: newReview.value.rating,
        comment: newReview.value.comment.trim()
      })
    })
    
    if (response.ok) {
      alert('Отзыв отправлен на модерацию!')
      newReview.value = { rating: 0, comment: '' }
      await fetchReviews()
    } else {
      const error = await response.json()
      alert('Ошибка при отправке отзыва: ' + (error.message || 'Неизвестная ошибка'))
    }
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось отправить отзыв')
  } finally {
    submittingReview.value = false
  }
}

const checkIfInCart = () => {
  const item = selectedArtist.value || selectedService.value
  if (item) {
    isInCart.value = cartStore.isServiceInCart(item.id)
  } else {
    isInCart.value = false
  }
}

const addToCart = () => {
  const item = selectedArtist.value || selectedService.value
  if (item) {
    cartStore.addService(item)
    isInCart.value = true
    alert(`"${item.name}" добавлен в корзину!`)
  }
}

const buyNow = () => {
  const item = selectedArtist.value || selectedService.value
  if (item) {
    router.push({
      path: '/checkout',
      state: {
        directBuyItem: {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image,
          isVinyl: false,
          quantity: 1,
          artist: selectedArtist.value ? selectedArtist.value.name : undefined
        }
      }
    })
  }
}

const handleImageError = (e) => {
  e.target.parentElement.innerHTML = '<span class="text-3xl">🎤</span>'
}

const fetchServiceById = async (serviceId) => {
  try {
    const response = await fetch(`/api/services/${serviceId}`)
    if (response.ok) {
      selectedService.value = await response.json()
      checkIfInCart()
    }
  } catch (error) {
    console.error('Ошибка загрузки услуги:', error)
  }
}

const fetchArtistById = async (artistId) => {
  try {
    const response = await fetch(`/api/artists/${artistId}`)
    if (response.ok) {
      selectedArtist.value = await response.json()
      checkIfInCart()
      await fetchReviews()
    }
  } catch (error) {
    console.error('Ошибка загрузки артиста:', error)
  }
}

const loadData = async () => {
  loading.value = true
  const serviceId = route.params.id
  const artistId = route.query.artist

  // Загружаем заказы (ДОБАВЛЕНО)
  await fetchOrders()

  if (artistId) {
    await fetchArtistById(artistId)
  } else if (serviceId) {
    await fetchServiceById(serviceId)
  }
  
  loading.value = false
}

watch(() => [route.params.id, route.query.artist], () => {
  loadData()
})

onMounted(() => {
  loadLikesFromStorage()
  loadData()
})
</script>