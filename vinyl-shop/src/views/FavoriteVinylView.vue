<!-- src/views/FavoriteVinylView.vue -->
<template>
  <main class="py-8 favorite-page">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Заголовок -->
      <div class="flex items-center justify-between mb-6">
        <router-link 
          to="/profile" 
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад в профиль</span>
        </router-link>
        <h1 class="text-4xl font-bold dark:text-white text-center">
          Избранные пластинки ❤️
        </h1>
        <div class="w-24"></div>
      </div>

      <div v-if="!currentUser" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
        <p class="text-6xl mb-4">🔒</p>
        <h2 class="text-2xl font-bold dark:text-white mb-2">Требуется авторизация</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-6">
          Войдите в аккаунт, чтобы просмотреть избранное
        </p>
        <router-link 
          to="/login" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Войти
        </router-link>
      </div>

      <div v-else-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
        <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка...</p>
      </div>

      <div v-else-if="favorites.length === 0" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-12 text-center">
        <p class="text-6xl mb-4">💔</p>
        <h2 class="text-2xl font-bold dark:text-white mb-2">Избранное пусто</h2>
        <p class="text-gray-500 dark:text-gray-400 mb-2">
          У вас пока нет избранных пластинок
        </p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mb-6">
          Добавляйте пластинки в избранное, нажав на сердечко ❤️ рядом с названием
        </p>
        <router-link 
          to="/" 
          class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors"
        >
          Перейти в каталог
        </router-link>
      </div>

      <!-- Сетка избранных пластинок (вся карточка кликабельна) -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div 
          v-for="vinyl in favorites" 
          :key="vinyl.id"
          @click="goToVinylDetail(vinyl.id)"
          class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-black dark:border-white transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl cursor-pointer flex flex-col h-full relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:translate-y-full"
        >
          
          <!-- Фото -->
          <div class="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-inner bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-black dark:border-white shrink-0">
            <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="Vinyl cover">
            <span v-else class="text-6xl">💿</span>
          </div>

          <!-- Название и кнопка избранного -->
          <div class="space-y-2 flex-grow">
            <div class="flex items-center justify-between">
              <h3 class="text-xl font-bold dark:text-white leading-tight">{{ vinyl.title }}</h3>
              <button 
                @click.stop="removeFromFavorites(vinyl.id)"
                class="p-1 rounded-full transition-colors text-red-500 hover:text-red-600 flex-shrink-0"
                title="Удалить из избранного"
              >
                <span class="text-xl">❤️</span>
              </button>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium">{{ vinyl.artist }}</p>
          </div>

          <!-- Статус наличия -->
          <div class="mt-2 mb-2">
            <div v-if="vinyl.stock === 0" 
                 class="text-red-600 dark:text-red-400 font-bold text-sm bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full inline-block whitespace-nowrap">
              НЕТ В НАЛИЧИИ!
            </div>
            <div v-else 
                 class="text-sm whitespace-nowrap"
                 :class="{
                   'text-yellow-600 dark:text-yellow-400': vinyl.stock < 5,
                   'text-green-600 dark:text-green-400': vinyl.stock >= 5
                 }">
              В наличии: {{ vinyl.stock }} шт.
            </div>
            <div v-if="vinyl.orders_count > 0" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              🔥 Продано: {{ vinyl.orders_count }} шт.
            </div>
          </div>

          <!-- ЦЕНА -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex flex-col">
              <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-2xl font-black text-blue-600 dark:text-blue-400">
                {{ getDiscountedPrice(vinyl) }} ₽
              </span>
              <span v-else class="text-2xl font-black text-blue-600 dark:text-blue-400">
                {{ vinyl.price }} ₽
              </span>
              <span v-if="getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-gray-500 line-through">
                {{ vinyl.price }} ₽
              </span>
            </div>
            <div class="flex gap-2">
              <button 
                v-if="!isVinylInCart(vinyl.id) && vinyl.stock > 0"
                @click.stop="addToCart(vinyl)"
                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
              >
                🛒
              </button>
              <button 
                v-else-if="vinyl.stock > 0"
                disabled
                class="bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap"
              >
                ✓
              </button>
              <button 
                v-else
                disabled
                class="bg-gray-400 text-white px-0 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap"
              >
                Нет в наличии
              </button>
            </div>
          </div>

          <!-- Акции ПОД ценой -->
          <div v-if="(getDiscountPercent(vinyl) && getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price) || (cashbackPromotion && cashbackPromotion.cashback_percent > 0) || (bundlePromotion && bundlePromotion.buy_quantity > 0)" class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div class="flex flex-wrap gap-2">
              <div v-if="getDiscountPercent(vinyl) && getDiscountedPrice(vinyl) && getDiscountedPrice(vinyl) < vinyl.price" class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                🏷️ Скидка {{ getDiscountPercent(vinyl) }}%
              </div>
              <div v-if="cashbackPromotion && cashbackPromotion.cashback_percent > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                💰 Кэшбэк {{ cashbackPromotion.cashback_percent }}%
              </div>
              <div v-if="bundlePromotion && bundlePromotion.buy_quantity > 0" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                🎁 {{ bundlePromotion.buy_quantity }}+{{ bundlePromotion.get_quantity }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Форма заказа с передачей акций -->
    <OrderForm 
      v-if="showOrderForm"
      :items="[selectedVinyl]"
      :is-vinyl="true"
      :discounted-price="selectedVinyl ? getDiscountedPrice(selectedVinyl) : null"
      :bundle-promotion="bundlePromotion"
      :cashback-promotion="cashbackPromotion"
      @close="showOrderForm = false"
      @submit="handleOrderSubmit"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import { authApi } from '../api/auth'
import OrderForm from '../components/OrderForm.vue'

const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const currentUser = authApi.getCurrentUser()
const showOrderForm = ref(false)
const selectedVinyl = ref(null)

const favorites = computed(() => favoritesStore.favorites)
const loading = computed(() => favoritesStore.loading)

// Активные акции
const bundlePromotion = computed(() => cartStore.getBundlePromotion())
const cashbackPromotion = computed(() => cartStore.getCashbackPromotion())

const getDiscountedPrice = (vinyl) => {
  return cartStore.getDiscountedPrice(vinyl)
}

const getDiscountPercent = (vinyl) => {
  return cartStore.getDiscountPercent(vinyl)
}

const isVinylInCart = (id) => {
  return cartStore.isVinylInCart(id)
}

const removeFromFavorites = async (vinylId) => {
  await favoritesStore.removeFromFavorites(vinylId)
}

const addToCart = (vinyl) => {
  cartStore.addVinyl({
    id: vinyl.id,
    title: vinyl.title,
    artist: vinyl.artist,
    price: vinyl.price,
    image: vinyl.image,
    type: vinyl.type,
    stock: vinyl.stock
  })
  alert(`"${vinyl.title}" добавлена в корзину!`)
}

const goToVinylDetail = (id) => {
  router.push(`/vinyl/${id}`)
}

const handleOrderSubmit = () => {
  showOrderForm.value = false
}

onMounted(async () => {
  if (currentUser) {
    await cartStore.loadPromotions()
    await favoritesStore.loadFavorites()
  }
})
</script>