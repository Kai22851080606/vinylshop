// src/stores/favorites.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref([])
  const loading = ref(false)

  const getCurrentUser = () => {
    return authApi.getCurrentUser()
  }

  const loadFavorites = async () => {
    const currentUser = getCurrentUser()
    if (!currentUser?.id) {
      favorites.value = []
      return
    }
    
    loading.value = true
    try {
      const response = await fetch(`/api/favorites/${currentUser.id}`)
      if (response.ok) {
        favorites.value = await response.json()
        console.log('Загружено избранное:', favorites.value.length)
      } else {
        favorites.value = []
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error)
      favorites.value = []
    } finally {
      loading.value = false
    }
  }

  const addToFavorites = async (vinylId) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.id) {
      alert('Войдите в аккаунт, чтобы добавлять в избранное')
      return false
    }

    try {
      const response = await fetch('http://localhost:3001/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, vinylId })
      })
      if (response.ok) {
        await loadFavorites()
        return true
      }
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error)
    }
    return false
  }

  const removeFromFavorites = async (vinylId) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.id) return false

    try {
      const response = await fetch('http://localhost:3001/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, vinylId })
      })
      if (response.ok) {
        await loadFavorites()
        return true
      }
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error)
    }
    return false
  }

  const toggleFavorite = async (vinylId) => {
    const currentUser = getCurrentUser()
    if (!currentUser?.id) {
      alert('Войдите в аккаунт, чтобы добавлять в избранное')
      return false
    }
    
    if (isFavorite(vinylId)) {
      return await removeFromFavorites(vinylId)
    } else {
      return await addToFavorites(vinylId)
    }
  }

  const isFavorite = (vinylId) => {
    return favorites.value.some(f => f.id === vinylId)
  }

  const totalFavorites = computed(() => favorites.value.length)

  return {
    favorites,
    loading,
    loadFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    totalFavorites
  }
})