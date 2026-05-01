<!-- src/components/VinylCard.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-black dark:border-white transition-all hover:-translate-y-2 flex flex-col h-full">
    
    <div class="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-inner bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-black dark:border-white shrink-0">
      <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="Vinyl cover">
      <span v-else class="text-6xl">💿</span>
    </div>

    <div class="space-y-2 flex-grow">
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-bold dark:text-white leading-tight">
          <span v-if="searchQuery" v-html="highlightText(vinyl.title, searchQuery)"></span>
          <span v-else>{{ vinyl.title }}</span>
        </h3>
        <button 
          v-if="showFavorite"
          @click="$emit('toggle-favorite', vinyl.id)"
          class="p-1 rounded-full transition-colors"
          :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
          :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
        >
          <span class="text-xl">{{ isFavorite ? '❤️' : '🤍' }}</span>
        </button>
      </div>
      <p class="text-gray-500 dark:text-gray-400 font-medium">
        <span v-if="searchQuery" v-html="highlightText(vinyl.artist, searchQuery)"></span>
        <span v-else>{{ vinyl.artist }}</span>
      </p>
    </div>

    <div class="mt-2 mb-3">
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

    <div class="flex items-center justify-between pt-2 mt-auto">
      <span class="text-2xl font-black text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {{ vinyl.price }} ₽
      </span>
      <div class="flex gap-2">
        <button 
          v-if="!isInCart && vinyl.stock > 0"
          @click="$emit('add-to-cart', vinyl)"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
        >
          🛒
        </button>
        <button 
          v-else-if="vinyl.stock === 0"
          disabled
          class="bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap"
        >
          Нет в наличии
        </button>
        <button 
          v-else
          disabled
          class="bg-gray-400 text-white px-3 py-2 rounded-lg font-bold text-sm shadow-md border border-black dark:border-white cursor-not-allowed opacity-50 whitespace-nowrap"
        >
          ✓
        </button>
        <button 
          @click="$emit('buy-now', vinyl)"
          :disabled="vinyl.stock === 0"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
          :class="{ 'opacity-50 cursor-not-allowed': vinyl.stock === 0 }"
        >
          Купить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  vinyl: {
    type: Object,
    required: true
  },
  isInCart: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  showFavorite: {
    type: Boolean,
    default: true
  },
  searchQuery: {
    type: String,
    default: ''
  }
})

defineEmits(['toggle-favorite', 'add-to-cart', 'buy-now'])

const highlightText = (text, query) => {
  if (!query || !text) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
}
</script>