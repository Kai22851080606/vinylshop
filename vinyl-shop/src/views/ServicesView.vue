<!-- src/views/ServicesView.vue -->
<template>
  <main class="py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Наши услуги 🎤
      </h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Выберите услугу для вашего мероприятия
      </p>
    </div>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка услуг...</p>
    </div>

    <!-- СПИСОК ВСЕХ УСЛУГ (вертикально, сверху вниз) -->
    <div v-else class="flex flex-col items-center px-4 max-w-3xl mx-auto">
      
      <!-- ОСТАЛЬНЫЕ УСЛУГИ (из базы данных services) -->
      <router-link 
        v-for="service in otherServices" 
        :key="service.id"
        :to="`/service/${service.id}`"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full mb-8 cursor-pointer block hover:-translate-y-1 transition-transform"
      >
        <div class="p-8">
          <div class="flex items-center justify-center mb-4">
            <span class="text-5xl">🎤</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
            {{ service.name }}
          </h2>
          <p class="text-gray-600 dark:text-gray-400 text-center mb-6">
            {{ service.description }}
          </p>
          <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ service.price }}</span>
            <div class="flex flex-col items-end gap-2">
              <span class="text-xs text-orange-500">📦 Заказов: {{ service.orderCount }}</span>
              <div class="flex gap-3">
                <button 
                  @click.stop="addServiceToCart(service)"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  🛒 В корзину
                </button>
                <button 
                  @click.stop="buyServiceNow(service)"
                  class="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
                >
                  💳 Купить
                </button>
              </div>
            </div>
          </div>
        </div>
      </router-link>

      <!-- АРТИСТЫ (отдельные карточки) - вся карточка кликабельна -->
      <router-link
        v-for="artist in artistsWithOrders" 
        :key="'artist-' + artist.id"
        :to="`/service/1?artist=${artist.id}`"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full mb-8 cursor-pointer block hover:-translate-y-1 transition-transform"
      >
        <div class="p-8">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-3xl">🎤</span>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ artist.name }}</h2>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mt-2">{{ artist.description }}</p>
              <div class="mt-3 flex items-center gap-3">
                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ Number(artist.price).toLocaleString() }} ₽</span>
                <span class="text-xs text-orange-500">📦 Заказов: {{ artist.orderCount }}</span>
              </div>
            </div>
            <div class="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 ml-4">
              <img 
                v-if="artist.image"
                :src="artist.image"
                :alt="artist.name"
                class="w-full h-full object-cover"
                @error="handleArtistImageError"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-3xl">🎤</span>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              @click.stop="addArtistToCart(artist)"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              🛒 Добавить в корзину
            </button>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Нет данных -->
    <div v-if="!loading && otherServices.length === 0 && artistsWithOrders.length === 0" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Услуги пока не добавлены</p>
      <p class="text-gray-400 dark:text-gray-500">Скоро появятся новые услуги</p>
    </div>

    <!-- Форма заказа -->
    <OrderForm 
      v-if="showOrderForm"
      :items="[selectedItemForOrder]"
      :is-vinyl="false"
      @close="showOrderForm = false"
      @submit="handleOrderSubmit"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import OrderForm from '../components/OrderForm.vue'

const router = useRouter()
const cartStore = useCartStore()
const showOrderForm = ref(false)
const selectedItemForOrder = ref(null)
const artists = ref([])
const allServices = ref([])
const orders = ref([])
const loading = ref(true)

// ТОЧНО КАК В SERVICESDETAILVIEW
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

// Услуги, исключая "Заказать артиста на мероприятие"
const otherServices = computed(() => {
  return allServices.value
    .filter(s => s.name !== 'Заказать артиста на мероприятие')
    .map(service => ({
      ...service,
      orderCount: ordersCountMap.value[service.id] || 0
    }))
})

// Артисты с подсчитанными заказами
const artistsWithOrders = computed(() => {
  return artists.value.map(artist => ({
    ...artist,
    orderCount: ordersCountMap.value[artist.id] || 0
  }))
})

const saveArtistView = (artistData) => {
  if (!artistData) return
  
  const recentViews = localStorage.getItem('recent-views')
  let views = []
  
  if (recentViews) {
    try {
      views = JSON.parse(recentViews)
    } catch (e) {
      views = []
    }
  }
  
  views = views.filter(item => !(item.id === artistData.id && item.type === 'service'))
  
  views.unshift({
    id: artistData.id,
    type: 'service',
    title: artistData.name,
    image: artistData.image,
    timestamp: new Date().toISOString()
  })
  
  if (views.length > 20) views = views.slice(0, 20)
  
  localStorage.setItem('recent-views', JSON.stringify(views))
}

const addArtistToCart = (artist) => {
  cartStore.addService(artist)
  saveArtistView(artist)
  alert(`"${artist.name}" добавлен в корзину!`)
}

// ТОЧНО КАК В SERVICESDETAILVIEW
const fetchOrders = async () => {
  try {
    const response = await fetch('api/orders')
    if (response.ok) {
      orders.value = await response.json()
    }
  } catch (err) {
    console.error('Ошибка загрузки заказов:', err)
  }
}

const fetchAllServices = async () => {
  try {
    const response = await fetch('/api/services')
    if (response.ok) {
      allServices.value = await response.json()
    }
  } catch (err) {
    console.error('Ошибка загрузки услуг:', err)
  }
}

const fetchArtists = async () => {
  try {
    const response = await fetch('/api/artists')
    if (response.ok) {
      artists.value = await response.json()
    }
  } catch (err) {
    console.error('Ошибка загрузки артистов:', err)
  }
}

const addServiceToCart = (service) => {
  cartStore.addService(service)
  alert(`"${service.name}" добавлен в корзину!`)
}

const buyServiceNow = (service) => {
  selectedItemForOrder.value = service
  showOrderForm.value = true
}

const handleOrderSubmit = () => {
  showOrderForm.value = false
}

const handleArtistImageError = (e) => {
  e.target.parentElement.innerHTML = '<span class="text-3xl">🎤</span>'
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchAllServices(), 
    fetchArtists(), 
    fetchOrders()
  ])
  loading.value = false
})
</script>