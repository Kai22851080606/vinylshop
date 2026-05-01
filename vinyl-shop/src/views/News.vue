<!-- src/views/News.vue -->
<template>
  <main class="py-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold dark:text-white mb-4">
        Музыкальные новости 🎵
      </h1>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Все свежие новости из мира музыки: релизы, концерты, события
      </p>
    </div>

    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
      <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка новостей...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500 dark:text-red-400">{{ error }}</p>
      <button @click="fetchNews" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Попробовать снова</button>
    </div>

    <div v-else-if="news.length > 0" class="flex flex-col items-center px-4">
      <div 
        v-for="item in news" 
        :key="item.id"
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full max-w-3xl mx-auto mb-8 cursor-pointer"
        @click="goToNewsDetail(item.id)"
      >
        <!-- Картинка -->
        <div class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border-b border-gray-200 dark:border-gray-700">
          <img 
            v-if="item.image" 
            :src="item.image" 
            :alt="item.title"
            class="w-full h-full object-cover"
            @error="handleImageError(item)"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-4xl">🎵</span>
          </div>
        </div>

        <!-- Контент -->
        <div class="p-8 flex flex-col flex-grow">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
              <span>{{ item.date }}</span>
              <span>•</span>
              <span>{{ item.category }}</span>
            </div>
            
            <!-- Кнопка избранного -->
            <button 
              v-if="showFavoriteButton"
              @click.stop="handleToggleFavorite(item.id)"
              class="p-1 rounded-full transition-colors"
              :class="isFavoriteLocal(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
              :title="isFavoriteLocal(item.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
            >
              <span class="text-xl">{{ isFavoriteLocal(item.id) ? '❤️' : '🤍' }}</span>
            </button>
          </div>

          <h3 class="text-2xl font-bold dark:text-white mb-4">{{ item.title }}</h3>
          
          <!-- Неполный текст (обрезанный) -->
          <div class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            <p class="line-clamp-3">{{ item.content || item.title }}</p>
            <div class="flex flex-wrap gap-3 mt-3">
              <button 
                v-if="detectLanguage(item.title || item.content) !== 'ru'"
                @click.stop="translateNews(item)"
                :disabled="translating[item.id]"
                class="text-green-600 dark:text-green-400 text-sm hover:underline flex items-center gap-1"
              >
                <span>🌐</span>
                {{ translating[item.id] ? 'Перевод...' : (isTranslated[item.id] ? 'Оригинал' : 'Перевести на русский') }}
              </button>
            </div>
          </div>

          <!-- Кнопка "Читать далее" (есть ссылка) -->
          <div class="mt-6" v-if="item.external_url">
            <a 
              :href="item.external_url" 
              target="_blank"
              @click.stop
              class="text-blue-600 dark:text-blue-400 font-bold hover:gap-3 flex items-center gap-2 transition-all group text-lg"
            >
              <span>Читать на источнике</span>
              <span class="text-xl transition-transform duration-300">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Новости пока отсутствуют</p>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '../api/auth'

const router = useRouter()
const news = ref([])
const loading = ref(true)
const error = ref(null)
const favoriteNews = ref([])
const isTranslated = ref({})
const translatedTexts = ref({})
const translating = ref({})

const isAuthenticated = computed(() => !!authApi.getCurrentUser())
const currentUser = computed(() => authApi.getCurrentUser())
const showFavoriteButton = computed(() => isAuthenticated.value)

// Переход на детальную страницу новости
const goToNewsDetail = (id) => {
  router.push(`/news/${id}`)
}

// Функция определения языка текста
const detectLanguage = (text) => {
  if (!text) return 'ru'
  const cyrillicPattern = /[а-яё]/i
  return cyrillicPattern.test(text) ? 'ru' : 'en'
}

// Функция перевода текста
const translateNews = async (item) => {
  if (isTranslated.value[item.id]) {
    isTranslated.value[item.id] = false
    return
  }
  
  translating.value[item.id] = true
  
  try {
    const textToTranslate = item.content || item.title || ''
    if (!textToTranslate) {
      alert('Нет текста для перевода')
      translating.value[item.id] = false
      return
    }
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|ru`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.responseData && data.responseData.translatedText) {
        translatedTexts.value[item.id] = data.responseData.translatedText
        isTranslated.value[item.id] = true
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
    translating.value[item.id] = false
  }
}

const handleImageError = (item) => {
  item.image = null
}

const isFavoriteLocal = (newsId) => {
  return favoriteNews.value.some(f => f.id === newsId)
}

const fetchNews = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch('/api/news')
    if (!response.ok) throw new Error('Ошибка загрузки новостей')
    news.value = await response.json()
  } catch (err) {
    console.error('Ошибка:', err)
    error.value = 'Не удалось загрузить новости'
  } finally {
    loading.value = false
  }
}

const loadFavoriteNews = async () => {
  if (!currentUser.value?.id) return
  try {
    const response = await fetch(`/api/favorite-news/${currentUser.value.id}`)
    if (response.ok) {
      favoriteNews.value = await response.json()
    }
  } catch (error) {
    console.error('Ошибка загрузки избранных новостей:', error)
  }
}

const handleToggleFavorite = async (newsId) => {
  if (!currentUser.value?.id) {
    alert('Войдите в аккаунт, чтобы добавлять в избранное')
    return
  }
  
  const fav = isFavoriteLocal(newsId)
  
  try {
    if (fav) {
      const response = await fetch('/api/favorite-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId })
      })
      if (response.ok) {
        favoriteNews.value = favoriteNews.value.filter(f => f.id !== newsId)
      }
    } else {
      const response = await fetch('/api/favorite-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId })
      })
      if (response.ok) {
        const addedNews = news.value.find(n => n.id === newsId)
        if (addedNews) {
          favoriteNews.value.push(addedNews)
        }
      }
    }
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

onMounted(async () => {
  await fetchNews()
  if (isAuthenticated.value) {
    await loadFavoriteNews()
  }
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