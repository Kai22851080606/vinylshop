<!-- src/views/ProfileView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold dark:text-white text-center mb-8">
        Личный кабинет 👤
      </h1>
      
      <div v-if="user" class="space-y-6">
        
        <!-- Информация о пользователе -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8">
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="relative">
              <div class="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img v-if="avatarPreview || user.avatar" :src="avatarPreview || user.avatar" class="w-full h-full object-cover" alt="Avatar">
                <span v-else class="text-5xl">{{ user.role === 'admin' ? '👑' : '👤' }}</span>
              </div>
              <label class="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors border-2 border-white">
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange">
                <span class="text-sm">✏️</span>
              </label>
            </div>
            
            <div class="text-center md:text-left">
              <h2 class="text-2xl font-bold dark:text-white">
                {{ user.last_name || '' }} {{ user.first_name || '' }} {{ user.middle_name || '' }}
              </h2>
              <p class="text-lg text-blue-600 dark:text-blue-400 mt-1">@{{ user.nickname || user.username }}</p>
              <p class="text-gray-500 dark:text-gray-400 mt-1">{{ user.email }}</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Логин: {{ user.username }}</p>
              <span v-if="user.role === 'admin'" class="inline-block mt-2 text-sm bg-blue-600 text-white px-3 py-1 rounded-full">Администратор</span>
            </div>
          </div>
        </div>

        <!-- Редактирование профиля -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
          <h3 class="text-xl font-bold dark:text-white mb-4">Редактирование профиля</h3>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Фамилия</label>
              <input v-model="lastName" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя</label>
              <input v-model="firstName" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Отчество</label>
              <input v-model="middleName" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Никнейм</label>
              <input v-model="nickname" type="text" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата рождения</label>
              <input v-model="birthDate" type="date" :min="minDate" :max="maxDate" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">От 1940 года до сегодняшнего дня</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пол</label>
              <select v-model="gender" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                <option value="">Не указан</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
                <option value="other">Другой</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">О себе</label>
              <textarea v-model="bio" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"></textarea>
            </div>
          </div>
          
          <button @click="saveProfile" :disabled="saving" class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50">
            {{ saving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
          <p v-if="saveStatus" class="mt-2 text-sm" :class="saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'">{{ saveStatus.message }}</p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          
          <!-- Предыдущие сеансы -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">Предыдущие сеансы</h3>
            <div v-if="recentSessions.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              Нет данных о сеансах
            </div>
            <div v-else class="space-y-2">
              <div 
                v-for="(session, index) in recentSessions.slice(0, 3)" 
                :key="session.id" 
                class="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatLocalTime(session.created_at) }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ session.device_info || 'Неизвестное устройство' }}</p>
                </div>
                <span 
                  class="text-xs px-2 py-1 rounded-full"
                  :class="index === 0 ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500'"
                >
                  {{ index === 0 ? 'Активен' : 'Неактивен' }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Моя корзина -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">Моя корзина 🛒</h3>
            <div class="space-y-2 mb-4">
              <p class="text-gray-500 dark:text-gray-400">Пластинок: <span class="font-bold text-blue-600 dark:text-blue-400">{{ cartStore.totalVinyls }}</span></p>
              <p class="text-gray-500 dark:text-gray-400">Услуг: <span class="font-bold text-blue-600 dark:text-blue-400">{{ cartStore.totalServices }}</span></p>
            </div>
            <router-link to="/cart" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold w-full text-center transition-colors">Перейти в корзину</router-link>
          </div>

          <!-- Текущий заказ -->
          <div v-if="currentOrder" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-black p-6">
            <h3 class="text-lg font-bold dark:text-white mb-4 flex items-center gap-2">
              <span class="text-yellow-600">🕐</span> Текущий заказ
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Заказ #{{ currentOrder.id }} от {{ formatDate(currentOrder.created_at) }}</p>
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3">Сумма: <span class="font-bold text-blue-600 dark:text-blue-400">{{ currentOrder.total_price }} ₽</span></p>
            <router-link to="/my-orders" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold w-full text-center transition-colors">Перейти к заказу →</router-link>
          </div>

          <!-- ИЗБРАННЫЕ ПЛАСТИНКИ (С АКЦИЯМИ) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold dark:text-white">Избранные пластинки ❤️</h3>
              <router-link to="/favorites" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">Все →</router-link>
            </div>
            <div v-if="favoritesStore.totalFavorites === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              У вас пока нет избранных пластинок
            </div>
            <div v-else class="space-y-3">
              <div v-for="vinyl in favoritesStore.favorites.slice(0, 3)" :key="vinyl.id" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div class="w-12 h-12 rounded bg-gray-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                  <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover">
                  <span v-else class="text-xl">💿</span>
                </div>
                <div class="flex-1">
                  <router-link :to="`/vinyl/${vinyl.id}`" class="font-medium text-gray-900 dark:text-white hover:text-blue-600">
                    {{ vinyl.title }}
                  </router-link>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ vinyl.artist }}</p>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span v-if="getDiscountPercent(vinyl) && getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      🏷️ -{{ getDiscountPercent(vinyl) }}%
                    </span>
                    <span v-if="cashbackPromotion && cashbackPromotion.cashback_percent > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                      💰 +{{ cashbackPromotion.cashback_percent }}%
                    </span>
                    <span v-if="bundlePromotion && bundlePromotion.buy_quantity > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">
                      🎁 {{ bundlePromotion.buy_quantity }}+{{ bundlePromotion.get_quantity }}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <div>
                    <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {{ getDiscountedPrice(vinyl) }} ₽
                    </span>
                    <span v-else class="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {{ vinyl.price }} ₽
                    </span>
                    <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-gray-500 line-through ml-1">
                      {{ vinyl.price }} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p v-if="favoritesStore.totalFavorites > 3" class="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
              и ещё {{ favoritesStore.totalFavorites - 3 }} пластинок
            </p>
          </div>

          <!-- ИЗБРАННЫЕ НОВОСТИ -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold dark:text-white">Избранные новости 📰</h3>
              <router-link to="/favorite-news" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">Все →</router-link>
            </div>
            <div v-if="favoriteNewsList.length === 0" class="text-gray-500 dark:text-gray-400 text-center py-4">
              У вас пока нет избранных новостей
            </div>
            <div v-else class="space-y-3">
              <div v-for="news in favoriteNewsList.slice(0, 3)" :key="news.id" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div class="w-12 h-12 rounded bg-gray-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden">
                  <img v-if="news.image" :src="news.image" class="w-full h-full object-cover">
                  <span v-else class="text-xl">📰</span>
                </div>
                <div class="flex-1">
                  <router-link :to="`/news/${news.id}`" class="font-medium text-gray-900 dark:text-white hover:text-blue-600">
                    {{ news.title }}
                  </router-link>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ news.date }}</p>
                </div>
                <button @click="toggleNewsFavorite(news.id)" class="text-red-500 text-xl hover:scale-110 transition-transform" title="Удалить из избранного">❤️</button>
              </div>
            </div>
          </div>

          <!-- Мои заказы -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">Мои заказы 📦</h3>
            <p class="text-gray-500 dark:text-gray-400 mb-2">Всего заказов: <span class="font-bold text-blue-600 dark:text-blue-400">{{ ordersCount }}</span></p>
            <p class="text-sm text-gray-400 dark:text-gray-500 mb-4">Последний заказ: {{ lastOrderDate || '—' }}</p>
            <router-link to="/my-orders" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold w-full text-center transition-colors">История заказов</router-link>
          </div>

          <!-- Последние просмотры (объединённые) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-6">
            <h3 class="text-lg font-bold dark:text-white mb-4">Последние просмотры 👁️</h3>
            <div v-if="recentViewsList.length === 0" class="text-center py-4">
              <p class="text-gray-400 dark:text-gray-500 text-sm">Вы ещё ничего не просматривали</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="item in recentViewsList.slice(0, 3)" :key="item.id" class="flex items-center gap-2 p-2 hover:bg-blue-300 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                <div class="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                  <img v-if="item.image" :src="item.image" class="w-full h-full object-cover">
                  <span v-else-if="item.type === 'vinyl'" class="text-lg">💿</span>
                  <span v-else-if="item.type === 'news'" class="text-lg">📰</span>
                  <span v-else-if="item.type === 'service'" class="text-lg">🎤</span>
                </div>
                <div class="flex-1 min-w-0">
                  <router-link 
                    :to="getLink(item)"
                    class="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate block"
                  >
                    {{ item.title }}
                  </router-link>
                  <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {{ getTypeLabel(item.type) }} • {{ formatViewDateTime(item.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="user.role === 'admin'" class="mt-8 text-center">
          <router-link to="/admin" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold inline-block transition-colors">👑 Перейти в админ-панель</router-link>
        </div>

        <div class="mt-8 text-center">
          <button @click="logout" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors">Выйти из профиля</button>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-4">Вы не авторизованы</p>
        <router-link to="/login" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold inline-block transition-colors">Войти</router-link>
      </div>
    </div>

    <!-- Форма заказа -->
    <OrderForm 
      v-if="showOrderForm"
      :items="[selectedVinyl]"
      :is-vinyl="true"
      @close="showOrderForm = false"
      @submit="handleOrderSubmit"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'
import { profileApi } from '../api/profile'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import OrderForm from '../components/OrderForm.vue'

const router = useRouter()
const { user, updateAuth } = inject('auth')
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

// Данные профиля
const firstName = ref('')
const lastName = ref('')
const middleName = ref('')
const nickname = ref('')
const birthDate = ref('')
const gender = ref('')
const bio = ref('')
const avatarPreview = ref(null)
const saving = ref(false)
const saveStatus = ref(null)

// Данные для статистики
const ordersCount = ref(0)
const lastOrderDate = ref('')
const currentOrder = ref(null)
const recentViewsList = ref([])
const recentSessions = ref([])
const favoriteNewsList = ref([])

// Для формы заказа
const showOrderForm = ref(false)
const selectedVinyl = ref(null)

// Акции
const bundlePromotion = computed(() => cartStore.getBundlePromotion())
const cashbackPromotion = computed(() => cartStore.getCashbackPromotion())

// Функции для работы с акциями
const getDiscountedPrice = (vinyl) => {
  return cartStore.getDiscountedPrice(vinyl)
}

const getDiscountPercent = (vinyl) => {
  return cartStore.getDiscountPercent(vinyl)
}

// Минимальная и максимальная дата
const minDate = computed(() => '1940-01-01')
const maxDate = computed(() => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
})

// Форматирование даты для заказов (полная дата и время)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Функция перевода времени в локальный часовой пояс пользователя
const formatLocalTime = (dateString) => {
  if (!dateString) return '—';
  try {
    let iso = dateString.replace(' ', 'T');
    if (!iso.includes('Z') && !iso.includes('+')) iso += 'Z';
    
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'Ошибка даты';

    return new Intl.DateTimeFormat('default', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return 'Ошибка';
  }
};

// Форматирование даты и времени просмотра
const formatViewDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Получение ссылки для элемента просмотра
const getLink = (item) => {
  if (item.type === 'vinyl') return `/vinyl/${item.id}`
  if (item.type === 'news') return `/news/${item.id}`
  if (item.type === 'service') return `/services?artist=${item.id}`
  return '#'
}

// Получение метки типа
const getTypeLabel = (type) => {
  if (type === 'vinyl') return 'Пластинка'
  if (type === 'news') return 'Новость'
  if (type === 'service') return 'Артист'
  return ''
}

// Загрузка заказов
const loadOrders = async () => {
  if (!user.value?.email) return
  try {
    const response = await fetch(`/api/orders/user/${encodeURIComponent(user.value.email)}`)
    if (response.ok) {
      const orders = await response.json()
      ordersCount.value = orders.length
      if (orders.length > 0) {
        const lastOrder = orders[0]
        lastOrderDate.value = formatDate(lastOrder.created_at)
        const daysSince = (Date.now() - new Date(lastOrder.created_at)) / (1000 * 60 * 60 * 24)
        if (daysSince < 7) currentOrder.value = lastOrder
      }
    }
  } catch (error) { console.error('Ошибка загрузки заказов:', error) }
}

// Загрузка избранных новостей
const loadFavoriteNews = async () => {
  if (!user.value?.id) return
  try {
    const response = await fetch(`/api/favorite-news/${user.value.id}`)
    if (response.ok) favoriteNewsList.value = await response.json()
  } catch (error) { console.error('Ошибка загрузки избранных новостей:', error) }
}

// Добавление/удаление новости из избранного
const toggleNewsFavorite = async (newsId) => {
  if (!user.value?.id) {
    alert('Войдите в аккаунт')
    return
  }
  
  const isFavorite = favoriteNewsList.value.some(n => n.id === newsId)
  
  try {
    if (isFavorite) {
      const response = await fetch('/api/favorite-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.value.id, newsId })
      })
      if (response.ok) {
        favoriteNewsList.value = favoriteNewsList.value.filter(n => n.id !== newsId)
      }
    } else {
      const response = await fetch('/api/favorite-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.value.id, newsId })
      })
      if (response.ok) {
        await loadFavoriteNews()
      }
    }
  } catch (error) { console.error('Ошибка:', error) }
}

// Загрузка последних просмотров (объединённых)
const loadRecentViews = () => {
  const saved = localStorage.getItem('recent-views')
  if (saved) {
    try { 
      const parsed = JSON.parse(saved)
      // Сортируем по времени (новые сверху)
      recentViewsList.value = parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    } catch { 
      recentViewsList.value = [] 
    }
  } else {
    recentViewsList.value = []
  }
}

// Загрузка сеансов
const loadRecentSessions = async () => {
  if (!user.value?.id) return
  try {
    const response = await fetch(`/api/user-sessions/${user.value.id}`)
    if (response.ok) {
      const allSessions = await response.json()
      const sortedSessions = allSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      recentSessions.value = sortedSessions.slice(0, 3)
    } else {
      recentSessions.value = []
    }
  } catch (error) { 
    console.error('Ошибка загрузки сеансов:', error)
    recentSessions.value = []
  }
}

// Загрузка данных пользователя
onMounted(async () => {
  if (user.value?.id) {
    const userData = await profileApi.getUser(user.value.id)
    if (userData) {
      firstName.value = userData.first_name || ''
      lastName.value = userData.last_name || ''
      middleName.value = userData.middle_name || ''
      nickname.value = userData.nickname || user.value.username
      birthDate.value = userData.birth_date || ''
      gender.value = userData.gender || ''
      bio.value = userData.bio || ''
    }
    await loadOrders()
    await loadFavoriteNews()
    await favoritesStore.loadFavorites()
    await cartStore.loadPromotions()
    loadRecentViews()
    await loadRecentSessions()
  }
})

// Смена аватара
const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file && file.size <= 2 * 1024 * 1024) {
    const reader = new FileReader()
    reader.onload = (e) => { avatarPreview.value = e.target.result }
    reader.readAsDataURL(file)
  } else if (file) alert('Файл не должен превышать 2MB')
}

// Сохранение профиля
const saveProfile = async () => {
  saving.value = true
  const result = await profileApi.updateProfile(user.value.id, {
    first_name: firstName.value, last_name: lastName.value, middle_name: middleName.value,
    nickname: nickname.value, birth_date: birthDate.value, gender: gender.value,
    bio: bio.value, avatar: avatarPreview.value || user.value.avatar
  })
  saving.value = false
  if (result.success) {
    const updatedUser = { ...user.value, ...result.user, first_name: firstName.value, last_name: lastName.value, middle_name: middleName.value, nickname: nickname.value, birth_date: birthDate.value, gender: gender.value }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    updateAuth()
    saveStatus.value = { type: 'success', message: 'Изменения сохранены!' }
    setTimeout(() => { saveStatus.value = null }, 3000)
  } else {
    saveStatus.value = { type: 'error', message: result.message || 'Ошибка при сохранении' }
  }
}

const logout = () => {
  authApi.logout()
  updateAuth()
  router.push('/')
}

const handleOrderSubmit = () => {
  showOrderForm.value = false
}
</script>