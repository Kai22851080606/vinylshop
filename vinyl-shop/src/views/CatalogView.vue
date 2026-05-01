<!-- src/views/CatalogView.vue -->
<template>
  <main class="py-8">
    <!-- ВКЛАДКИ -->
    <div class="max-w-7xl mx-auto px-4 mb-8">
      <div class="flex gap-3 border-b border-gray-200 dark:border-gray-700 flex-wrap justify-center">
        <button 
          v-for="tab in contentTabs" 
          :key="tab.id"
          @click="activeContentTab = tab.id"
          class="px-6 py-3 font-medium transition-colors rounded-t-lg"
          :class="activeContentTab === tab.id 
            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ tab.name }}
        </button>
      </div>
    </div>

    <!-- ==================== ПЛАСТИНКИ ==================== -->
    <template v-if="activeContentTab === 'vinyls'">
      <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">Доступные виниловые пластинки 💿</h2>

      <div class="flex flex-wrap items-center justify-end gap-4 mb-8 max-w-7xl mx-auto px-4">
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Сортировка:</span>
          <select v-model="vinylSortType" @change="saveVinylSettings" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="title">По названию</option>
            <option value="artist">По артисту</option>
            <option value="price">По цене</option>
            <option value="orders_count">По популярности</option>
            <option value="stock">По количеству в наличии</option>
          </select>
        </div>
        <button @click="toggleVinylSortOrder" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 min-w-[140px] justify-center">
          <span>{{ vinylSortOrder === 'asc' ? '↑' : '↓' }}</span>
          <span>{{ getVinylSortButtonText }}</span>
        </button>
        <div class="flex items-center gap-2 ml-4">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Фильтр:</span>
          <select v-model="vinylFilterType" @change="saveVinylSettings" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
            <option value="all">Все</option>
            <option value="single">Сингл</option>
            <option value="ep">EP</option>
            <option value="album">Альбом</option>
            <option value="inStock">Только в наличии</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка пластинок...</p>
      </div>

      <div v-else-if="filteredAndSortedVinyls.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4 mb-12">
        <div v-for="vinyl in filteredAndSortedVinyls" :key="vinyl.id" @click="goToVinylDetail(vinyl.id)" class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-black dark:border-white transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col h-full relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:translate-y-full">
          <div class="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-inner bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-black dark:border-white shrink-0">
            <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="Vinyl cover">
            <span v-else class="text-6xl">💿</span>
          </div>
          <div class="space-y-2 flex-grow">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold dark:text-white leading-tight">{{ vinyl.title }}</h3>
              <button @click.stop="toggleFavorite(vinyl.id)" class="p-1 rounded-full transition-colors" :class="isVinylFavorite(vinyl.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'" :title="isVinylFavorite(vinyl.id) ? 'Удалить из избранного' : 'Добавить в избранное'">
                <span class="text-xl">{{ isVinylFavorite(vinyl.id) ? '❤️' : '🤍' }}</span>
              </button>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium">{{ vinyl.artist }}</p>
          </div>
          <div class="mt-2 mb-2">
            <div v-if="vinyl.stock === 0" class="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full inline-block whitespace-nowrap">НЕТ В НАЛИЧИИ!</div>
            <div v-else class="text-sm whitespace-nowrap" :class="{'text-yellow-600 dark:text-yellow-400': vinyl.stock < 5, 'text-green-600 dark:text-green-400': vinyl.stock >= 5}">В наличии: {{ vinyl.stock }} шт.</div>
            <div v-if="vinyl.orders_count > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">🔥 Продано: {{ vinyl.orders_count }} шт.</div>
          </div>
          <div class="flex items-center justify-between pt-2">
            <div class="flex flex-col">
              <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ getDiscountedPrice(vinyl) }} ₽</span>
              <span v-else class="text-2xl font-black text-blue-600 dark:text-blue-400">{{ vinyl.price }} ₽</span>
              <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-gray-500 line-through">{{ vinyl.price }} ₽</span>
            </div>
            <div class="flex gap-2">
              <button v-if="!isAuthenticated" @click.stop="requireAuth('Войдите в аккаунт, чтобы добавить виниловую пластинку в корзину')" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap">🛒</button>
              <button v-else-if="!isVinylInCart(vinyl.id) && vinyl.stock > 0" @click.stop="addToCart(vinyl)" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap">🛒</button>
              <button v-else-if="vinyl.stock > 0" disabled class="bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap">✓</button>
              <button v-else disabled class="bg-gray-400 text-white px-0 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap">Нет в наличии</button>
            </div>
          </div>
          <div v-if="(getDiscountPercent(vinyl) && getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price) || (cashbackPromotion && cashbackPromotion.cashback_percent > 0) || (bundlePromotion && bundlePromotion.buy_quantity > 0)" class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap gap-2">
              <div v-if="getDiscountPercent(vinyl) && getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">🏷️ Скидка {{ getDiscountPercent(vinyl) }}%</div>
              <div v-if="cashbackPromotion && cashbackPromotion.cashback_percent > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">💰 Кэшбэк {{ cashbackPromotion.cashback_percent }}%</div>
              <div v-if="bundlePromotion && bundlePromotion.buy_quantity > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">🎁 {{ bundlePromotion.buy_quantity }}+{{ bundlePromotion.get_quantity }}</div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400"><p class="text-4xl mb-2">💿</p><p>Пластинки пока не добавлены</p></div>
    </template>

    <!-- ==================== НОВОСТИ ==================== -->
    <template v-if="activeContentTab === 'news'">
      <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">Новости 📰</h2>
      <div class="flex flex-col items-center px-4 max-w-3xl mx-auto mb-12">
        <div v-if="news.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400"><p>Новости пока отсутствуют</p></div>
        <div v-for="item in pagedNews" :key="'news-card-' + item.id" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full mb-8 cursor-pointer" @click="goToNewsDetail(item.id)">
          <div class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border-b border-black dark:border-white">
            <img v-if="item.image" :src="item.image" :alt="item.title" class="w-full h-full object-cover" @error="handleNewsImageError">
            <div v-else class="w-full h-full flex items-center justify-center"><span class="text-4xl">🎵</span></div>
          </div>
          <div class="p-8 flex flex-col flex-grow">
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
              <span>{{ item.date }}</span>
              <span>•</span>
              <span>{{ item.category }}</span>
              <span class="ml-auto flex items-center gap-3">
                <button @click.stop="toggleNewsFavorite(item.id)" class="p-1 rounded-full transition-colors" :class="isNewsFavorite(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'" :title="isNewsFavorite(item.id) ? 'Удалить из избранного' : 'Добавить в избранное'">
                  <span class="text-xl">{{ isNewsFavorite(item.id) ? '❤️' : '🤍' }}</span>
                </button>
                <span>👁️ {{ item.views || 0 }}</span>
              </span>
            </div>
            <h3 class="text-2xl font-bold dark:text-white mb-4">{{ item.title }}</h3>
            <div class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed"><p class="line-clamp-3">{{ item.content }}</p></div>
          </div>
        </div>
        <div v-if="news.length > 5" class="flex gap-4 mt-4">
          <button @click="newsPage--" :disabled="newsPage <= 0" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50">← Назад</button>
          <span class="px-4 py-2 text-gray-700 dark:text-gray-300">Стр. {{ newsPage + 1 }} из {{ Math.ceil(news.length / 5) }}</span>
          <button @click="newsPage++" :disabled="(newsPage + 1) * 5 >= news.length" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50">Вперёд →</button>
        </div>
      </div>
    </template>

    <!-- ==================== УСЛУГИ ==================== -->
    <template v-if="activeContentTab === 'services'">
      <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">Услуги 🎤</h2>
      <div class="flex flex-col items-center px-4 max-w-3xl mx-auto mb-12">
        <div v-if="allServices.length === 0 && artists.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400"><p>Услуги пока не добавлены</p></div>
        
        <!-- Услуги -->
        <div v-for="service in allServices" :key="'service-card-' + service.id" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden w-full mb-8 cursor-pointer hover:-translate-y-1 transition-transform" @click="goToServiceDetail(service.id)">
          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <span class="text-5xl">🎤</span>
              <button @click.stop="toggleLike(service.id, 'service')" class="flex items-center gap-1 p-1 rounded-full transition-colors" :class="likedItemsSet.has(`${service.id}-service`) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'" :title="likedItemsSet.has(`${service.id}-service`) ? 'Убрать лайк' : 'Поставить лайк'">
                <span class="text-xl">{{ likedItemsSet.has(`${service.id}-service`) ? '👍' : '👍🏻' }}</span>
                <span class="text-sm font-medium">{{ likesCountMap[`${service.id}-service`] || 0 }}</span>
              </button>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">{{ service.name }}</h2>
            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center gap-3">
                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ service.price }}</span>
                <span class="text-xs text-orange-500">📦 Заказов: {{ getOrdersCount(service.id) }}</span>
              </div>
              <button v-if="!isAuthenticated" @click.stop="requireAuth('Войдите в аккаунт, чтобы добавить услугу в корзину')" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">🛒 В корзину</button>
              <button v-else-if="!isServiceInCart(service.id)" @click.stop="addServiceToCart(service)" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors">🛒 В корзину</button>
              <button v-else disabled class="bg-gray-400 text-white px-5 py-2 rounded-lg font-bold text-sm cursor-not-allowed opacity-50">✓ В корзине</button>
            </div>
          </div>
        </div>

       <!-- АРТИСТЫ (отдельные карточки) - вся карточка кликабельна -->
      <router-link
        v-for="artist in artists" 
        :key="'artist-' + artist.id"
        :to="`/service/1?artist=${artist.id}`"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden w-full mb-8 cursor-pointer block hover:-translate-y-1 transition-transform"
      >
        <div class="p-8">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="text-3xl">🎤</span>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Заказать на мероприятие артиста {{ artist.name }}</h2>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ Number(artist.price).toLocaleString() }} ₽</span>
                <span class="text-xs text-orange-500">📦 Заказов: {{ getOrdersCount(artist.id) }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button @click.prevent.stop="toggleLike(artist.id, 'artist')" class="flex items-center gap-1 p-1 rounded-full transition-colors" :class="likedItemsSet.has(`${artist.id}-artist`) ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'" :title="likedItemsSet.has(`${artist.id}-artist`) ? 'Убрать лайк' : 'Поставить лайк'">
                <span class="text-xl">{{ likedItemsSet.has(`${artist.id}-artist`) ? '👍' : '👍🏻' }}</span>
                <span class="text-sm font-medium">{{ likesCountMap[`${artist.id}-artist`] || 0 }}</span>
              </button>
              <div class="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
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
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              v-if="!isAuthenticated"
              @click.prevent.stop="requireAuth('Войдите в аккаунт, чтобы добавить артиста в корзину')"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              🛒 Добавить в корзину
            </button>
            <button 
              v-else-if="!isServiceInCart(artist.id)"
              @click.prevent.stop="addArtistToCart(artist)"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors"
            >
              🛒 Добавить в корзину
            </button>
            <button 
              v-else
              disabled
              class="w-full bg-gray-400 text-white px-5 py-2 rounded-lg font-bold text-sm cursor-not-allowed opacity-50"
            >
              ✓ В корзине
            </button>
          </div>
        </div>
      </router-link>
    </div>
    </template>

    <!-- ==================== АКЦИИ ==================== -->
    <template v-if="activeContentTab === 'promotions'">
      <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">Акции 🎁</h2>
      <div class="flex flex-col items-center px-4 max-w-3xl mx-auto mb-12">
        <div v-if="activePromotions.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400"><p>Акций пока нет</p></div>
        <div v-for="promotion in activePromotions" :key="'promo-' + promotion.id" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full mb-8">
          <div v-if="promotion.image" class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
            <img :src="promotion.image" :alt="promotion.name" class="w-full h-full object-cover" @error="handlePromoImageError">
          </div>
          <div class="p-6 pb-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ getPromotionIcon(promotion.type) }}</span>
              <span class="text-sm px-3 py-1 rounded-full" :class="getPromotionBadgeClass(promotion.type)">{{ getPromotionTypeName(promotion.type) }}</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ promotion.name }}</h2>
          </div>
          <div class="p-6 flex flex-col flex-grow">
            <p class="text-gray-600 dark:text-gray-300 mb-4">{{ promotion.description }}</p>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4"><p class="text-blue-700 dark:text-blue-300 font-medium">{{ getPromotionDetails(promotion) }}</p></div>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import { authApi } from '../api/auth'

const router = useRouter()
const route = useRoute()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const activeContentTab = ref('vinyls')
const contentTabs = [
  { id: 'vinyls', name: '💿 Пластинки' },
  { id: 'news', name: '📰 Новости' },
  { id: 'services', name: '🎤 Услуги' },
  { id: 'promotions', name: '🎁 Акции' }
]

const vinyls = ref([])
const news = ref([])
const allServices = ref([])
const artists = ref([])
const orders = ref([])
const activePromotions = ref([])
const loading = ref(true)
const newsPage = ref(0)
const favoriteNewsIds = ref(new Set())

// Реактивные структуры для лайков
const likedItemsSet = reactive(new Set())
const likesCountMap = reactive({})

// Реактивная структура для счётчиков заказов
const ordersCountMap = reactive({})

const isAuthenticated = computed(() => !!authApi.getCurrentUser())
const currentUser = computed(() => authApi.getCurrentUser())

const savedVinylFilterType = localStorage.getItem('vinyl-filter-type')
const savedVinylSortType = localStorage.getItem('vinyl-sort-type')
const savedVinylSortOrder = localStorage.getItem('vinyl-sort-order')

const vinylFilterType = ref(savedVinylFilterType || 'all')
const vinylSortType = ref(savedVinylSortType || 'title')
const vinylSortOrder = ref(savedVinylSortOrder || 'asc')

const pagedNews = computed(() => {
  const start = newsPage.value * 5
  return news.value.slice(start, start + 5)
})

const getVinylSortButtonText = computed(() => {
  if (vinylSortType.value === 'title' || vinylSortType.value === 'artist') return vinylSortOrder.value === 'asc' ? 'А-Я' : 'Я-А'
  return vinylSortOrder.value === 'asc' ? 'Сначала больше' : 'Сначала меньше'
})

const bundlePromotion = computed(() => cartStore.getBundlePromotion())
const cashbackPromotion = computed(() => cartStore.getCashbackPromotion())
const getDiscountedPrice = (v) => cartStore.getDiscountedPrice(v)
const getDiscountPercent = (v) => cartStore.getDiscountPercent(v)
const isVinylInCart = (id) => cartStore.isVinylInCart(id)
const isVinylFavorite = (id) => favoritesStore.isFavorite(id)

const filteredAndSortedVinyls = computed(() => {
  let filtered = vinyls.value
  if (vinylFilterType.value !== 'all' && vinylFilterType.value !== 'inStock') filtered = filtered.filter(v => v.type === vinylFilterType.value)
  if (vinylFilterType.value === 'inStock') filtered = filtered.filter(v => v.stock > 0)
  if (!filtered.length) return []
  return [...filtered].sort((a, b) => {
    let c = 0
    if (vinylSortType.value === 'price') c = (Number(b.price)||0) - (Number(a.price)||0)
    else if (vinylSortType.value === 'stock') c = (b.stock||0) - (a.stock||0)
    else if (vinylSortType.value === 'orders_count') c = (b.orders_count||0) - (a.orders_count||0)
    else { const av = (a[vinylSortType.value]||'').toString().toLowerCase(); const bv = (b[vinylSortType.value]||'').toString().toLowerCase(); c = av < bv ? -1 : av > bv ? 1 : 0 }
    return vinylSortOrder.value === 'asc' ? c : -c
  })
})

// Функция для получения счётчика заказов
const getOrdersCount = (id) => {
  return ordersCountMap[id] || 0
}

// Функция проверки, в корзине ли услуга
const isServiceInCart = (id) => {
  return cartStore.isServiceInCart(id)
}

// Загрузка счётчиков заказов из localStorage
const loadOrdersCounts = () => {
  const saved = localStorage.getItem('orders-counts')
  if (saved) {
    try {
      const counts = JSON.parse(saved)
      Object.keys(ordersCountMap).forEach(key => delete ordersCountMap[key])
      Object.entries(counts).forEach(([key, value]) => {
        ordersCountMap[key] = value
      })
    } catch (e) {
      console.error('Ошибка загрузки orders-counts:', e)
    }
  }
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

const isNewsFavorite = (newsId) => {
  return favoriteNewsIds.value.has(newsId)
}

const loadFavoriteNews = async () => {
  if (!isAuthenticated.value || !currentUser.value?.id) return
  try {
    const response = await fetch(`/api/favorite-news/${currentUser.value.id}`)
    if (response.ok) {
      const favs = await response.json()
      favoriteNewsIds.value = new Set(favs.map(f => f.id))
    }
  } catch (error) {
    console.error('Ошибка загрузки избранных новостей:', error)
  }
}

const requireAuth = (message = 'Войдите в аккаунт, чтобы совершить это действие') => {
  alert(message)
  router.push('/login')
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

const toggleFavorite = async (id) => {
  if (!isAuthenticated.value) {
    alert('Войдите в аккаунт, чтобы добавить виниловую пластинку в избранное')
    router.push('/login')
    return
  }
  await favoritesStore.toggleFavorite(id)
}

const toggleNewsFavorite = async (newsId) => {
  if (!isAuthenticated.value) {
    alert('Войдите в аккаунт, чтобы добавить новость в избранное')
    router.push('/login')
    return
  }
  
  try {
    if (favoriteNewsIds.value.has(newsId)) {
      const response = await fetch('/api/favorite-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId })
      })
      if (response.ok) {
        favoriteNewsIds.value.delete(newsId)
      }
    } else {
      const response = await fetch('/api/favorite-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId })
      })
      if (response.ok) {
        favoriteNewsIds.value.add(newsId)
      }
    }
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

const addToCart = (v) => { cartStore.addVinyl({ id: v.id, title: v.title, artist: v.artist, price: v.price, image: v.image, type: v.type, stock: v.stock }); alert(`"${v.title}" добавлена в корзину!`) }
const addServiceToCart = (s) => { cartStore.addService(s); alert(`"${s.name}" добавлен в корзину!`) }
const addArtistToCart = (a) => { cartStore.addService(a); alert(`"${a.name}" добавлен в корзину!`) }

const goToVinylDetail = (id) => router.push(`/vinyl/${id}`)
const goToNewsDetail = async (id) => {
  try {
    await fetch(`/api/news/${id}/view`, { method: 'POST' })
    const newsItem = news.value.find(n => n.id === id)
    if (newsItem) newsItem.views = (newsItem.views || 0) + 1
  } catch (e) { console.error('Ошибка увеличения просмотров:', e) }
  router.push(`/news/${id}`)
}
const goToServiceDetail = (id) => router.push(`/service/${id}`)

const saveVinylSettings = () => {
  localStorage.setItem('vinyl-filter-type', vinylFilterType.value)
  localStorage.setItem('vinyl-sort-type', vinylSortType.value)
  localStorage.setItem('vinyl-sort-order', vinylSortOrder.value)
}
const toggleVinylSortOrder = () => { vinylSortOrder.value = vinylSortOrder.value === 'asc' ? 'desc' : 'asc' }

const handleNewsImageError = (e) => { e.target.src = '/img/placeholder-news.jpg' }
const handleArtistImageError = (e) => { e.target.parentElement.innerHTML = '<span class="text-3xl">🎤</span>' }
const handlePromoImageError = (e) => { e.target.style.display = 'none' }

const getPromotionIcon = (t) => ({ discount: '🏷️', bundle: '🎁', cashback: '💰' }[t] || '🎉')
const getPromotionTypeName = (t) => ({ discount: 'Скидка', bundle: 'Выгодное предложение', cashback: 'Кэшбэк' }[t] || 'Акция')
const getPromotionBadgeClass = (t) => {
  if (t === 'discount') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  if (t === 'bundle') return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
}
const getPromotionDetails = (p) => {
  if (p.type === 'discount') return p.discount_type === 'percentage' ? `Скидка ${p.discount_value}%` : `Скидка ${p.discount_value} ₽`
  if (p.type === 'bundle') return `Купи ${p.buy_quantity}, получи ${p.get_quantity} бесплатно!`
  return `Кэшбэк ${p.cashback_percent}%`
}

// Загрузка заказов из API (СИНХРОНИЗИРОВАНО С SERVICESDETAILVIEW)
const fetchOrders = async () => {
  try {
    const response = await fetch('/api/orders')
    if (response.ok) {
      const data = await response.json()
      
      // Парсим заказы и заполняем ordersCountMap
      data.forEach((order) => {
        if (order.items_json) {
          try {
            const items = typeof order.items_json === 'string' 
              ? JSON.parse(order.items_json) 
              : order.items_json
            
            if (Array.isArray(items)) {
              items.forEach(item => {
                if (!item.id) return
                ordersCountMap[item.id] = (ordersCountMap[item.id] || 0) + 1
              })
            }
          } catch (e) {
            console.error('Ошибка парсинга items_json:', e)
          }
        }
      })
    }
  } catch (err) {
    console.error('Ошибка загрузки заказов:', err)
  }
}

const fetchVinyls = async () => { try { const r = await fetch('/api/vinyls'); if (r.ok) vinyls.value = await r.json() } catch(e) { console.error(e) } }
const fetchNews = async () => { try { const r = await fetch('/api/news'); if (r.ok) news.value = await r.json() } catch(e) { console.error(e) } }
const fetchServices = async () => { try { const r = await fetch('/api/services'); if (r.ok) allServices.value = await r.json() } catch(e) { console.error(e) } }
const fetchArtists = async () => { try { const r = await fetch('/api/artists'); if (r.ok) artists.value = await r.json() } catch(e) { console.error(e) } }
const fetchPromotions = async () => { try { const r = await fetch('/api/promotions/active'); if (r.ok) activePromotions.value = await r.json() } catch(e) { console.error(e) } }

onMounted(async () => {
  loading.value = true
  
  loadLikesFromStorage()
  loadOrdersCounts()
  
  if (route.query.tab) {
    const validTabs = ['vinyls', 'news', 'services', 'promotions']
    if (validTabs.includes(route.query.tab)) activeContentTab.value = route.query.tab
  }
  
  await Promise.all([fetchVinyls(), fetchNews(), fetchServices(), fetchArtists(), fetchPromotions(), fetchOrders()])
  await cartStore.loadPromotions()
  await favoritesStore.loadFavorites()
  await loadFavoriteNews()
  loading.value = false
})
</script>

<style scoped>
.line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
</style>