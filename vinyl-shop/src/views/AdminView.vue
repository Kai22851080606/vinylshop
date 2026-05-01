<!-- src/views/AdminView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-6xl mx-auto px-4">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Админ-панель 👑
      </h1>
      
      <div v-if="isAdmin" class="space-y-8">
        <!-- Вкладки -->
        <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700 flex-wrap">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-6 py-3 font-medium transition-colors"
            :class="[
              activeTab === tab.id 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- ПЛАСТИНКИ -->
        <div v-if="activeTab === 'vinyls'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ editingVinyl ? '✏️ Редактировать пластинку' : '➕ Добавить пластинку' }}</h2>
            <form @submit.prevent="saveVinyl" class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <input v-model="vinylForm.title" type="text" placeholder="Название" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="vinylForm.artist" type="text" placeholder="Исполнитель" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="vinylForm.price" type="number" min="0" placeholder="Цена" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="vinylForm.stock" type="number" min="0" placeholder="Количество" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="vinylForm.image" type="text" placeholder="Путь к изображению" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <select v-model="vinylForm.type" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="album">Альбом</option>
                  <option value="single">Сингл</option>
                  <option value="ep">EP</option>
                </select>
                <input v-model="vinylForm.release_year" type="number" placeholder="Год выпуска" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="vinylForm.genre" type="text" placeholder="Жанр" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
              <textarea v-model="vinylForm.description" placeholder="Описание пластинки" rows="3" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"></textarea>
              
              <!-- ТРЕКЛИСТ -->
              <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">🎵 Треклист</h3>
                  <button 
                    type="button"
                    @click="addTrack"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    ➕ Добавить трек
                  </button>
                </div>
                
                <div v-if="tracklist.length > 0" class="space-y-4">
                  <div v-for="(track, index) in tracklist" :key="index" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">{{ index + 1 }}</span>
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Трек {{ index + 1 }}</span>
                      </div>
                      <button 
                        type="button"
                        @click="removeTrack(index)"
                        class="text-red-500 hover:text-red-600 text-sm"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Название трека <span class="text-red-500">*</span></label>
                        <input 
                          v-model="track.title" 
                          type="text" 
                          placeholder="Название трека"
                          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                      </div>
                      <div>
                        <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Исполнитель</label>
                        <input 
                          v-model="track.artist" 
                          type="text" 
                          placeholder="Исполнитель (если отличается)"
                          class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                      </div>
                    </div>
                    <div class="mt-3">
                      <label class="block text-xs text-gray-500 dark:text-gray-400 mb-1">Длительность <span class="text-red-500">*</span></label>
                      <input 
                        v-model="track.duration" 
                        type="text" 
                        placeholder="например, 3:45"
                        class="w-full md:w-48 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                      >
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-6 text-gray-500 dark:text-gray-400">
                  <p>Нет треков. Нажмите "Добавить трек" чтобы начать.</p>
                </div>
              </div>
              
              <div class="flex gap-3">
                <button type="submit" :disabled="savingVinyl" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {{ savingVinyl ? 'Сохранение...' : (editingVinyl ? 'Сохранить изменения' : 'Добавить пластинку') }}
                </button>
                <button v-if="editingVinyl" type="button" @click="cancelEditVinyl" class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Отмена</button>
              </div>
            </form>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список пластинок</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ vinyls.length }}</span>
            </div>
            <div v-if="loadingVinyls" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="vinyls.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400"><p class="text-4xl mb-2">💿</p><p>Пластинки пока не добавлены</p></div>
            <div v-else class="space-y-2">
              <div v-for="vinyl in vinyls" :key="vinyl.id" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">💿</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ vinyl.title }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8 flex-wrap">
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ vinyl.artist }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ vinyl.price }} ₽</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">В наличии: {{ vinyl.stock }}</span>
                    <span v-if="vinyl.release_year" class="text-xs text-gray-400">📅 {{ vinyl.release_year }}</span>
                    <span v-if="vinyl.genre" class="text-xs text-gray-400">🎵 {{ vinyl.genre }}</span>
                  </div>
                  <p v-if="vinyl.description" class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 line-clamp-1">{{ vinyl.description.substring(0, 100) }}{{ vinyl.description.length > 100 ? '...' : '' }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editVinyl(vinyl)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Редактировать"><span class="text-xl">✏️</span></button>
                  <button @click="deleteVinyl(vinyl.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить"><span class="text-xl">🗑️</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- НОВОСТИ -->
        <div v-if="activeTab === 'news'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ editingNews ? '✏️ Редактировать новость' : '➕ Добавить новость' }}</h2>
            <form @submit.prevent="saveNews" class="space-y-4">
              <input v-model="newsForm.title" type="text" placeholder="Заголовок" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <textarea v-model="newsForm.content" placeholder="Текст новости" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              <div class="grid md:grid-cols-3 gap-4">
                <input v-model="newsForm.date" type="date" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="newsForm.category" type="text" placeholder="Категория" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="newsForm.image" type="text" placeholder="Путь к изображению" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
              <div class="flex gap-3">
                <button type="submit" :disabled="savingNews" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {{ savingNews ? 'Сохранение...' : (editingNews ? 'Сохранить изменения' : 'Добавить новость') }}
                </button>
                <button v-if="editingNews" type="button" @click="cancelEditNews" class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Отмена</button>
              </div>
            </form>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список новостей</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ news.length }}</span>
            </div>
            <div v-if="loadingNews" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="news.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400"><p class="text-4xl mb-2">📰</p><p>Новости пока не добавлены</p></div>
            <div v-else class="space-y-2">
              <div v-for="item in news" :key="item.id" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">📰</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.title }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8">
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ formatDateForDisplay(item.date) }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm text-blue-600 dark:text-blue-400">{{ item.category }}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="editNews(item)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Редактировать"><span class="text-xl">✏️</span></button>
                  <button @click="deleteNews(item.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить"><span class="text-xl">🗑️</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- УСЛУГИ (отдельно, без артистов) -->
        <div v-if="activeTab === 'services'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ editingService ? '✏️ Редактировать услугу' : '➕ Добавить услугу' }}</h2>
            <form @submit.prevent="saveService" class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <input v-model="serviceForm.name" type="text" placeholder="Название услуги" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="serviceForm.price" type="number" min="0" placeholder="Цена" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
              <textarea v-model="serviceForm.description" placeholder="Описание услуги" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              <div class="flex gap-3">
                <button type="submit" :disabled="savingService" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {{ savingService ? 'Сохранение...' : (editingService ? 'Сохранить изменения' : 'Добавить услугу') }}
                </button>
                <button v-if="editingService" type="button" @click="cancelEditService" class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Отмена</button>
              </div>
            </form>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список услуг</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ services.length }}</span>
            </div>
            <div v-if="loadingServices" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="services.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p class="text-4xl mb-2">🎤</p><p>Услуги пока не добавлены</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="service in services" :key="service.id" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🎤</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ service.name }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Услуга</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ service.price }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 line-clamp-2">{{ service.description }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editService(service)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Редактировать"><span class="text-xl">✏️</span></button>
                  <button @click="deleteService(service.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить"><span class="text-xl">🗑️</span></button>
                </div>
              </div>
            </div>
          </div>

          <!-- АРТИСТЫ (отдельный раздел) -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ editingArtist ? '✏️ Редактировать артиста' : '➕ Добавить артиста' }}</h2>
            <form @submit.prevent="saveArtist" class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <input v-model="artistForm.name" type="text" placeholder="Имя артиста" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="artistForm.price" type="number" min="0" placeholder="Цена" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="artistForm.image" type="text" placeholder="Путь к изображению" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
              <textarea v-model="artistForm.description" placeholder="Описание артиста" required rows="3" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
              <div class="flex gap-3">
                <button type="submit" :disabled="savingArtist" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {{ savingArtist ? 'Сохранение...' : (editingArtist ? 'Сохранить изменения' : 'Добавить артиста') }}
                </button>
                <button v-if="editingArtist" type="button" @click="cancelEditArtist" class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Отмена</button>
              </div>
            </form>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список артистов</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ artists.length }}</span>
            </div>
            <div v-if="loadingArtists" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="artists.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p class="text-4xl mb-2">🎤</p><p>Артисты пока не добавлены</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="artist in artists" :key="artist.id" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">🎤</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ artist.name }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Артист</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-400">{{ Number(artist.price).toLocaleString() }} ₽</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 line-clamp-2">{{ artist.description }}</p>
                </div>
                <div class="flex gap-2">
                  <button @click="editArtist(artist)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Редактировать"><span class="text-xl">✏️</span></button>
                  <button @click="deleteArtist(artist.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить"><span class="text-xl">🗑️</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== АКЦИИ ===== -->
        <div v-if="activeTab === 'promotions'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {{ editingPromotion ? '✏️ Редактировать акцию' : '➕ Добавить акцию' }}
            </h2>
            <form @submit.prevent="savePromotion" class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <input v-model="promotionForm.name" type="text" placeholder="Название акции" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <select v-model="promotionForm.type" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="discount">Скидка</option>
                  <option value="bundle">Выгодное предложение (1+1=3)</option>
                  <option value="cashback">Кэшбэк</option>
                </select>
              </div>
      
              <div v-if="promotionForm.type === 'discount'" class="grid md:grid-cols-2 gap-4">
                <select v-model="promotionForm.discount_type" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="percentage">Процентная скидка (%)</option>
                  <option value="fixed">Фиксированная скидка (₽)</option>
                </select>
                <input v-model="promotionForm.discount_value" type="number" min="0" placeholder="Значение скидки" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
      
              <div v-if="promotionForm.type === 'bundle'" class="grid md:grid-cols-2 gap-4">
                <input v-model="promotionForm.buy_quantity" type="number" min="1" placeholder="Сколько купить" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <input v-model="promotionForm.get_quantity" type="number" min="1" placeholder="Сколько получить" required class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              </div>
      
              <textarea v-model="promotionForm.description" placeholder="Описание акции" required rows="2" class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
      
              <div class="grid md:grid-cols-3 gap-4">
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 mb-1 ml-1">Дата начала</span>
                  <input 
                    v-model="promotionForm.start_date" 
                    type="datetime-local" 
                    step="1" 
                    required 
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-gray-400 mb-1 ml-1">Дата окончания</span>
                  <input 
                    v-model="promotionForm.end_date" 
                    type="datetime-local" 
                    step="1" 
                    required 
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                </div>
                <label class="flex items-center gap-2 mt-5">
                  <input type="checkbox" v-model="promotionForm.active" class="w-5 h-5">
                  <span class="text-gray-700 dark:text-gray-300">Активна</span>
                </label>
              </div>
      
              <div class="flex gap-3 mt-4">
                <button type="submit" :disabled="savingPromotion" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
                  {{ savingPromotion ? 'Сохранение...' : (editingPromotion ? 'Сохранить изменения' : 'Добавить акцию') }}
                </button>
                <button v-if="editingPromotion" type="button" @click="cancelEditPromotion" class="px-6 py-2.5 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Отмена</button>
              </div>
            </form>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список акций</h2>
              <span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ promotions.length }}</span>
            </div>
            <div v-if="loadingPromotions" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="promotions.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p class="text-4xl mb-2">🎁</p><p>Акции пока не добавлены</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="promotion in promotions" :key="promotion.id" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ promotion.type === 'discount' ? '🏷️' : promotion.type === 'bundle' ? '🎁' : '💰' }}</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ promotion.name }}</p>
                    <span :class="promotion.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'" class="text-xs px-2 py-1 rounded-full ml-2">
                      {{ promotion.active ? 'Активна' : 'Неактивна' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8">
                    <span class="text-sm text-gray-600 dark:text-gray-300">
                      {{ promotion.type === 'discount' ? (promotion.discount_type === 'percentage' ? `Скидка ${promotion.discount_value}%` : `Скидка ${promotion.discount_value} ₽`) : promotion.type === 'bundle' ? `Купи ${promotion.buy_quantity}, получи ${promotion.get_quantity}` : `Кэшбэк ${promotion.cashback_percent}%` }}
                    </span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ promotion.target_type === 'all' ? 'На все пластинки' : 'На выбранные пластинки' }}</span>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8 line-clamp-1">{{ promotion.description }}</p>
                  <div class="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-8">
                    {{ promotion.start_date ? new Date(promotion.start_date).toLocaleDateString() : 'без даты начала' }} - {{ promotion.end_date ? new Date(promotion.end_date).toLocaleDateString() : 'без даты окончания' }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="editPromotion(promotion)" class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Редактировать"><span class="text-xl">✏️</span></button>
                  <button @click="deletePromotion(promotion.id)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Удалить"><span class="text-xl">🗑️</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== МОДЕРАЦИЯ ОТЗЫВОВ ===== -->
        <div v-if="activeTab === 'reviews'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Модерация отзывов</h2>
              <span class="px-3 py-1 bg-yellow-500 text-white text-sm rounded-full">На модерации: {{ pendingReviews.length }}</span>
            </div>
            <div v-if="loadingReviews" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="pendingReviews.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p class="text-4xl mb-2">✅</p>
              <p>Нет отзывов на модерации</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="review in pendingReviews" :key="review.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="font-semibold text-gray-900 dark:text-white">{{ review.user_name }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(review.created_at) }}</span>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {{ getEntityTypeName(review.entity_type) }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 mb-2">
                      <span v-for="star in 5" :key="star" class="text-lg">
                        {{ star <= review.rating ? '⭐' : '☆' }}
                      </span>
                    </div>
                    <p class="text-gray-700 dark:text-gray-300">{{ review.comment }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ID записи: {{ review.entity_id }}
                    </p>
                  </div>
                  <div class="flex gap-2 ml-4">
                    <button 
                      @click="approveReview(review.id)"
                      class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <span>✅</span> Одобрить
                    </button>
                    <button 
                      @click="rejectReview(review.id)"
                      class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-1"
                    >
                      <span>❌</span> Отклонить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Одобренные отзывы</h2>
              <span class="px-3 py-1 bg-green-600 text-white text-sm rounded-full">{{ approvedReviewsList.length }}</span>
            </div>
            <div v-if="loadingApprovedReviews" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="approvedReviewsList.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>Нет одобренных отзывов</p>
            </div>
            <div v-else class="space-y-2">
              <div v-for="review in approvedReviewsList" :key="review.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900 dark:text-white">{{ review.user_name }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDateTime(review.created_at) }}</span>
                    </div>
                    <div class="flex items-center gap-1 mt-1">
                      <span v-for="star in 5" :key="star" class="text-sm">
                        {{ star <= review.rating ? '⭐' : '☆' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ review.comment.substring(0, 100) }}{{ review.comment.length > 100 ? '...' : '' }}</p>
                  </div>
                  <div class="text-xs text-gray-400">
                    {{ getEntityTypeName(review.entity_type) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- КОРЗИНА -->
        <div v-if="activeTab === 'trash'" class="space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Корзина</h2>
              <span class="px-3 py-1 bg-gray-600 text-white text-sm rounded-full">{{ trashItems.length }}</span>
            </div>
            <div v-if="loadingTrash" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="trashItems.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400"><p class="text-4xl mb-2">🗑️</p><p>Корзина пуста</p></div>
            <div v-else class="space-y-2">
              <div v-for="item in trashItems" :key="item.id + item.type" class="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600">
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">{{ item.type === 'vinyl' ? '💿' : item.type === 'service' ? '🎤' : item.type === 'artist' ? '🎤' : item.type === 'promotion' ? '🎁' : '📰' }}</span>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.title || item.name }}</p>
                  </div>
                  <div class="flex items-center gap-3 mt-1 ml-8">
                    <span class="text-sm text-gray-600 dark:text-gray-300">{{ item.type === 'vinyl' ? item.artist : item.type === 'service' ? 'Услуга' : item.type === 'artist' ? 'Артист' : item.type === 'promotion' ? 'Акция' : item.category }}</span>
                    <span class="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500"></span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{ formatDateTime(item.deleted_at) }}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button @click="restoreItem(item)" class="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors"><span class="text-xl">↩️</span></button>
                  <button @click="permanentDelete(item)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"><span class="text-xl">❌</span></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== ЗАКАЗЫ ===== -->
        <div v-if="activeTab === 'orders'" class="space-y-6">
          <!-- Статистика -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div class="flex items-center gap-3"><div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full"><span class="text-2xl">📦</span></div><div><p class="text-sm text-gray-500 dark:text-gray-400">Всего заказов</p><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ allOrders.length }}</p></div></div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div class="flex items-center gap-3"><div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-full"><span class="text-2xl">✅</span></div><div><p class="text-sm text-gray-500 dark:text-gray-400">Подтверждённые</p><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ confirmedOrders.length }}</p></div></div>
            </div>
            <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
              <div class="flex items-center gap-3"><div class="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full"><span class="text-2xl">⏳</span></div><div><p class="text-sm text-gray-500 dark:text-gray-400">Ожидают</p><p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingOrders.length }}</p></div></div>
            </div>
          </div>

          <!-- Фильтр -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
            <div class="flex gap-4">
              <select v-model="orderFilter" class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="all">Все заказы</option>
                <option value="confirmed">Подтверждённые</option>
                <option value="pending">Ожидающие подтверждения</option>
              </select>
            </div>
          </div>

          <!-- Список заказов -->
          <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div class="flex items-center justify-between mb-4"><h2 class="text-xl font-semibold text-gray-900 dark:text-white">Список заказов</h2><span class="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">{{ filteredOrders.length }}</span></div>
            <div v-if="loadingOrders" class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div></div>
            <div v-else-if="filteredOrders.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400"><p class="text-4xl mb-2">📦</p><p>{{ orderFilter === 'confirmed' ? 'Нет подтверждённых заказов' : orderFilter === 'pending' ? 'Нет ожидающих заказов' : 'Нет заказов' }}</p></div>
            <div v-else class="space-y-4">
              <div v-for="order in filteredOrders" :key="order.id" class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <div class="flex items-center justify-between mb-3">
                  <div><span class="font-bold text-gray-900 dark:text-white">Заказ #{{ order.id }}</span><span class="text-xs text-gray-500 dark:text-gray-400 ml-3">{{ formatDateTime(order.created_at) }}</span></div>
                  <span class="px-3 py-1 text-xs rounded-full" :class="order.confirmed || order.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'">{{ order.confirmed || order.status === 'confirmed' ? '✅ Подтверждён' : '⏳ Ожидает' }}</span>
                </div>
                <div class="mb-3"><p class="text-sm text-gray-500 dark:text-gray-400">Тип: <span class="font-medium">{{ order.order_type === 'vinyl' ? '💿 Пластинки' : '🎤 Услуги' }}</span></p></div>
                <div class="mb-3"><p class="text-sm font-medium text-gray-700 dark:text-gray-300">👤 Покупатель:</p><p class="text-sm text-gray-600 dark:text-gray-400 ml-4">{{ order.customer_name }} {{ order.customer_lastname }}</p><p class="text-sm text-gray-600 dark:text-gray-400 ml-4">📧 {{ order.customer_email }}</p></div>
                <div class="mb-3">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300">🛒 Товары:</p>
                  <div class="ml-4 space-y-2">
                    <div v-for="(item, idx) in getOrderItems(order)" :key="idx" class="text-sm text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-800 rounded-lg">
                      <div class="flex items-start gap-2">
                        <span>{{ order.order_type === 'vinyl' ? '💿' : '🎤' }}</span>
                        <div>
                          <p class="font-medium">{{ item.title || item.name }}</p>
                          <p v-if="item.artist" class="text-xs text-gray-500">{{ item.artist }}</p>
                          <div class="flex items-center gap-3 mt-1">
                            <span v-if="item.quantity && item.quantity > 1" class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs">× {{ item.quantity }}</span>
                            <span class="font-bold text-blue-600 dark:text-blue-400">{{ ((item.price || 0) * (item.quantity || 1)).toLocaleString() }} ₽</span>
                            <span v-if="item.quantity && item.quantity > 1" class="text-xs text-gray-500">({{ item.price }} ₽ × {{ item.quantity }})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="getDeliveryData(order)" class="mb-3"><p class="text-sm font-medium text-gray-700 dark:text-gray-300">📦 Доставка:</p><div class="text-sm text-gray-600 dark:text-gray-400 ml-4 p-2 bg-white dark:bg-gray-800 rounded-lg"><p>{{ getDeliveryData(order).country }}, {{ getDeliveryData(order).city }}, {{ getDeliveryData(order).zipCode }}</p><p class="mt-1">{{ getDeliveryData(order).address }}</p></div></div>
                <div v-if="getEventData(order)" class="mb-3"><p class="text-sm font-medium text-gray-700 dark:text-gray-300">🎪 Мероприятие:</p><div class="text-sm text-gray-600 dark:text-gray-400 ml-4 p-2 bg-white dark:bg-gray-800 rounded-lg"><p>📍 {{ getEventData(order).address }}</p><p class="mt-1">📅 {{ getEventData(order).date }} в {{ getEventData(order).time }}</p></div></div>
                <div class="mb-3"><p class="text-sm font-medium text-gray-700 dark:text-gray-300">💳 Оплата:</p><div class="text-sm text-gray-600 dark:text-gray-400 ml-4"><p>{{ order.card_holder || 'Не указан' }} <span class="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">**** {{ order.card_last4 }}</span></p></div></div>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3"><div class="flex justify-between items-center"><span class="font-bold text-gray-900 dark:text-white">Итого:</span><span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ (order.total_price || 0).toLocaleString() }} ₽</span></div></div>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center">
          <router-link to="/profile" class="inline-flex items-center gap-2 px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <span>←</span> Назад в профиль
          </router-link>
        </div>
      </div>

      <div v-else class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p class="text-red-500 dark:text-red-400 text-xl mb-2">⛔ Доступ запрещен</p>
        <p class="text-gray-600 dark:text-gray-300 mb-4">Только для администраторов</p>
        <router-link to="/" class="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">На главную</router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, inject, watch, computed } from 'vue'
import { authApi } from '../api/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user, updateAuth } = inject('auth')
const isAdmin = ref(false)

const checkAdmin = () => {
  const currentUser = authApi.getCurrentUser()
  if (currentUser && currentUser.role === 'admin') {
    isAdmin.value = true
  } else {
    isAdmin.value = false
  }
}

const activeTab = ref('vinyls')
const tabs = [
  { id: 'vinyls', name: '💿 Пластинки' },
  { id: 'news', name: '📰 Новости' },
  { id: 'services', name: '🎤 Услуги' },
  { id: 'promotions', name: '🎁 Акции' },
  { id: 'reviews', name: '💬 Модерация отзывов' },
  { id: 'trash', name: '🗑️ Корзина' },
  { id: 'orders', name: '📦 Заказы' }
]

// Текущая дата и время для input datetime-local
const currentDateTime = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 19)
})

// Форматирование даты и времени в локальное время пользователя
const formatDateTime = (dateString) => {
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

// Форматирование только даты для новостей
const formatDateForDisplay = (dateString) => {
  if (!dateString) return ''
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Получение названия типа сущности
const getEntityTypeName = (type) => {
  const types = {
    'vinyl': 'Пластинка',
    'news': 'Новость',
    'artist': 'Артист'
  }
  return types[type] || type
}

// Пластинки
const vinyls = ref([])
const loadingVinyls = ref(false)
const savingVinyl = ref(false)
const editingVinyl = ref(false)
const tracklist = ref([])
const vinylForm = ref({ 
  id: null, 
  title: '', 
  artist: '', 
  price: '', 
  image: '', 
  type: 'album', 
  stock: '', 
  release_year: '', 
  genre: '', 
  description: '',
  tracklist: ''
})

const addTrack = () => {
  tracklist.value.push({ title: '', artist: '', duration: '' })
}

const removeTrack = (index) => {
  tracklist.value.splice(index, 1)
}

// Новости
const news = ref([])
const loadingNews = ref(false)
const savingNews = ref(false)
const editingNews = ref(false)
const newsForm = ref({ id: null, title: '', content: '', date: '', category: '', image: '' })

// Услуги
const services = ref([])
const loadingServices = ref(false)
const savingService = ref(false)
const editingService = ref(false)
const serviceForm = ref({ id: null, name: '', description: '', price: '' })

// Артисты
const artists = ref([])
const loadingArtists = ref(false)
const savingArtist = ref(false)
const editingArtist = ref(false)
const artistForm = ref({ id: null, name: '', description: '', price: '', image: '' })

// Акции
const promotions = ref([])
const loadingPromotions = ref(false)
const savingPromotion = ref(false)
const editingPromotion = ref(false)
const promotionForm = ref({
  id: null,
  name: '',
  description: '',
  type: 'discount',
  discount_type: 'percentage',
  discount_value: '',
  buy_quantity: 1,
  get_quantity: 1,
  cashback_percent: 0,
  target_type: 'all',
  target_ids: [],
  image: '',
  start_date: '',
  end_date: '',
  active: true
})

// Отзывы
const pendingReviews = ref([])
const approvedReviewsList = ref([])
const loadingReviews = ref(false)
const loadingApprovedReviews = ref(false)

// Корзина
const trashItems = ref([])
const loadingTrash = ref(false)

// Заказы
const allOrders = ref([])
const confirmedOrders = ref([])
const loadingOrders = ref(false)
const orderFilter = ref('all')

const pendingOrders = computed(() => allOrders.value.filter(o => !o.confirmed && o.status !== 'confirmed'))
const filteredOrders = computed(() => {
  if (orderFilter.value === 'confirmed') return confirmedOrders.value
  if (orderFilter.value === 'pending') return pendingOrders.value
  return allOrders.value
})

const getOrderItems = (order) => {
  if (order.items_json) { try { return JSON.parse(order.items_json) } catch { return [] } }
  if (order.order_data) { try { const data = JSON.parse(order.order_data); return data.items || [] } catch { return [] } }
  return []
}
const getDeliveryData = (order) => { if (order.delivery_json) { try { return JSON.parse(order.delivery_json) } catch { return null } } return null }
const getEventData = (order) => { if (order.event_json) { try { return JSON.parse(order.event_json) } catch { return null } } return null }

// ==================== ФУНКЦИИ ДЛЯ ЗАКАЗОВ ====================
const fetchAllOrders = async () => {
  loadingOrders.value = true
  try {
    const res = await fetch('/api/orders')
    if (res.ok) {
      allOrders.value = await res.json()
      confirmedOrders.value = allOrders.value.filter(o => o.confirmed || o.status === 'confirmed')
      console.log('✅ Загружено заказов:', allOrders.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки заказов:', error) }
  finally { loadingOrders.value = false }
}

// ==================== ФУНКЦИИ ДЛЯ ПЛАСТИНОК ====================
const fetchVinyls = async () => {
  loadingVinyls.value = true
  try {
    const res = await fetch('/api/vinyls')
    if (res.ok) vinyls.value = await res.json()
  } catch (error) { console.error(error) }
  finally { loadingVinyls.value = false }
}

const saveVinyl = async () => {
  if (!vinylForm.value.title?.trim()) {
    alert('Название пластинки обязательно')
    return
  }
  if (!vinylForm.value.artist?.trim()) {
    alert('Исполнитель обязателен')
    return
  }
  
  savingVinyl.value = true
  try {
    let url = '/api/vinyls'
    let method = 'POST'
    if (editingVinyl.value && vinylForm.value.id) {
      url = `/api/vinyls/${vinylForm.value.id}`
      method = 'PUT'
    }
    
    const validTracks = tracklist.value.filter(t => t.title.trim() && t.duration.trim())
    const tracklistJson = validTracks.length > 0 ? JSON.stringify(validTracks) : null
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: vinylForm.value.title,
        artist: vinylForm.value.artist,
        price: vinylForm.value.price !== '' && vinylForm.value.price !== null ? Math.max(0, parseInt(vinylForm.value.price) || 0) : 0,
        image: vinylForm.value.image,
        type: vinylForm.value.type,
        stock: vinylForm.value.stock !== '' && vinylForm.value.stock !== null ? Math.max(0, parseInt(vinylForm.value.stock) || 0) : 0,
        release_year: vinylForm.value.release_year || null,
        genre: vinylForm.value.genre || null,
        description: vinylForm.value.description || null,
        tracklist: tracklistJson
      })
    })
    if (res.ok) {
      const wasEditing = editingVinyl.value
      await fetchVinyls()
      cancelEditVinyl()
      alert(wasEditing ? 'Пластинка успешно обновлена!' : 'Пластинка успешно добавлена!')
    } else {
      const errorData = await res.json()
      console.error('Ошибка сохранения:', errorData)
      alert('Ошибка при сохранении: ' + (errorData.error || 'Неизвестная ошибка'))
    }
  } catch (error) { 
    console.error('Ошибка:', error)
    alert('Ошибка при сохранении пластинки')
  }
  finally { savingVinyl.value = false }
}

const editVinyl = (vinyl) => {
  editingVinyl.value = true
  vinylForm.value = { ...vinyl }
  
  if (vinyl.tracklist) {
    try {
      tracklist.value = JSON.parse(vinyl.tracklist)
    } catch (e) {
      tracklist.value = []
    }
  } else {
    tracklist.value = []
  }
}

const cancelEditVinyl = () => {
  editingVinyl.value = false
  vinylForm.value = { id: null, title: '', artist: '', price: '', image: '', type: 'album', stock: '', release_year: '', genre: '', description: '', tracklist: '' }
  tracklist.value = []
}

const deleteVinyl = async (id) => {
  if (!confirm('Переместить пластинку в корзину?')) return
  try {
    const res = await fetch(`/api/vinyls/${id}`, { method: 'DELETE' })
    if (res.ok) {
      vinyls.value = vinyls.value.filter(v => v.id !== id)
      await fetchTrash()
    }
  } catch (error) { console.error(error) }
}

// ==================== ФУНКЦИИ ДЛЯ НОВОСТЕЙ ====================
const fetchNews = async () => {
  loadingNews.value = true
  try {
    const res = await fetch('/api/news')
    if (res.ok) news.value = await res.json()
  } catch (error) { console.error(error) }
  finally { loadingNews.value = false }
}

const saveNews = async () => {
  savingNews.value = true
  try {
    let url = '/api/news'
    let method = 'POST'
    if (editingNews.value && newsForm.value.id) {
      url = `/api/news/${newsForm.value.id}`
      method = 'PUT'
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newsForm.value.title,
        content: newsForm.value.content,
        date: newsForm.value.date,
        category: newsForm.value.category,
        image: newsForm.value.image
      })
    })
    if (res.ok) {
      const wasEditing = editingNews.value
      await fetchNews()
      cancelEditNews()
      alert(wasEditing ? 'Новость успешно обновлена!' : 'Новость успешно добавлена!')
    } else {
      const errorData = await res.json()
      console.error('Ошибка сохранения:', errorData)
      alert('Ошибка при сохранении: ' + (errorData.error || 'Неизвестная ошибка'))
    }
  } catch (error) { 
    console.error('Ошибка:', error)
    alert('Ошибка при сохранении новости')
  }
  finally { savingNews.value = false }
}

const editNews = (newsItem) => {
  editingNews.value = true
  newsForm.value = { ...newsItem }
}

const cancelEditNews = () => {
  editingNews.value = false
  newsForm.value = { id: null, title: '', content: '', date: '', category: '', image: '' }
}

const deleteNews = async (id) => {
  if (!confirm('Переместить новость в корзину?')) return
  try {
    const res = await fetch(`/api/news/${id}`, { method: 'DELETE' })
    if (res.ok) {
      news.value = news.value.filter(n => n.id !== id)
      await fetchTrash()
    }
  } catch (error) { console.error(error) }
}

// ==================== ФУНКЦИИ ДЛЯ УСЛУГ ====================
const fetchServices = async () => {
  loadingServices.value = true
  try {
    const res = await fetch('/api/services')
    if (res.ok) {
      services.value = await res.json()
      console.log('✅ Загружено услуг:', services.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки услуг:', error) }
  finally { loadingServices.value = false }
}

const saveService = async () => {
  savingService.value = true
  try {
    let url = '/api/services'
    let method = 'POST'
    if (editingService.value && serviceForm.value.id) {
      url = `/api/services/${serviceForm.value.id}`
      method = 'PUT'
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: serviceForm.value.name,
        description: serviceForm.value.description,
        price: serviceForm.value.price
      })
    })
    if (res.ok) {
      const wasEditing = editingService.value
      await fetchServices()
      cancelEditService()
      alert(wasEditing ? 'Услуга успешно обновлена!' : 'Услуга успешно добавлена!')
    } else {
      const errorData = await res.json()
      console.error('Ошибка сохранения:', errorData)
      alert('Ошибка при сохранении: ' + (errorData.error || 'Неизвестная ошибка'))
    }
  } catch (error) { 
    console.error('Ошибка:', error)
    alert('Ошибка при сохранении услуги')
  }
  finally { savingService.value = false }
}

const editService = (service) => {
  editingService.value = true
  serviceForm.value = { ...service }
}

const cancelEditService = () => {
  editingService.value = false
  serviceForm.value = { id: null, name: '', description: '', price: '' }
}

const deleteService = async (id) => {
  if (!confirm('Удалить услугу?')) return
  try {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
    if (res.ok) await fetchServices()
  } catch (error) { console.error(error) }
}

// ==================== ФУНКЦИИ ДЛЯ АРТИСТОВ ====================
const fetchArtists = async () => {
  loadingArtists.value = true
  try {
    const res = await fetch('/api/artists')
    if (res.ok) {
      artists.value = await res.json()
      console.log('✅ Загружено артистов:', artists.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки артистов:', error) }
  finally { loadingArtists.value = false }
}

const saveArtist = async () => {
  savingArtist.value = true
  try {
    let url = '/api/artists'
    let method = 'POST'
    if (editingArtist.value && artistForm.value.id) {
      url = `/api/artists/${artistForm.value.id}`
      method = 'PUT'
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: artistForm.value.name,
        description: artistForm.value.description,
        price: Math.max(0, parseInt(artistForm.value.price) || 0),
        image: artistForm.value.image
      })
    })
    if (res.ok) {
      const wasEditing = editingArtist.value
      await fetchArtists()
      cancelEditArtist()
      alert(wasEditing ? 'Артист успешно обновлен!' : 'Артист успешно добавлен!')
    } else {
      const errorData = await res.json()
      console.error('Ошибка сохранения:', errorData)
      alert('Ошибка при сохранении: ' + (errorData.error || 'Неизвестная ошибка'))
    }
  } catch (error) { 
    console.error('Ошибка:', error)
    alert('Ошибка при сохранении артиста')
  }
  finally { savingArtist.value = false }
}

const editArtist = (artist) => {
  editingArtist.value = true
  artistForm.value = { ...artist }
}

const cancelEditArtist = () => {
  editingArtist.value = false
  artistForm.value = { id: null, name: '', description: '', price: '', image: '' }
}

const deleteArtist = async (id) => {
  if (!confirm('Удалить артиста?')) return
  try {
    const res = await fetch(`/api/artists/${id}`, { method: 'DELETE' })
    if (res.ok) await fetchArtists()
  } catch (error) { console.error(error) }
}

// ==================== ФУНКЦИИ ДЛЯ АКЦИЙ ====================
const fetchPromotions = async () => {
  loadingPromotions.value = true
  try {
    const res = await fetch('/api/promotions')
    if (res.ok) {
      promotions.value = await res.json()
      console.log('✅ Загружено акций:', promotions.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки акций:', error) }
  finally { loadingPromotions.value = false }
}

const savePromotion = async () => {
  savingPromotion.value = true
  try {
    const dataToSend = {
      ...promotionForm.value,
      target_ids: promotionForm.value.target_type === 'specific' ? JSON.stringify(promotionForm.value.target_ids) : null,
      discount_value: promotionForm.value.discount_value !== '' ? Math.max(0, parseInt(promotionForm.value.discount_value) || 0) : 0,
      buy_quantity: Math.max(1, promotionForm.value.buy_quantity || 1),
      get_quantity: Math.max(1, promotionForm.value.get_quantity || 1),
      cashback_percent: Math.max(0, promotionForm.value.cashback_percent || 0)
    }
    
    let url = '/api/promotions'
    let method = 'POST'
    if (editingPromotion.value && promotionForm.value.id) {
      url = `/api/promotions/${promotionForm.value.id}`
      method = 'PUT'
    }
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
    if (res.ok) {
      const wasEditing = editingPromotion.value
      await fetchPromotions()
      cancelEditPromotion()
      alert(wasEditing ? 'Акция успешно обновлена!' : 'Акция успешно добавлена!')
    } else {
      const errorData = await res.json()
      console.error('Ошибка сохранения:', errorData)
      alert('Ошибка при сохранении: ' + (errorData.error || 'Неизвестная ошибка'))
    }
  } catch (error) { 
    console.error('Ошибка:', error)
    alert('Ошибка при сохранении акции')
  }
  finally { savingPromotion.value = false }
}

const editPromotion = (promotion) => {
  editingPromotion.value = true
  promotionForm.value = {
    ...promotion,
    discount_value: promotion.discount_value || '',
    target_ids: promotion.target_ids ? JSON.parse(promotion.target_ids) : []
  }
}

const cancelEditPromotion = () => {
  editingPromotion.value = false
  promotionForm.value = {
    id: null,
    name: '',
    description: '',
    type: 'discount',
    discount_type: 'percentage',
    discount_value: '',
    buy_quantity: 1,
    get_quantity: 1,
    cashback_percent: 0,
    target_type: 'all',
    target_ids: [],
    image: '',
    start_date: '',
    end_date: '',
    active: true
  }
}

const deletePromotion = async (id) => {
  if (!confirm('Удалить акцию?')) return
  try {
    const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' })
    if (res.ok) await fetchPromotions()
  } catch (error) { console.error(error) }
}

// ==================== ФУНКЦИИ ДЛЯ ОТЗЫВОВ ====================
const fetchPendingReviews = async () => {
  loadingReviews.value = true
  try {
    const res = await fetch('/api/reviews/pending')
    if (res.ok) {
      pendingReviews.value = await res.json()
      console.log('✅ Загружено отзывов на модерацию:', pendingReviews.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки отзывов:', error) }
  finally { loadingReviews.value = false }
}

const fetchApprovedReviews = async () => {
  loadingApprovedReviews.value = true
  try {
    const res = await fetch('/api/reviews/approved')
    if (res.ok) {
      approvedReviewsList.value = await res.json()
      console.log('✅ Загружено одобренных отзывов:', approvedReviewsList.value.length)
    }
  } catch (error) { console.error('Ошибка загрузки одобренных отзывов:', error) }
  finally { loadingApprovedReviews.value = false }
}

const approveReview = async (id) => {
  if (!confirm('Одобрить этот отзыв?')) return
  try {
    const res = await fetch(`/api/reviews/${id}/approve`, { method: 'POST' })
    if (res.ok) {
      await fetchPendingReviews()
      await fetchApprovedReviews()
      alert('Отзыв одобрен!')
    }
  } catch (error) { console.error('Ошибка одобрения отзыва:', error) }
}

const rejectReview = async (id) => {
  if (!confirm('Отклонить этот отзыв?')) return
  try {
    const res = await fetch(`/api/reviews/${id}/reject`, { method: 'DELETE' })
    if (res.ok) {
      await fetchPendingReviews()
      alert('Отзыв отклонён и удалён!')
    }
  } catch (error) { console.error('Ошибка отклонения отзыва:', error) }
}

// ==================== ФУНКЦИИ ДЛЯ КОРЗИНЫ ====================
const fetchTrash = async () => {
  loadingTrash.value = true
  trashItems.value = []
  try {
    const vinylsRes = await fetch('/api/vinyls/deleted')
    if (vinylsRes.ok) {
      const deletedVinyls = await vinylsRes.json()
      deletedVinyls.forEach(v => trashItems.value.push({ ...v, type: 'vinyl' }))
    }
    const newsRes = await fetch('/api/news/deleted')
    if (newsRes.ok) {
      const deletedNews = await newsRes.json()
      deletedNews.forEach(n => trashItems.value.push({ ...n, type: 'news' }))
    }
    const servicesRes = await fetch('/api/services/deleted')
    if (servicesRes.ok) {
      const deletedServices = await servicesRes.json()
      deletedServices.forEach(s => trashItems.value.push({ ...s, type: 'service' }))
    }
    const artistsRes = await fetch('/api/artists/deleted')
    if (artistsRes.ok) {
      const deletedArtists = await artistsRes.json()
      deletedArtists.forEach(a => trashItems.value.push({ ...a, type: 'artist' }))
    }
    const promotionsRes = await fetch('/api/promotions/deleted')
    if (promotionsRes.ok) {
      const deletedPromotions = await promotionsRes.json()
      deletedPromotions.forEach(p => trashItems.value.push({ ...p, type: 'promotion' }))
    }
    trashItems.value.sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at))
  } catch (error) { console.error(error) }
  finally { loadingTrash.value = false }
}

const restoreItem = async (item) => {
  if (!confirm('Восстановить элемент?')) return
  try {
    let endpoint
    if (item.type === 'vinyl') endpoint = `/api/vinyls/${item.id}/restore`
    else if (item.type === 'news') endpoint = `/api/news/${item.id}/restore`
    else if (item.type === 'service') endpoint = `/api/services/${item.id}/restore`
    else if (item.type === 'artist') endpoint = `/api/artists/${item.id}/restore`
    else if (item.type === 'promotion') endpoint = `/api/promotions/${item.id}/restore`
    const res = await fetch(endpoint, { method: 'POST' })
    if (res.ok) {
      await fetchTrash()
      if (item.type === 'vinyl') await fetchVinyls()
      else if (item.type === 'news') await fetchNews()
      else if (item.type === 'service') await fetchServices()
      else if (item.type === 'artist') await fetchArtists()
      else if (item.type === 'promotion') await fetchPromotions()
    }
  } catch (error) { console.error(error) }
}

const permanentDelete = async (item) => {
  if (!confirm('Удалить навсегда? Это действие необратимо!')) return
  try {
    let endpoint
    if (item.type === 'vinyl') endpoint = `/api/vinyls/${item.id}/permanent`
    else if (item.type === 'news') endpoint = `/api/news/${item.id}/permanent`
    else if (item.type === 'service') endpoint = `/api/services/${item.id}/permanent`
    else if (item.type === 'artist') endpoint = `/api/artists/${item.id}/permanent`
    else if (item.type === 'promotion') endpoint = `/api/promotions/${item.id}/permanent`
    const res = await fetch(endpoint, { method: 'DELETE' })
    if (res.ok) await fetchTrash()
  } catch (error) { console.error(error) }
}

onMounted(() => {
  checkAdmin()
  if (isAdmin.value) {
    fetchVinyls()
    fetchNews()
    fetchServices()
    fetchArtists()
    fetchPromotions()
    fetchPendingReviews()
    fetchApprovedReviews()
    fetchTrash()
  }
})

watch(activeTab, (newTab) => {
  if (newTab === 'trash' && isAdmin.value) fetchTrash()
  if (newTab === 'services' && isAdmin.value) {
    fetchServices()
    fetchArtists()
  }
  if (newTab === 'promotions' && isAdmin.value) {
    fetchPromotions()
    fetchVinyls()
  }
  if (newTab === 'reviews' && isAdmin.value) {
    fetchPendingReviews()
    fetchApprovedReviews()
  }
  if (newTab === 'orders' && isAdmin.value) {
    fetchAllOrders()
  }
})

watch(() => authApi.getCurrentUser(), () => checkAdmin(), { deep: true, immediate: true })
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>