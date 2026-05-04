<!-- src/views/VinylDetailView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-7xl mx-auto px-4">
      <!-- Кнопка назад -->
      <div class="mb-6">
        <router-link 
          to="/catalog?tab=vinyls"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray dark:text-gray hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад к виниловым пластинкам</span>
        </router-link>
      </div>

      <!-- РЕЖИМ ПОИСКА (список пластинок как в HomeView) -->
      <template v-if="isSearchMode">
        <h2 class="text-3xl font-bold mb-8 dark:text-white text-center">
          Результаты поиска пластинок 💿
        </h2>

        <div class="mb-6">
          <div class="flex items-center justify-between flex-wrap gap-3 bg-blue-300 dark:bg-blue-900/20 p-4 rounded-lg">
            <p class="text-black dark:text-black">
              Найдено {{ filteredVinyls.length }} пластинок по запросу "{{ searchQuery }}"
            </p>
            <router-link 
              to="/" 
              class="text-black dark:text-black hover:underline text-sm flex items-center gap-1"
            >
              <span>Сбросить поиск</span>
            </router-link>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-4 mb-8">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Сортировка:</span>
            <select 
              v-model="sortType"
              @change="saveSettings"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="title">По названию</option>
              <option value="artist">По артисту</option>
              <option value="price">По цене</option>
              <option value="orders_count">По популярности</option>
              <option value="stock">По количеству в наличии</option>
            </select>
          </div>

          <button 
            @click="toggleSortOrder"
            class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 min-w-[140px] justify-center"
          >
            <span>{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
            <span>{{ getSortButtonText }}</span>
          </button>

          <div class="flex items-center gap-2 ml-4">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Фильтр:</span>
            <select 
              v-model="filterType"
              @change="saveSettings"
              class="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все</option>
              <option value="single">Сингл</option>
              <option value="ep">EP</option>
              <option value="album">Альбом</option>
              <option value="inStock">Только в наличии</option>
            </select>
          </div>
        </div>

        <div v-if="loadingVinyls" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка пластинок...</p>
        </div>

        <div v-else-if="filteredAndSortedVinyls.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="vinyl in filteredAndSortedVinyls" :key="vinyl.id"
               class="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl border border-black dark:border-white transition-transform duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl flex flex-col h-full relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-8 after:translate-y-full">
            
            <div class="aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-inner bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-black dark:border-white shrink-0">
              <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="Vinyl cover">
              <span v-else class="text-6xl">💿</span>
            </div>

            <div class="space-y-2 flex-grow">
              <div class="flex items-center justify-between">
                <h3 class="text-xl font-bold dark:text-white leading-tight">
                  <span v-html="highlightText(vinyl.title, searchQuery)"></span>
                </h3>
                <button 
                  @click="toggleFavorite(vinyl.id)"
                  class="p-1 rounded-full transition-colors"
                  :class="isVinylFavorite(vinyl.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                  :title="isVinylFavorite(vinyl.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                >
                  <span class="text-xl">{{ isVinylFavorite(vinyl.id) ? '❤️' : '🤍' }}</span>
                </button>
              </div>
              <p class="text-gray-500 dark:text-gray-400 font-medium">
                <span v-html="highlightText(vinyl.artist, searchQuery)"></span>
              </p>
            </div>

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

            <div class="flex items-center justify-between pt-2">
              <div class="flex flex-col">
                <span v-if="getDiscountedPrice(vinyl)" class="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {{ getDiscountedPrice(vinyl) }} ₽
                </span>
                <span v-else class="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {{ vinyl.price }} ₽
                </span>
                <span v-if="getDiscountedPrice(vinyl)" class="text-xs text-gray-500 line-through">
                  {{ vinyl.price }} ₽
                </span>
              </div>
              <div class="flex gap-2">
                <button 
                  v-if="!isAuthenticated"
                  @click="requireAuth('Войдите в аккаунт, чтобы добавить виниловую пластинку в корзину')"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
                >
                  🛒
                </button>
                <button 
                  v-else-if="!isVinylInCart(vinyl.id) && vinyl.stock > 0"
                  @click="addToCart(vinyl)"
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
                <button 
                  v-if="!isAuthenticated"
                  @click="requireAuth('Войдите в аккаунт, чтобы купить виниловую пластинку')"
                  :disabled="vinyl.stock === 0"
                  class="bg-green-600 hover:bg-green-700 text-white px-0 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
                  :class="{ 'opacity-50 cursor-not-allowed': vinyl.stock === 0 }"
                >
                  Купить
                </button>
                <button 
                  v-else
                  @click="buyNow(vinyl)"
                  :disabled="vinyl.stock === 0"
                  class="bg-green-600 hover:bg-green-700 text-white px-0 py-2 rounded-lg font-bold text-sm transition-colors shadow-md border border-gray dark:border-gray-700 whitespace-nowrap"
                  :class="{ 'opacity-50 cursor-not-allowed': vinyl.stock === 0 }"
                >
                  Купить
                </button>
              </div>
            </div>

            <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div class="flex flex-wrap gap-2">
                <div v-if="getDiscountPercent(vinyl)" class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  🏷️ Скидка {{ getDiscountPercent(vinyl) }}%
                </div>
                <div v-if="cashbackPromotion" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                  💰 Кэшбэк {{ cashbackPromotion.cashback_percent }}%
                </div>
                <div v-if="bundlePromotion" class="text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-full">
                  🎁 {{ bundlePromotion.buy_quantity }}+{{ bundlePromotion.get_quantity }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="!loadingVinyls && filteredAndSortedVinyls.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Ничего не найдено</p>
          <p class="text-gray-400 dark:text-gray-500">Попробуйте изменить запрос</p>
        </div>
      </template>

      <!-- РЕЖИМ ОДНОЙ ПЛАСТИНКИ -->
      <template v-else>
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p class="mt-4 text-gray-500 dark:text-gray-400">Загрузка...</p>
        </div>

        <div v-else-if="vinyl" class="max-w-4xl mx-auto">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden">
            <div class="grid md:grid-cols-2 gap-8 p-6">
              <div class="aspect-square rounded-xl flex items-center justify-center overflow-hidden shadow-inner bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 border border-black dark:border-white">
                <img v-if="vinyl.image" :src="vinyl.image" class="w-full h-full object-cover" alt="Vinyl cover">
                <span v-else class="text-6xl">💿</span>
              </div>

              <div class="flex flex-col">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-full mb-4">
                      {{ vinyl.type === 'album' ? 'Альбом' : vinyl.type === 'single' ? 'Сингл' : 'EP' }}
                    </span>
                    <h1 class="text-3xl font-bold dark:text-white mb-2">{{ vinyl.title }}</h1>
                    <p class="text-xl text-gray-600 dark:text-gray-400 mb-4">{{ vinyl.artist }}</p>
                  </div>
                  <button 
                    @click="toggleFavorite(vinyl.id)"
                    class="p-2 rounded-full transition-colors"
                    :class="isVinylFavorite(vinyl.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'"
                    :title="isVinylFavorite(vinyl.id) ? 'Удалить из избранного' : 'Добавить в избранное'"
                  >
                    <span class="text-2xl">{{ isVinylFavorite(vinyl.id) ? '❤️' : '🤍' }}</span>
                  </button>
                </div>

                <div class="flex items-center gap-2 mb-4">
                  <div class="flex items-center gap-0.5">
                    <span v-for="star in 5" :key="star" class="text-lg">
                      {{ star <= vinylRating ? '⭐' : '☆' }}
                    </span>
                  </div>
                  <span class="text-sm text-gray-500 dark:text-gray-400">({{ vinylRating.toFixed(1) }}) • {{ vinylRatingsCount }} оценок</span>
                </div>

                <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-600 dark:text-gray-400">Цена:</span>
                    <div>
                      <span v-if="getDiscountedPrice(vinyl)" class="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {{ getDiscountedPrice(vinyl) }} ₽
                      </span>
                      <span v-else class="text-3xl font-black text-blue-600 dark:text-blue-400">
                        {{ vinyl.price }} ₽
                      </span>
                      <span v-if="getDiscountedPrice(vinyl)" class="text-sm text-gray-500 line-through ml-2">
                        {{ vinyl.price }} ₽
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-gray-600 dark:text-gray-400">Наличие:</span>
                    <div v-if="vinyl.stock === 0" class="text-red-600 dark:text-red-400 font-bold">НЕТ В НАЛИЧИИ!</div>
                    <div v-else class="text-green-600 dark:text-green-400 font-bold">В наличии: {{ vinyl.stock }} шт.</div>
                  </div>
                  <div v-if="vinyl.orders_count > 0" class="flex items-center justify-between mt-2">
                    <span class="text-gray-600 dark:text-gray-400">Продано:</span>
                    <span class="text-orange-600 dark:text-orange-400 font-bold">🔥 {{ vinyl.orders_count }} копий</span>
                  </div>
                </div>

                <div class="flex gap-4 mt-6">
                  <button 
                    v-if="!isAuthenticated"
                    @click="requireAuth('Войдите в аккаунт, чтобы добавить виниловую пластинку в корзину')"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🛒 Добавить в корзину
                  </button>
                  <button 
                    v-else-if="!isVinylInCart(vinyl.id) && vinyl.stock > 0"
                    @click="addToCart(vinyl)"
                    class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🛒 Добавить в корзину
                  </button>
                  <button 
                    v-else-if="vinyl.stock > 0"
                    disabled
                    class="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-bold cursor-not-allowed opacity-50"
                  >
                    ✓ В корзине
                  </button>
                  <button 
                    v-else
                    disabled
                    class="flex-1 bg-gray-400 text-white px-6 py-3 rounded-lg font-bold cursor-not-allowed opacity-50"
                  >
                    Нет в наличии
                  </button>
                  <button 
                    v-if="!isAuthenticated"
                    @click="requireAuth('Войдите в аккаунт, чтобы купить виниловую пластинку')"
                    :disabled="vinyl.stock === 0"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    💳 Купить сейчас
                  </button>
                  <button 
                    v-else
                    @click="buyNow(vinyl)"
                    :disabled="vinyl.stock === 0"
                    class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    💳 Купить сейчас
                  </button>
                </div>

                <div v-if="getDiscountPercent(vinyl) || cashbackPromotion || bundlePromotion" class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p class="font-semibold text-green-700 dark:text-green-300 mb-2">🎁 Действующие акции:</p>
                  <div class="flex flex-wrap gap-2">
                    <div v-if="getDiscountPercent(vinyl)" class="text-sm text-green-600 dark:text-green-400">
                      🏷️ Скидка {{ getDiscountPercent(vinyl) }}%
                    </div>
                    <div v-if="cashbackPromotion" class="text-sm text-purple-600 dark:text-purple-400">
                      💰 Кэшбэк {{ cashbackPromotion.cashback_percent }}%
                    </div>
                    <div v-if="bundlePromotion" class="text-sm text-purple-600 dark:text-purple-400">
                      🎁 {{ bundlePromotion.name }}: Купи {{ bundlePromotion.buy_quantity }}, получи {{ bundlePromotion.get_quantity }} бесплатно!
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-xl font-bold dark:text-white mb-4">📋 Характеристики</h3>
              <div class="grid md:grid-cols-2 gap-4 mb-6">
                <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Исполнитель:</span>
                  <span class="font-medium dark:text-white">{{ vinyl.artist }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Тип:</span>
                  <span class="font-medium dark:text-white">{{ vinyl.type === 'album' ? 'Альбом' : vinyl.type === 'single' ? 'Сингл' : 'EP' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                  <span class="text-gray-600 dark:text-gray-400">Год выпуска:</span>
                  <span class="font-medium dark:text-white">{{ vinyl.release_year || '—' }}</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-2">
                  <span class="text-gray-600 dark:text-gray-400 shrink-0">Жанр:</span>
                  <span class="font-medium dark:text-white break-words flex-1 text-right">{{ vinyl.genre || '—' }}</span>
                </div>
              </div>

              <h3 class="text-xl font-bold dark:text-white mb-4">📝 Описание</h3>
              <p class="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {{ vinyl.description || 'Описание отсутствует.' }}
              </p>

              <div v-if="parsedTracklist && parsedTracklist.length > 0" class="mt-6">
                <h3 class="text-xl font-bold dark:text-white mb-4">🎵 Треклист</h3>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div class="space-y-1">
                    <div v-for="(track, index) in parsedTracklist" :key="index" class="flex items-start gap-3 py-3 border-b border-gray-200 dark:border-gray-600 last:border-0">
                      <span class="text-gray-400 dark:text-gray-500 w-8 text-right shrink-0 pt-0.5">{{ index + 1 }}.</span>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                          <span class="font-medium text-gray-900 dark:text-white break-words">{{ track.title }}</span>
                          <span v-if="track.duration" class="text-gray-400 dark:text-gray-500 text-sm shrink-0 pt-0.5">{{ track.duration }}</span>
                        </div>
                        <span v-if="track.artist" class="text-gray-500 dark:text-gray-400 block text-sm mt-0.5">{{ track.artist }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-gray-200 dark:border-gray-700 p-6">
              <h3 class="text-xl font-bold dark:text-white mb-4">💬 Отзывы ({{ reviews.length }})</h3>
              
              <div v-if="reviews.length > 0" class="space-y-4 mb-6">
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
                  <p v-if="!review.is_approved" class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">⏳ На модерации</p>
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
                      placeholder="Поделитесь впечатлениями о пластинке..."
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

        <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 text-center max-w-2xl mx-auto">
          <p class="text-gray-500 dark:text-gray-400 mb-4">Пластинка не найдена</p>
          <router-link to="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold">Вернуться в каталог</router-link>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useFavoritesStore } from '../stores/favorites'
import { authApi } from '../api/auth'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()
const vinyl = ref(null)
const allVinyls = ref([])
const loading = ref(true)
const loadingVinyls = ref(true)
const reviews = ref([])
const submittingReview = ref(false)
const newReview = ref({ rating: 0, comment: '' })
const vinylRating = ref(0)
const vinylRatingsCount = ref(0)

const isAuthenticated = computed(() => !!authApi.getCurrentUser())

const savedFilterType = localStorage.getItem('vinyl-filter-type')
const savedSortType = localStorage.getItem('vinyl-sort-type')
const savedSortOrder = localStorage.getItem('vinyl-sort-order')

const filterType = ref(savedFilterType || 'all')
const sortType = ref(savedSortType || 'title')
const sortOrder = ref(savedSortOrder || 'asc')

const isSearchMode = computed(() => route.path === '/vinyl/search')
const searchQuery = computed(() => route.query.q || '')

const approvedReviews = computed(() => reviews.value.filter(r => r.is_approved))

const parsedTracklist = computed(() => {
  if (!vinyl.value?.tracklist) return []
  try {
    return JSON.parse(vinyl.value.tracklist)
  } catch (e) {
    return []
  }
})

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

const fetchVinylRating = async () => {
  if (!vinyl.value) return
  try {
    const response = await fetch(`http://localhost:3001/api/reviews/vinyl/${vinyl.value.id}`)
    if (response.ok) {
      const allReviews = await response.json()
      const approved = allReviews.filter(r => r.is_approved)
      if (approved.length > 0) {
        const sum = approved.reduce((acc, r) => acc + r.rating, 0)
        vinylRating.value = Math.round((sum / approved.length) * 10) / 10
        vinylRatingsCount.value = approved.length
      } else {
        vinylRating.value = 0
        vinylRatingsCount.value = 0
      }
    }
  } catch (error) {
    console.error('Ошибка загрузки рейтинга:', error)
  }
}

const fetchReviews = async () => {
  try {
    const response = await fetch(`http://localhost:3001/api/reviews/vinyl/${route.params.id}`)
    if (response.ok) {
      reviews.value = await response.json()
      console.log('✅ Загружено отзывов:', reviews.value.length)
      await fetchVinylRating()
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
        entity_type: 'vinyl',
        entity_id: vinyl.value.id,
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

const requireAuth = (message = 'Войдите в аккаунт, чтобы совершить это действие') => {
  alert(message)
  router.push('/login')
}

const getSortButtonText = computed(() => {
  if (sortType.value === 'title' || sortType.value === 'artist') {
    return sortOrder.value === 'asc' ? 'А-Я' : 'Я-А'
  } else {
    return sortOrder.value === 'asc' ? 'Сначала больше' : 'Сначала меньше'
  }
})

const filteredVinyls = computed(() => {
  if (!searchQuery.value) return allVinyls.value
  
  const query = searchQuery.value.toLowerCase()
  return allVinyls.value.filter(vinyl => 
    vinyl.title.toLowerCase().includes(query) || 
    vinyl.artist.toLowerCase().includes(query)
  )
})

const filteredByTypeVinyls = computed(() => {
  let filtered = filteredVinyls.value
  
  if (filterType.value !== 'all' && filterType.value !== 'inStock') {
    filtered = filtered.filter(v => v.type === filterType.value)
  }
  
  if (filterType.value === 'inStock') {
    filtered = filtered.filter(v => v.stock > 0)
  }
  
  return filtered
})

const filteredAndSortedVinyls = computed(() => {
  if (!filteredByTypeVinyls.value.length) return []
  
  const sorted = [...filteredByTypeVinyls.value].sort((a, b) => {
    let comparison = 0
    
    if (sortType.value === 'price') {
      const priceA = Number(a.price) || 0
      const priceB = Number(b.price) || 0
      comparison = priceB - priceA
    } 
    else if (sortType.value === 'stock') {
      comparison = (b.stock || 0) - (a.stock || 0)
    }
    else if (sortType.value === 'orders_count') {
      comparison = (b.orders_count || 0) - (a.orders_count || 0)
    }
    else {
      let aValue = a[sortType.value] || ''
      let bValue = b[sortType.value] || ''
      
      aValue = aValue.toString().toLowerCase()
      bValue = bValue.toString().toLowerCase()
      
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  
  return sorted
})

const saveSettings = () => {
  localStorage.setItem('vinyl-filter-type', filterType.value)
  localStorage.setItem('vinyl-sort-type', sortType.value)
  localStorage.setItem('vinyl-sort-order', sortOrder.value)
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
}

const highlightText = (text, query) => {
  if (!query || !text) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>')
}

const bundlePromotion = computed(() => cartStore.getBundlePromotion())
const cashbackPromotion = computed(() => cartStore.getCashbackPromotion())

const getDiscountedPrice = (vinylItem) => {
  if (!vinylItem) return null
  return cartStore.getDiscountedPrice(vinylItem)
}

const getDiscountPercent = (vinylItem) => {
  if (!vinylItem) return null
  return cartStore.getDiscountPercent(vinylItem)
}

const isVinylInCart = (id) => {
  return cartStore.isVinylInCart(id)
}

const isVinylFavorite = (id) => {
  return favoritesStore.isFavorite(id)
}

const toggleFavorite = async (id) => {
  if (!isAuthenticated.value) {
    alert('Войдите в аккаунт, чтобы добавить виниловую пластинку в избранное')
    router.push('/login')
    return
  }
  await favoritesStore.toggleFavorite(id)
}

const addToCart = (vinylItem) => {
  if (vinylItem && vinylItem.stock > 0) {
    cartStore.addVinyl({
      id: vinylItem.id,
      title: vinylItem.title,
      artist: vinylItem.artist,
      price: vinylItem.price,
      image: vinylItem.image,
      type: vinylItem.type,
      stock: vinylItem.stock
    })
    alert(`"${vinylItem.title}" добавлена в корзину!`)
  }
}

const buyNow = (vinylItem) => {
  if (vinylItem && vinylItem.stock > 0) {
    router.push({
      path: '/checkout',
      state: {
        directBuyItem: {
          id: vinylItem.id,
          title: vinylItem.title,
          artist: vinylItem.artist,
          price: vinylItem.price,
          image: vinylItem.image,
          type: vinylItem.type,
          stock: vinylItem.stock,
          isVinyl: true,
          quantity: 1
        }
      }
    })
  }
}

const saveVinylView = (vinylData) => {
  if (!vinylData) return
  
  const recentViews = localStorage.getItem('recent-views')
  let views = []
  
  if (recentViews) {
    try {
      views = JSON.parse(recentViews)
    } catch (e) {
      views = []
    }
  }
  
  views = views.filter(item => !(item.id === vinylData.id && item.type === 'vinyl'))
  
  views.unshift({
    id: vinylData.id,
    type: 'vinyl',
    title: vinylData.title,
    artist: vinylData.artist,
    image: vinylData.image,
    timestamp: new Date().toISOString()
  })
  
  if (views.length > 20) views = views.slice(0, 20)
  
  localStorage.setItem('recent-views', JSON.stringify(views))
}

const loadAllVinyls = async () => {
  loadingVinyls.value = true
  try {
    const response = await fetch('http://localhost:3001/api/vinyls')
    if (response.ok) {
      allVinyls.value = await response.json()
    }
  } catch (error) {
    console.error('Ошибка загрузки пластинок:', error)
  } finally {
    loadingVinyls.value = false
  }
}

const loadSingleVinyl = async () => {
  loading.value = true
  try {
    const response = await fetch(`http://localhost:3001/api/vinyls/${route.params.id}`)
    if (response.ok) {
      vinyl.value = await response.json()
      saveVinylView(vinyl.value)
      await fetchReviews()
    }
  } catch (error) {
    console.error('Ошибка загрузки:', error)
  } finally {
    loading.value = false
  }
}

watch([filterType, sortType, sortOrder], () => {
  saveSettings()
})

watch(() => route.query.q, async (newQuery, oldQuery) => {
  if (isSearchMode.value && newQuery !== oldQuery) {
    await loadAllVinyls()
  }
}, { immediate: true })

watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId && !isSearchMode.value) {
    await loadSingleVinyl()
  }
}, { immediate: true })

onMounted(async () => {
  await cartStore.loadPromotions()
  await favoritesStore.loadFavorites()
  
  if (isSearchMode.value) {
    await loadAllVinyls()
  } else if (route.params.id) {
    await loadSingleVinyl()
  } else {
    loading.value = false
    loadingVinyls.value = false
  }
})
</script>