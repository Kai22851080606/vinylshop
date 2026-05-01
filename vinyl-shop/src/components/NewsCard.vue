<!-- src/components/NewsCard.vue -->
<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:-translate-y-2 flex flex-col w-full max-w-3xl mx-auto mb-8">
    <!-- Картинка -->
    <div class="aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border-b border-gray-200 dark:border-gray-700">
      <img 
        v-if="!imageError && news.image" 
        :src="news.image" 
        :alt="news.title"
        class="w-full h-full object-cover"
        @error="imageError = true"
      >
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-4xl">🎵</span>
      </div>
    </div>

    <!-- Контент -->
    <div class="p-8 flex flex-col flex-grow">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
          <span>{{ news.date }}</span>
          <span>•</span>
          <span>{{ news.category }}</span>
          <span v-if="detectLanguage(news.title || news.content)" class="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 ml-2">
            {{ detectLanguage(news.title || news.content) === 'en' ? '🇬🇧 EN' : '🇷🇺 RU' }}
          </span>
        </div>
        
        <!-- Кнопка избранного -->
        <button 
          v-if="showFavoriteButton"
          @click="$emit('toggle-favorite', news.id)"
          class="p-1 rounded-full transition-colors"
          :class="isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
          :title="isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'"
        >
          <span class="text-xl">{{ isFavorite ? '❤️' : '🤍' }}</span>
        </button>
      </div>

      <h3 class="text-2xl font-bold dark:text-white mb-4">{{ news.title }}</h3>
      
      <!-- Описание с кнопкой разворачивания и перевода -->
      <div class="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
        <p :class="{ 'line-clamp-3': !isExpanded }">
          <span v-if="isTranslated && translatedText">{{ translatedText }}</span>
          <span v-else>{{ news.content || news.title }}</span>
        </p>
        <div class="flex flex-wrap gap-3 mt-3">
          <button 
            v-if="shouldShowExpandButton(news)"
            @click="toggleExpand"
            class="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            {{ isExpanded ? 'Свернуть ▲' : 'Развернуть ▼' }}
          </button>
          <button 
            v-if="detectLanguage(news.title || news.content) !== 'ru'"
            @click="translateNews"
            :disabled="translating"
            class="text-green-600 dark:text-green-400 text-sm hover:underline flex items-center gap-1"
          >
            <span>🌐</span>
            {{ translating ? 'Перевод...' : (isTranslated ? 'Оригинал' : 'Перевести на русский') }}
          </button>
        </div>
      </div>

      <!-- Кнопка "Читать далее" (если есть ссылка) -->
      <div class="mt-6" v-if="news.external_url">
        <a 
          :href="news.external_url" 
          target="_blank"
          class="text-blue-600 dark:text-blue-400 font-bold hover:gap-3 flex items-center gap-2 transition-all group text-lg"
        >
          <span>Читать на источнике</span>
          <span class="text-xl transition-transform duration-300">→</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  news: {
    type: Object,
    required: true
  },
  showFavoriteButton: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-favorite'])

const imageError = ref(false)
const isExpanded = ref(false)
const isTranslated = ref(false)
const translatedText = ref('')
const translating = ref(false)

// Функция определения языка текста
const detectLanguage = (text) => {
  if (!text) return 'ru'
  const cyrillicPattern = /[а-яё]/i
  return cyrillicPattern.test(text) ? 'ru' : 'en'
}

// Проверка, нужна ли кнопка "Развернуть"
const shouldShowExpandButton = (item) => {
  const text = item.content || item.title || ''
  return text.length > 200
}

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

// Функция перевода текста
const translateNews = async () => {
  if (isTranslated.value) {
    isTranslated.value = false
    return
  }
  
  translating.value = true
  
  try {
    const textToTranslate = props.news.content || props.news.title || ''
    if (!textToTranslate) {
      alert('Нет текста для перевода')
      translating.value = false
      return
    }
    
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|ru`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.responseData && data.responseData.translatedText) {
        translatedText.value = data.responseData.translatedText
        isTranslated.value = true
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
    translating.value = false
  }
}
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