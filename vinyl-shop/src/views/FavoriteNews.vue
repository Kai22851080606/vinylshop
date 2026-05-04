<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Заголовок -->
      <div class="flex items-center justify-between mb-8">
        <router-link to="/profile" class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          <span>←</span> Назад в профиль
        </router-link>
        <h1 class="text-4xl font-bold dark:text-white text-center">
          Избранные новости 📰
        </h1>
        <div class="w-24"></div>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>

      <!-- Нет новостей -->
      <div v-else-if="favoriteNews.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
        <p class="text-6xl mb-4">💔</p>
        <h2 class="text-2xl font-bold dark:text-white mb-2">Избранное пусто</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          У вас пока нет избранных новостей
        </p>
        <router-link to="/news" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors">
          Перейти к новостям
        </router-link>
      </div>

      <!-- Список избранных новостей (как на странице News) -->
      <div v-else class="flex flex-col items-center px-4">
        <NewsCard 
          v-for="item in favoriteNews" 
          :key="item.id" 
          :news="item"
          :show-favorite-button="true"
          :is-favorite="true"
          @toggle-favorite="removeFromFavorites"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authApi } from '../api/auth'
import NewsCard from '../components/NewsCard.vue'

const favoriteNews = ref([])
const loading = ref(true)

const loadFavoriteNews = async () => {
  const currentUser = authApi.getCurrentUser()
  if (!currentUser?.id) {
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3001/api/favorite-news/${currentUser.id}`)
    if (response.ok) {
      favoriteNews.value = await response.json()
    }
  } catch (error) {
    console.error('Ошибка загрузки избранных новостей:', error)
  } finally {
    loading.value = false
  }
}

const removeFromFavorites = async (newsId) => {
  const currentUser = authApi.getCurrentUser()
  if (!currentUser?.id) return
  
  try {
    const response = await fetch('http://localhost:3001/api/favorite-news', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id, newsId })
    })
    if (response.ok) {
      favoriteNews.value = favoriteNews.value.filter(n => n.id !== newsId)
    }
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error)
  }
}

onMounted(() => {
  loadFavoriteNews()
})
</script>