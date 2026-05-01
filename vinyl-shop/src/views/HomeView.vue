<!-- src/views/HomeView.vue -->
<template>
  <main class="py-8">
    <!-- СЛАЙДЕР С ПОПУЛЯРНЫМИ ПЛАСТИНКАМИ, НОВОСТЯМИ, УСЛУГАМИ И АРТИСТАМИ -->
    <div class="max-w-7xl mx-auto px-4 mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">⭐ Популярное</h2>
      <div class="relative">
        <div class="relative overflow-hidden rounded-2xl border-2 border-gray-300 dark:border-gray-600 shadow-lg">
          <div 
            class="flex transition-transform duration-500 ease-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <!-- Пластинки (по продажам) -->
            <div 
              v-for="(vinyl, index) in popularVinyls" 
              :key="'vinyl-' + vinyl.id"
              class="w-full flex-shrink-0 cursor-pointer"
              @click="goToVinylDetail(vinyl.id)"
            >
              <div class="relative h-[450px] md:h-[550px]">
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
                <img 
                  :src="vinyl.image || '/img/placeholder.jpg'" 
                  :alt="vinyl.title"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                >
                <div class="absolute inset-0 z-20 flex items-center">
                  <div class="container mx-auto px-4">
                    <div class="max-w-2xl text-white">
                      <span class="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4">💿 Пластинка</span>
                      <h2 class="text-3xl md:text-5xl font-bold mb-4 whitespace-normal break-words">{{ vinyl.title }}</h2>
                      <p class="text-lg text-gray-200 mb-2 whitespace-normal break-words">{{ vinyl.artist }}</p>
                      <div class="flex items-center gap-4 mb-4">
                        <div>
                          <span class="text-xl font-bold text-yellow-400">{{ vinyl.price }} ₽</span>
                        </div>
                        <span class="text-sm bg-orange-500/80 text-white px-3 py-1 rounded-full">🔥 Продано: {{ vinyl.orders_count || 0 }} копий</span>
                      </div>
                      <div class="flex items-center gap-4">
                        <button 
                          v-if="vinyl.stock > 0 && !isVinylInCart(vinyl.id)"
                          @click.stop="addToCart(vinyl)"
                          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                        >В корзину</button>
                        <span v-else-if="vinyl.stock === 0" class="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg cursor-not-allowed">Нет в наличии</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Новости (по просмотрам) -->
            <div 
              v-for="(newsItem, idx) in popularNews" 
              :key="'news-' + newsItem.id"
              class="w-full flex-shrink-0 cursor-pointer"
              @click="goToNewsDetail(newsItem.id)"
            >
              <div class="relative h-[450px] md:h-[550px]">
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
                <img :src="newsItem.image || '/img/placeholder-news.jpg'" :alt="newsItem.title" class="w-full h-full object-cover" @error="handleNewsImageError">
                <div class="absolute inset-0 z-20 flex items-center">
                  <div class="container mx-auto px-4">
                    <div class="max-w-2xl text-white">
                      <span class="inline-block px-3 py-1 bg-purple-600 text-white text-sm rounded-full mb-4">📰 Новость</span>
                      <h2 class="text-3xl md:text-5xl font-bold mb-4 whitespace-normal break-words">{{ newsItem.title }}</h2>
                      <div class="flex items-center gap-4 mb-4">
                        <span class="text-sm text-gray-200">{{ newsItem.date }}</span>
                        <span class="w-1 h-1 rounded-full bg-gray-400"></span>
                        <span class="text-sm text-gray-200">{{ newsItem.category }}</span>
                        <span class="text-sm text-yellow-400">👁️ {{ newsItem.views || 0 }} просмотров</span>
                      </div>
                      <p class="text-gray-200 whitespace-normal break-words mb-4">{{ newsItem.content?.substring(0, 200) }}...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Услуги и Артисты ОБЪЕДИНЕНЫ и ОТСОРТИРОВАНЫ по заказам (от большего к меньшему) -->
            <div 
              v-for="(item, idx) in popularServicesAndArtists" 
              :key="'item-' + item.id + '-' + item.type"
              class="w-full flex-shrink-0 cursor-pointer"
              @click="goToServiceDetail(item.id)"
            >
              <div class="relative h-[450px] md:h-[550px]">
                <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
                <img :src="item.image || '/img/placeholder-service.jpg'" :alt="item.name" class="w-full h-full object-cover" @error="handleServiceImageError">
                <div class="absolute inset-0 z-20 flex items-center">
                  <div class="container mx-auto px-4">
                    <div class="max-w-2xl text-white">
                      <span class="inline-block px-3 py-1 bg-green-600 text-white text-sm rounded-full mb-4">
                        🎤 Услуга
                     </span>
                     <h2 class="text-3xl md:text-5xl font-bold mb-4 whitespace-normal break-words">
                       {{ item.type === 'artist' ? `Заказать артиста ${item.name} на мероприятие` : item.name }}
                      </h2>
                      <p class="text-gray-200 mb-2 whitespace-normal break-words line-clamp-3">{{ item.description }}</p>
                      <div class="flex items-center gap-4 mb-4">
                        <span class="text-xl font-bold text-yellow-400">{{ typeof item.price === 'number' ? item.price.toLocaleString() : item.price }} ₽</span>
                        <span class="text-sm bg-orange-500/80 text-white px-3 py-1 rounded-full">📦 Заказов: {{ item.orderCount }}</span>
                      </div>
                      <button @click.stop="goToServiceDetail(item.id)" class="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors mt-2">Подробнее →</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button v-if="totalSlides > 1" @click="prevSlide" class="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors">←</button>
        <button v-if="totalSlides > 1" @click="nextSlide" class="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors">→</button>

        <div v-if="totalSlides > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
          <button v-for="(_, index) in totalSlides" :key="index" @click="currentSlide = index" class="w-3 h-3 rounded-full transition-all" :class="currentSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'"></button>
        </div>
      </div>
    </div>

    <!-- Статистика -->
    <div class="max-w-7xl mx-auto px-4 mb-8">
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-3">
            <span class="text-4xl">💿</span>
            <div>
              <p class="text-sm opacity-90">Всего копий пластинок на складе</p>
              <p class="text-3xl font-bold">{{ totalStock }} шт.</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm opacity-90">Доступно пластинок</p>
              <p class="text-2xl font-bold">{{ availableVinyls }} из {{ totalVinyls }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ссылка на каталог -->
    <div class="text-center mb-12">
      <router-link to="/catalog" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
        🛒 Перейти в каталог
      </router-link>
    </div>

    <!-- Секция "О нас" -->
    <div id="about" class="max-w-7xl mx-auto px-4 mb-12">
      <h2 class="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">О нас</h2>
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8">
        <p class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed text-center">
          vinyl-shop — это ваш проводник в мир качественного винила. Мы предлагаем широкий ассортимент пластинок, услуги по организации мероприятий и самые свежие новости из мира музыки.
        </p>
      </div>
    </div>

    <OrderForm 
      v-if="showOrderForm"
      :items="[selectedItem]"
      :is-vinyl="true"
      @close="showOrderForm = false"
      @submit="handleOrderSubmit"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import OrderForm from '../components/OrderForm.vue'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const vinyls = ref([])
const news = ref([])
const services = ref([])
const artists = ref([])
const orders = ref([])
const loading = ref(true)
const searchQuery = ref('')
const showOrderForm = ref(false)
const selectedItem = ref(null)
const currentSlide = ref(0)

const totalVinyls = computed(() => vinyls.value.length)
const availableVinyls = computed(() => vinyls.value.filter(v => v.stock > 0).length)
const totalStock = computed(() => vinyls.value.reduce((sum, v) => sum + (v.stock || 0), 0))

const popularVinyls = computed(() => [...vinyls.value].sort((a, b) => (b.orders_count || 0) - (a.orders_count || 0)).slice(0, 3))
const popularNews = computed(() => [...news.value].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 2))

// 1 В 1 КАК В SERVICESVIEW
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

// Услуги + артисты как в ServicesView
const popularServicesAndArtists = computed(() => {
  const allItems = [
    ...services.value
      .filter(s => s.name !== 'Заказать артиста на мероприятие')
      .map(s => ({ 
        ...s, 
        type: 'service',
        orderCount: ordersCountMap.value[s.id] || 0
      })),
    ...artists.value.map(a => ({ 
      ...a, 
      type: 'artist',
      orderCount: ordersCountMap.value[a.id] || 0
    }))
  ]
  
  return [...allItems].sort((a, b) => b.orderCount - a.orderCount).slice(0, 4)
})

const totalSlides = computed(() => popularVinyls.value.length + popularNews.value.length + popularServicesAndArtists.value.length)

const isVinylInCart = (id) => cartStore.isVinylInCart(id)

const addToCart = (v) => { cartStore.addVinyl({ id: v.id, title: v.title, artist: v.artist, price: v.price, image: v.image, type: v.type, stock: v.stock }); alert(`"${v.title}" добавлена в корзину!`) }

const goToVinylDetail = (id) => router.push(`/vinyl/${id}`)
const goToNewsDetail = (id) => router.push(`/news/${id}`)
const goToServiceDetail = (id) => router.push(`/service/${id}`)

const handleOrderSubmit = () => { showOrderForm.value = false }

const nextSlide = () => { if (totalSlides.value > 0) currentSlide.value = (currentSlide.value + 1) % totalSlides.value }
const prevSlide = () => { if (totalSlides.value > 0) currentSlide.value = currentSlide.value === 0 ? totalSlides.value - 1 : currentSlide.value - 1 }

const handleImageError = (e) => { e.target.src = '/img/placeholder.jpg' }
const handleNewsImageError = (e) => { e.target.src = '/img/placeholder-news.jpg' }
const handleServiceImageError = (e) => { e.target.src = '/img/placeholder-service.jpg' }

const handleSearch = (event) => { searchQuery.value = event.detail }
const performSearchFromQuery = () => { searchQuery.value = route.query.search || '' }

const fetchOrders = async () => { 
  try { 
    const r = await fetch('/api/orders'); 
    if (r.ok) orders.value = await r.json()
  } catch(e) { console.error(e) } 
}

const fetchVinyls = async () => { 
  try { 
    const r = await fetch('/api/vinyls'); 
    if (r.ok) vinyls.value = await r.json()
  } catch(e) { console.error(e) } 
}
const fetchNews = async () => { 
  try { 
    const r = await fetch('/api/news'); 
    if (r.ok) news.value = await r.json()
  } catch(e) { console.error(e) } 
}
const fetchServices = async () => { 
  try { 
    const r = await fetch('/api/services'); 
    if (r.ok) services.value = await r.json()
  } catch(e) { console.error(e) } 
}
const fetchArtists = async () => { 
  try { 
    const r = await fetch('/api/artists'); 
    if (r.ok) artists.value = await r.json()
  } catch(e) { console.error(e) } 
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchVinyls(), fetchNews(), fetchServices(), fetchArtists(), fetchOrders()])
  
  await cartStore.loadPromotions()
  await favoritesStore.loadFavorites()
  window.addEventListener('search-performed', handleSearch)
  performSearchFromQuery()
  loading.value = false
})

onUnmounted(() => { window.removeEventListener('search-performed', handleSearch) })

watch(popularVinyls, () => { currentSlide.value = 0 })
watch(totalSlides, () => { if (currentSlide.value >= totalSlides.value) currentSlide.value = 0 })
watch(() => route.query.search, (s) => { searchQuery.value = s || '' })
</script>

<style scoped>
.whitespace-normal {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.break-words {
  word-break: break-word;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>