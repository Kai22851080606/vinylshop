<!-- src/views/NewsDetailView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <div class="mb-6">
        <router-link 
          to="/catalog?tab=news"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray dark:text-gray hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад к новостям</span>
        </router-link>
      </div>

      <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">
        Результаты поиска новостей
      </h2>

      <template v-if="isSearchMode">
        <div class="mb-6">
          <div class="flex items-center justify-between flex-wrap gap-3 bg-blue-300 dark:bg-blue-900/20 p-4 rounded-lg">
            <p class="text-black dark:text-black">
              Найдено {{ filteredNews.length }} новостей по запросу "{{ searchQuery }}"
            </p>
            <router-link 
              to="/" 
              class="text-black dark:text-black hover:underline text-sm flex items-center gap-1"
            >
              <span>Сбросить поиск</span>
            </router-link>
          </div>
        </div>

        <div v-if="loadingNews" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка новостей...</p>
        </div>

        <div v-else-if="filteredNews.length > 0" class="flex flex-col items-center">
          <div 
            v-for="item in filteredNews" 
            :key="item.id"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full max-w-3xl mx-auto mb-8"
          >
            <div class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border-b border-black dark:border-white">
              <img 
                v-if="!imageError && item.image" 
                :src="item.image" 
                :alt="item.title"
                class="w-full h-full object-cover"
                @error="imageError = true"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-4xl">🎵</span>
              </div>
            </div>

            <div class="p-8 flex flex-col flex-grow">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>{{ item.date }}</span>
                  <span>•</span>
                  <span>{{ item.category }}</span>
                </div>
                
                <button 
                  @click="toggleFavoriteFromList(item.id)"
                  class="p-1 rounded-full transition-colors"
                  :class="isFavorite(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                  :title="isFavorite(item.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                >
                  <span class="text-xl">{{ isFavorite(item.id) ? '❤️' : '🤍' }}</span>
                </button>
              </div>

              <h3 class="text-2xl font-bold dark:text-white mb-4">{{ item.title }}</h3>
              
              <div class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                <p class="line-clamp-3">
                  {{ item.content }}
                </p>
              </div>

              <button 
                @click="goToNews(item.id)" 
                class="text-blue-600 dark:text-blue-400 font-bold hover:gap-3 flex items-center gap-2 transition-all self-start mt-6 group text-lg"
              >
                <span>Читать далее</span>
                <span class="text-xl transition-transform duration-300">→</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-4">Новости не найдены по запросу "{{ searchQuery }}"</p>
          <router-link to="/news" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold">Вернуться к новостям</router-link>
        </div>
      </template>

      <template v-else>
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка...</p>
        </div>

        <div v-else-if="singleNews" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden">
          <div class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600">
            <img v-if="singleNews.image" :src="singleNews.image" :alt="singleNews.title" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center"><span class="text-6xl">📰</span></div>
          </div>

          <div class="p-8">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{{ singleNews.date }}</span>
                <span>•</span>
                <span>{{ singleNews.category }}</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-1">
                  <div class="flex items-center gap-0.5">
                    <span v-for="star in 5" :key="star" class="text-lg">
                      {{ star <= newsRating ? '⭐' : '☆' }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 ml-1">({{ newsRating.toFixed(1) }}) • {{ ratingsCount }} оценок</span>
                </div>
                <button 
                  @click="toggleFavorite"
                  class="p-1 rounded-full transition-colors"
                  :class="isFavorite(singleNews.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                  :title="isFavorite(singleNews.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                >
                  <span class="text-xl">{{ isFavorite(singleNews.id) ? '❤️' : '🤍' }}</span>
                </button>
              </div>
            </div>
            
            <h1 class="text-3xl font-bold dark:text-white mb-6">{{ singleNews.title }}</h1>
            
            <div class="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-line">
              <span v-if="isTranslated && translatedText">{{ translatedText }}</span>
              <span v-else>{{ singleNews.content }}</span>
            </div>

            <div class="mt-8">
              <button 
                v-if="detectLanguage(singleNews.title || singleNews.content) !== 'ru'"
                @click="translateNews"
                :disabled="translating"
                class="flex items-center gap-2 px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <span>🌐</span>
                {{ translating ? 'Перевод...' : (isTranslated ? 'Оригинал' : 'Перевести на русский') }}
              </button>
            </div>

            <!-- Отзывы -->
            <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                      placeholder="Поделитесь впечатлениями о новости..."
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

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
          <p class="text-gray-500 dark:text-gray-400 mb-4">Новость не найдена</p>
          <router-link to="/news" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold">Вернуться к новостям</router-link>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '../api/auth'

const route = useRoute()
const router = useRouter()
const singleNews = ref(null)
const allNews = ref([])
const loading = ref(true)
const loadingNews = ref(true)
const favoriteNewsIds = ref(new Set())
const imageError = ref(false)
const reviews = ref([])
const submittingReview = ref(false)
const newReview = ref({ rating: 0, comment: '' })
const newsRating = ref(0)
const ratingsCount = ref(0)

const isTranslated = ref(false)
const translatedText = ref('')
const translating = ref(false)

const isAuthenticated = computed(() => !!authApi.getCurrentUser())
const currentUser = computed(() => authApi.getCurrentUser())

const isSearchMode = computed(() => route.path === '/news/search')
const searchQuery = computed(() => route.query.q || '')
const backLink = computed(() => '/')

const filteredNews = computed(() => {
  if (!searchQuery.value) return []
  const lowerQuery = searchQuery.value.toLowerCase()
  return allNews.value.filter(item => 
    item.title.toLowerCase().includes(lowerQuery) || 
    item.content.toLowerCase().includes(lowerQuery)
  )
})

const approvedReviews = computed(() => reviews.value.filter(r => r.is_approved))

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

const detectLanguage = (text) => {
  if (!text) return 'ru'
  const cyrillicPattern = /[а-яё]/i
  return cyrillicPattern.test(text) ? 'ru' : 'en'
}

const translateNews = async () => {
  if (isTranslated.value) {
    isTranslated.value = false
    return
  }
  
  translating.value = true
  
  try {
    const textToTranslate = singleNews.value.content || singleNews.value.title || ''
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|ru`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.responseData && data.responseData.translatedText) {
        translatedText.value = data.responseData.translatedText
        isTranslated.value = true
      }
    }
  } catch (error) {
    console.error('Ошибка перевода:', error)
  } finally {
    translating.value = false
  }
}

const fetchReviews = async () => {
  if (!singleNews.value) return
  try {
    const response = await fetch(`http://localhost:3001/api/reviews/news/${singleNews.value.id}`)
    if (response.ok) {
      const allReviews = await response.json()
      reviews.value = allReviews
      console.log('✅ Загружено отзывов:', allReviews.length)
      
      const approved = allReviews.filter(r => r.is_approved)
      if (approved.length > 0) {
        const sum = approved.reduce((acc, r) => acc + r.rating, 0)
        newsRating.value = Math.round((sum / approved.length) * 10) / 10
        ratingsCount.value = approved.length
      } else {
        newsRating.value = 0
        ratingsCount.value = 0
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error)
  }
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
    const response = await fetch('http://localhost:3001/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'news',
        entity_id: singleNews.value.id,
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

const saveNewsView = (newsData) => {
  if (!newsData) return
  
  const recentViews = localStorage.getItem('recent-views')
  let views = []
  
  if (recentViews) {
    try {
      views = JSON.parse(recentViews)
    } catch (e) {
      views = []
    }
  }
  
  views = views.filter(item => !(item.id === newsData.id && item.type === 'news'))
  
  views.unshift({
    id: newsData.id,
    type: 'news',
    title: newsData.title,
    image: newsData.image,
    timestamp: new Date().toISOString()
  })
  
  if (views.length > 20) views = views.slice(0, 20)
  
  localStorage.setItem('recent-views', JSON.stringify(views))
  console.log('✅ Сохранён просмотр новости:', newsData.title)
}

const isFavorite = (newsId) => {
  return favoriteNewsIds.value.has(newsId)
}

const loadFavoriteNews = async () => {
  if (!isAuthenticated.value || !currentUser.value?.id) return
  try {
    const response = await fetch(`http://localhost:3001/api/favorite-news/${currentUser.value.id}`)
    if (response.ok) {
      const favs = await response.json()
      favoriteNewsIds.value = new Set(favs.map(f => f.id))
    }
  } catch (error) {
    console.error('Ошибка загрузки избранных новостей:', error)
  }
}

const toggleFavorite = async () => {
  if (!isAuthenticated.value) {
    alert('Войдите в аккаунт, чтобы добавить новость в избранное')
    router.push('/login')
    return
  }
  
  try {
    if (isFavorite(singleNews.value.id)) {
      const response = await fetch('http://localhost:3001/api/favorite-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId: singleNews.value.id })
      })
      if (response.ok) {
        favoriteNewsIds.value.delete(singleNews.value.id)
      }
    } else {
      const response = await fetch('http://localhost:3001/api/favorite-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId: singleNews.value.id })
      })
      if (response.ok) {
        favoriteNewsIds.value.add(singleNews.value.id)
      }
    }
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

const toggleFavoriteFromList = async (newsId) => {
  if (!isAuthenticated.value) {
    alert('Войдите в аккаунт, чтобы добавить в избранное')
    router.push('/login')
    return
  }
  
  try {
    if (favoriteNewsIds.value.has(newsId)) {
      const response = await fetch('http://localhost:3001/api/favorite-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.value.id, newsId })
      })
      if (response.ok) {
        favoriteNewsIds.value.delete(newsId)
      }
    } else {
      const response = await fetch('http://localhost:3001/api/favorite-news', {
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

const goToNews = (id) => {
  router.push(`/news/${id}`)
}

const loadAllNews = async () => {
  loadingNews.value = true
  try {
    const response = await fetch('http://localhost:3001/api/news')
    if (response.ok) {
      allNews.value = await response.json()
      console.log('✅ Загружено новостей для поиска:', allNews.value.length)
    }
  } catch (error) {
    console.error('Ошибка загрузки новостей:', error)
  } finally {
    loadingNews.value = false
  }
}

const loadSingleNews = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('Загрузка новости с ID:', id)
    const response = await fetch(`http://localhost:3001/api/news/${id}`)
    if (response.ok) {
      singleNews.value = await response.json()
      console.log('✅ Новость загружена:', singleNews.value.title)
      saveNewsView(singleNews.value)
      await fetchReviews()
    } else {
      console.error('Новость не найдена, статус:', response.status)
    }
  } catch (error) {
    console.error('Ошибка загрузки новости:', error)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, async (newQuery, oldQuery) => {
  if (isSearchMode.value && newQuery !== oldQuery) {
    console.log('🔄 Поисковый запрос изменился, перезагружаем новости:', newQuery)
    await loadAllNews()
    await loadFavoriteNews()
  }
}, { immediate: true })

watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && !isSearchMode.value) {
    console.log('🔄 ID новости изменился, перезагружаем:', newId)
    await loadSingleNews()
    await loadFavoriteNews()
  }
}, { immediate: true })

onMounted(async () => {
  if (isSearchMode.value) {
    await loadAllNews()
    await loadFavoriteNews()
  } else if (route.params.id) {
    await loadSingleNews()
    await loadFavoriteNews()
  } else {
    loading.value = false
    loadingNews.value = false
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