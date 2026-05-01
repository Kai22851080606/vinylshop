<!-- src/components/Header.vue -->
<template>
  <header class="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
    <div class="container mx-auto px-4 h-20 flex items-center justify-between">
      
      <!-- Название с логотипом как часть текста -->
      <router-link to="/" class="flex items-center gap-2 decoration-0 group">
        <span class="text-2xl font-bold dark:text-white inline-flex items-center">
          <span class="group-hover:text-blue-500 transition-colors">vinyl-shop</span>
          <div class="relative inline-block mx-0.5">
            <img 
              src="/logo.png" 
              alt=""
              class="relative w-18 h-18 object-contain inline-block align-middle rounded-full"
              @error="handleImageError"
            >
          </div>
          <span class="group-hover:text-blue-500 transition-colors"></span>
        </span>
      </router-link>

      <nav class="hidden lg:flex items-center gap-6 text-sm font-medium dark:text-gray-200">
        <router-link to="/about" class="hover:text-blue-500">О нас</router-link>
        <router-link to="/promotions" class="hover:text-blue-500">Акции</router-link>
        <a href="/#contacts" @click.prevent="scrollToContacts" class="hover:text-blue-500 cursor-pointer">Контакты</a>
      </nav>

      <div class="flex items-center gap-4">
        <!-- Поле поиска -->
        <div class="relative">
          <input 
            ref="searchInput"
            v-model="searchQuery"
            type="text"
            placeholder="Поиск пластинок, новостей, услуг"
            class="w-80 px-4 py-2 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            @input="searchAll"
            @keyup.enter="handleEnter"
            @focus="onSearchFocus"
            @blur="hideResultsWithDelay"
          >

          <!-- Выпадающий список результатов -->
          <div 
            v-if="showResults && searchQuery"
            class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50"
            @mousedown.prevent
          >
            <div v-if="isLoading" class="p-8 text-center text-gray-500 dark:text-gray-400">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
              <p class="mt-2">Загрузка...</p>
            </div>
            <template v-else-if="vinylResults.length > 0 || newsResults.length > 0 || servicesResults.length > 0 || artistsResults.length > 0">
              
              <!-- Группа: Пластинки -->
              <div v-if="vinylResults.length > 0" class="border-b border-gray-200 dark:border-gray-700">
                <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 flex justify-between items-center">
                  <span>💿 Пластинки ({{ vinylResults.length }})</span>
                  <button 
                    v-if="vinylResults.length === 1"
                    @click="goToVinyl(vinylResults[0].id)"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Перейти к пластинке →
                  </button>
                  <button 
                    v-else
                    @click="goToVinylSearchResults"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Показать все пластинки ({{ vinylResults.length }}) →
                  </button>
                </div>
                <div 
                  v-for="vinyl in vinylResults.slice(0, 3)" 
                  :key="`vinyl-${vinyl.id}`"
                  @click="goToVinyl(vinyl.id)"
                  class="flex items-center gap-3 p-3 hover:bg-blue-300 dark:hover:bg-slate-600 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                >
                  <div class="w-10 h-10 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="">
                    <span v-else class="text-xl">💿</span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate" v-html="highlightText(vinyl.title, searchQuery)"></p>
                    <p class="text-sm text-gray-500 dark:text-gray-300 truncate" v-html="highlightText(vinyl.artist, searchQuery)"></p>
                  </div>
                  
                  <div class="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {{ vinyl.price }} ₽
                  </div>
                </div>
              </div>

              <!-- Группа: Новости -->
              <div v-if="newsResults.length > 0" class="border-b border-gray-200 dark:border-gray-700">
                <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 flex justify-between items-center">
                  <span>📰 Новости ({{ newsResults.length }})</span>
                  <button 
                    v-if="newsResults.length === 1"
                    @click="goToNews(newsResults[0].id)"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Перейти к новости →
                  </button>
                  <button 
                    v-else
                    @click="goToAllNewsResults"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Показать все новости ({{ newsResults.length }}) →
                  </button>
                </div>
                <div 
                  v-for="news in newsResults.slice(0, 3)" 
                  :key="`news-${news.id}`"
                  @click="goToNews(news.id)"
                  class="flex items-center gap-3 p-3 hover:bg-blue-300 dark:hover:bg-slate-600 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                >
                  <div class="w-10 h-10 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="news.image" :src="news.image" class="w-full h-full object-cover" alt="">
                    <span v-else class="text-xl">📰</span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate" v-html="highlightText(news.title, searchQuery)"></p>
                    <p class="text-sm text-gray-500 dark:text-gray-300 truncate">
                      {{ news.category }} • {{ news.date }}
                    </p>
                  </div>
                  
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ news.category }}
                  </div>
                </div>
              </div>

              <!-- Группа: Артисты -->
              <div v-if="artistsResults.length > 0" class="border-b border-gray-200 dark:border-gray-700">
                <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 flex justify-between items-center">
                  <span>🎤 Артисты ({{ artistsResults.length }})</span>
                  <button 
                    v-if="artistsResults.length === 1"
                    @click="goToArtist(artistsResults[0].id)"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Перейти к артисту →
                  </button>
                  <button 
                    v-else
                    @click="goToArtistsSearchResults"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Показать всех артистов ({{ artistsResults.length }}) →
                  </button>
                </div>
                <div 
                  v-for="artist in artistsResults.slice(0, 3)" 
                  :key="`artist-${artist.id}`"
                  @click="goToArtist(artist.id)"
                  class="flex items-center gap-3 p-3 hover:bg-blue-300 dark:hover:bg-slate-600 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                >
                  <div class="w-10 h-10 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="artist.image" :src="artist.image" class="w-full h-full object-cover" alt="">
                    <span v-else class="text-xl">🎤</span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate" v-html="highlightText(artist.name, searchQuery)"></p>
                    <p class="text-sm text-gray-500 dark:text-gray-300 truncate">
                      {{ artist.description?.substring(0, 50) }}...
                    </p>
                  </div>
                  
                  <div class="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {{ Number(artist.price).toLocaleString() }} ₽
                  </div>
                </div>
              </div>

              <!-- Группа: Услуги -->
              <div v-if="servicesResults.length > 0">
                <div class="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 flex justify-between items-center">
                  <span>📋 Услуги ({{ servicesResults.length }})</span>
                  <button 
                    v-if="servicesResults.length === 1"
                    @click="goToService(servicesResults[0].id)"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Перейти к услуге →
                  </button>
                  <button 
                    v-else
                    @click="goToServicesSearchResults"
                    class="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
                  >
                    Показать все услуги ({{ servicesResults.length }}) →
                  </button>
                </div>
                <div 
                  v-for="service in servicesResults.slice(0, 3)" 
                  :key="`service-${service.id}`"
                  @click="goToService(service.id)"
                  class="flex items-center gap-3 p-3 hover:bg-blue-300 dark:hover:bg-slate-600 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors"
                >
                  <div class="w-10 h-10 rounded bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shrink-0">
                    <span class="text-xl">📋</span>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 dark:text-white truncate" v-html="highlightText(service.name, searchQuery)"></p>
                    <p class="text-sm text-gray-500 dark:text-gray-300 truncate">
                      {{ service.description?.substring(0, 50) }}...
                    </p>
                  </div>
                  
                  <div class="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {{ typeof service.price === 'number' ? service.price.toLocaleString() : service.price }} ₽
                  </div>
                </div>
              </div>
            </template>

            <div 
              v-else
              class="p-8 text-center text-gray-500 dark:text-gray-400"
            >
              😕 Ничего не найдено
            </div>
          </div>
        </div>

        <!-- Кнопка для слабовидящих -->
        <button 
          @click="toggleVision"
          class="px-3 py-2 text-sm font-bold rounded-lg transition-colors border"
          :class="[
            isVisionMode 
              ? 'bg-yellow-300 text-black border-black' 
              : 'bg-transparent text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700'
          ]"
          title="Режим для слабовидящих"
        >
          🔍
        </button>

        <!-- Если пользователь авторизован -->
        <template v-if="isAuthenticated">
          <router-link to="/profile" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
            <div class="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-gray-300 dark:border-gray-600">
              <img v-if="user?.avatar" :src="user.avatar" class="w-full h-full object-cover" alt="Avatar">
              <span v-else class="w-full h-full flex items-center justify-center text-lg">
                {{ user?.role === 'admin' ? '👑' : '👤' }}
              </span>
            </div>
            <span class="text-sm font-medium dark:text-white">{{ user?.username }}</span>
          </router-link>
          <button @click="logout" class="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 py-1 rounded transition-colors">
            Выйти
          </button>
        </template>

        <!-- Если не авторизован -->
        <template v-else>
          <div class="flex gap-2">
            <router-link to="/login" class="px-4 py-2 text-sm bg-transparent text-blue-600 font-bold hover:bg-blue-600 hover:text-white rounded-lg transition-colors">Войти</router-link>
            <router-link to="/register" class="px-4 py-2 text-sm bg-transparent text-black dark:text-white font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-lg transition-colors">Регистрация</router-link>
          </div>
        </template>

        <button @click="$emit('toggle-theme')" class="p-2 text-xl hover:scale-110 transition-transform">
          🌗
        </button>
      </div>
      
    </div>
  </header>
</template>

<script setup>
import { ref, inject, watch, onMounted, nextTick } from 'vue'
import { authApi } from '../api/auth'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const { isAuthenticated, user, updateAuth } = inject('auth')
const { isVisionMode, toggleVision } = inject('vision')

const searchQuery = ref('')
const vinylResults = ref([])
const newsResults = ref([])
const servicesResults = ref([])
const artistsResults = ref([])
const allVinyls = ref([])
const allNews = ref([])
const allServices = ref([])
const allArtists = ref([])
const showResults = ref(false)
const isLoading = ref(false)
const searchInput = ref(null)
let searchTimeout = null

// Функция для принудительного обновления компонента
const refreshComponent = () => {
  const currentPath = router.currentRoute.value.fullPath
  const [path, queryString] = currentPath.split('?')
  const params = new URLSearchParams(queryString || '')
  params.set('_refresh', Date.now().toString())
  const newPath = path + '?' + params.toString()
  router.replace(newPath)
}

// Функция для подсветки текста
const highlightText = (text, query) => {
  if (!query || !text) return text
  if (!text.includes(query)) return text
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>')
}

// Принудительная перезагрузка всех данных
const refreshData = async () => {
  isLoading.value = true
  try {
    const [vinylsRes, newsRes, servicesRes, artistsRes] = await Promise.all([
      fetch('http://localhost:3001/api/vinyls'),
      fetch('http://localhost:3001/api/news'),
      fetch('http://localhost:3001/api/services'),
      fetch('http://localhost:3001/api/artists')
    ])
    
    if (vinylsRes.ok) allVinyls.value = await vinylsRes.json()
    if (newsRes.ok) allNews.value = await newsRes.json()
    if (servicesRes.ok) allServices.value = await servicesRes.json()
    if (artistsRes.ok) allArtists.value = await artistsRes.json()
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
  } finally {
    isLoading.value = false
  }
}

// Выполнение поиска
const performSearch = (query) => {
  if (!query || !query.trim()) {
    vinylResults.value = []
    newsResults.value = []
    servicesResults.value = []
    artistsResults.value = []
    return
  }
  
  vinylResults.value = allVinyls.value.filter(vinyl => 
    vinyl.title.includes(query) || 
    vinyl.artist.includes(query)
  )
  
  newsResults.value = allNews.value.filter(news => 
    news.title.includes(query) || 
    news.content.includes(query)
  )
  
  servicesResults.value = allServices.value.filter(service => 
    service.name.includes(query)
  )
  
  artistsResults.value = allArtists.value.filter(artist => 
    artist.name.includes(query)
  )
}

// При фокусе на поле - обновляем данные
const onSearchFocus = async () => {
  await refreshData()
  showResults.value = true
  if (searchQuery.value) {
    performSearch(searchQuery.value)
  }
}

// Поиск с задержкой
const searchAll = async () => {
  if (!searchQuery.value.trim()) {
    vinylResults.value = []
    newsResults.value = []
    servicesResults.value = []
    artistsResults.value = []
    return
  }

  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await refreshData()
    performSearch(searchQuery.value)
  }, 300)
}

const hideResultsWithDelay = () => {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

// Переходы
const goToVinyl = (id) => {
  showResults.value = false
  router.push(`/vinyl/${id}`).then(() => {
    nextTick(() => refreshComponent())
  })
}

const goToNews = (id) => {
  showResults.value = false
  router.push(`/news/${id}`).then(() => {
    nextTick(() => refreshComponent())
  })
}

const goToService = (id) => {
  showResults.value = false
  router.push(`/service/${id}`).then(() => {
    nextTick(() => refreshComponent())
  })
}

const goToArtist = (id) => {
  showResults.value = false
  router.push(`/service/1?artist=${id}`).then(() => {
    nextTick(() => refreshComponent())
  })
}

const goToVinylSearchResults = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value
    showResults.value = false
    router.push({ path: `/vinyl/search`, query: { q: query } }).then(() => {
      nextTick(() => refreshComponent())
    })
  }
}

const goToAllNewsResults = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value
    showResults.value = false
    router.push({ path: '/news/search', query: { q: query } }).then(() => {
      nextTick(() => refreshComponent())
    })
  }
}

const goToServicesSearchResults = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value
    showResults.value = false
    router.push({ path: '/services', query: { search: query } }).then(() => {
      nextTick(() => refreshComponent())
    })
  }
}

const goToArtistsSearchResults = () => {
  if (searchQuery.value.trim()) {
    const query = searchQuery.value
    showResults.value = false
    router.push({ path: '/services', query: { search: query } }).then(() => {
      nextTick(() => refreshComponent())
    })
  }
}

const handleEnter = () => {
  if (!searchQuery.value.trim()) return
  const query = searchQuery.value
  showResults.value = false
  router.push({ path: '/', query: { search: query } }).then(() => {
    nextTick(() => refreshComponent())
  })
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
  if (e.target.parentElement) {
    e.target.parentElement.innerHTML = '<span class="text-xl font-bold">🎵</span>'
  }
}

// Скролл к контактам (подвалу)
const scrollToContacts = () => {
  if (route.path !== '/') {
    router.push('/#contacts')
    setTimeout(() => {
      const footer = document.querySelector('footer')
      if (footer) footer.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  } else {
    const footer = document.querySelector('footer')
    if (footer) footer.scrollIntoView({ behavior: 'smooth' })
  }
}

const logout = () => {
  authApi.logout()
  updateAuth()
  router.push('/')
}

onMounted(async () => {
  await refreshData()
  if (route.query.search) {
    searchQuery.value = route.query.search
    performSearch(route.query.search)
  }
})

watch(() => route.query.search, async (newSearch) => {
  if (newSearch) {
    searchQuery.value = newSearch
    await refreshData()
    performSearch(newSearch)
  }
})
</script>