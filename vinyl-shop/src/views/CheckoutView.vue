<!-- src/views/CheckoutView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Кнопка назад -->
      <div class="mb-6">
        <button 
          @click="goBack"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray dark:text-gray hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад</span>
        </button>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Оформление заказа 🛒
      </h1>

      <!-- Пустая корзина -->
      <div v-if="!hasItems" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Нет товаров для оформления</p>
        <p class="text-gray-400 dark:text-gray-500 mb-6">Добавьте товары для оформления заказа</p>
        <router-link to="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
          Перейти в каталог
        </router-link>
      </div>

      <!-- Форма оформления заказа -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white overflow-hidden">
        
        <!-- Прогресс-бар -->
        <div class="p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-center gap-2">
            <div 
              v-for="(step, index) in steps" 
              :key="step.id"
              class="flex items-center"
            >
              <div 
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors"
                :class="{
                  'bg-blue-600 text-white': currentStep >= step.id,
                  'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400': currentStep < step.id
                }"
              >
                {{ index + 1 }}
              </div>
              <span 
                class="ml-2 text-sm hidden sm:inline"
                :class="{
                  'text-gray-900 dark:text-white font-medium': currentStep >= step.id,
                  'text-gray-400 dark:text-gray-500': currentStep < step.id
                }"
              >
                {{ step.name }}
              </span>
              <span v-if="index < steps.length - 1" class="w-12 h-0.5 mx-2 bg-gray-200 dark:bg-gray-700"></span>
            </div>
          </div>
        </div>

        <form @submit.prevent="nextStep">
          
          <!-- ШАГ 1: Личные данные -->
          <div v-show="currentStep === 1" class="p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              👤 Данные покупателя
            </h3>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Имя <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.firstName"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.firstName }"
                  @input="clearError('firstName')"
                >
                <p v-if="validationErrors.firstName" class="text-xs text-red-500 mt-1">{{ validationErrors.firstName }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Фамилия <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.lastName"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.lastName }"
                  @input="clearError('lastName')"
                >
                <p v-if="validationErrors.lastName" class="text-xs text-red-500 mt-1">{{ validationErrors.lastName }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email для уведомления <span class="text-red-500">*</span>
              </label>
              <input 
                v-model="form.email"
                type="email"
                placeholder="ivan@yandex.ru"
                class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                :class="{ 'border-red-500': emailError || validationErrors.email }"
                @input="validateEmail"
              >
              <p v-if="emailError" class="text-xs text-red-500 mt-1">{{ emailError }}</p>
              <p v-if="validationErrors.email" class="text-xs text-red-500 mt-1">{{ validationErrors.email }}</p>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                На этот email придет подтверждение заказа
              </p>
            </div>

            <div v-if="!isAuthenticated" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p class="text-sm text-blue-700 dark:text-blue-400">
                💡 Совет: <router-link to="/login" class="font-medium underline">Войдите в аккаунт</router-link>, чтобы отслеживать статус заказа и получать бонусы!
              </p>
            </div>

            <!-- Кнопки -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                @click="nextStep"
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Далее →
              </button>
            </div>
          </div>

          <!-- ШАГ 2: Товар и доставка -->
          <div v-show="currentStep === 2" class="p-6 space-y-4">
            
            <!-- Информация о товаре -->
            <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">🛒 Ваш заказ</h3>
              
              <div v-for="(item, index) in checkoutItems" :key="item.id + (item.isVinyl ? 'vinyl' : 'service') + index" class="border-b border-gray-200 dark:border-gray-600 last:border-0 pb-4 mb-4 last:pb-0 last:mb-0">
                <div class="flex items-start gap-4">
                  <div class="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="item.image" :src="item.image" class="w-full h-full object-cover">
                    <span v-else class="text-2xl">{{ item.isVinyl ? '💿' : '🎤' }}</span>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ item.isVinyl ? item.title : (item.artist ? `Заказать на мероприятие артиста ${item.name}` : item.name) }}
                    </p>
                    <p v-if="item.isVinyl && item.artist" class="text-sm text-gray-500 dark:text-gray-400">{{ item.artist }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ item.isVinyl ? 'Пластинка' : 'Услуга' }}
                    </p>
                    
                    <!-- Выбор количества для пластинок -->
                    <div v-if="item.isVinyl" class="flex items-center gap-3 mt-3">
                      <span class="text-sm text-gray-600 dark:text-gray-400">Количество:</span>
                      <div class="flex items-center gap-2">
                        <button 
                          type="button"
                          @click="decreaseQuantity(index)"
                          class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors"
                          :disabled="item.quantity <= 1"
                        >
                          −
                        </button>
                        <span class="w-10 text-center font-bold text-gray-900 dark:text-white">
                          {{ item.quantity }}
                        </span>
                        <button 
                          type="button"
                          @click="increaseQuantity(index)"
                          class="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg text-lg font-bold transition-colors"
                          :disabled="item.quantity >= (item.stock || 99)"
                        >
                          +
                        </button>
                      </div>
                      <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">Доступно: {{ item.stock || 0 }} шт.</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-blue-600 dark:text-blue-400">{{ (item.price * item.quantity).toLocaleString() }} ₽</p>
                    <p v-if="item.isVinyl && item.quantity > 1" class="text-xs text-gray-500">{{ item.price }} ₽ × {{ item.quantity }}</p>
                  </div>
                </div>
              </div>
              
              <div class="border-t border-gray-200 dark:border-gray-600 mt-4 pt-4">
                <div class="flex justify-between items-center">
                  <span class="font-medium text-gray-900 dark:text-white">Итого:</span>
                  <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ totalPrice.toLocaleString() }} ₽</span>
                </div>
              </div>
            </div>

            <!-- Выбор доставки ТОЛЬКО для пластинок -->
            <template v-if="hasVinyls">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                📦 Выбор места получения
              </h3>

              <div class="space-y-3">
                <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                       :class="deliveryMethod === 'delivery' ? 'border-blue-500 bg-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                  <input type="radio" v-model="deliveryMethod" value="delivery" class="w-5 h-5 text-blue-600">
                  <div class="ml-3">
                    <span class="font-medium text-gray-900 dark:text-white">🚚 Доставка курьером</span>
                    <p class="text-sm text-black dark:text-white">Бесплатно при заказе от 3000 ₽</p>
                  </div>
                </label>

                <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                       :class="deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                  <input type="radio" v-model="deliveryMethod" value="pickup" class="w-5 h-5 text-blue-600">
                  <div class="ml-3">
                    <span class="font-medium text-gray-900 dark:text-white">📍 Самовывоз из магазина</span>
                    <p class="text-sm text-black dark:text-white">Г. Москва, ул. Пушкина, д. 9</p>
                  </div>
                </label>
              </div>

              <!-- Адрес доставки -->
              <div v-if="deliveryMethod === 'delivery'" class="space-y-4 pt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Страна <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.country"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.country }"
                    @input="clearError('country')"
                    placeholder="Россия"
                  >
                  <p v-if="validationErrors.country" class="text-xs text-red-500 mt-1">{{ validationErrors.country }}</p>
                </div>

                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Город <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.city"
                      type="text"
                      class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      :class="{ 'border-red-500': validationErrors.city }"
                      @input="clearError('city')"
                      placeholder="Москва"
                    >
                    <p v-if="validationErrors.city" class="text-xs text-red-500 mt-1">{{ validationErrors.city }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Индекс <span class="text-red-500">*</span>
                    </label>
                    <input 
                      v-model="form.zipCode"
                      type="text"
                      maxlength="6"
                      class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      :class="{ 'border-red-500': validationErrors.zipCode }"
                      @input="validateZipCode"
                      placeholder="123456"
                    >
                    <p v-if="validationErrors.zipCode" class="text-xs text-red-500 mt-1">{{ validationErrors.zipCode }}</p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Адрес <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.address"
                    type="text"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.address }"
                    @input="clearError('address')"
                    placeholder="Г. Переметьево, ул. Пушкина, д. 9, кв. 22"
                  >
                  <p v-if="validationErrors.address" class="text-xs text-red-500 mt-1">{{ validationErrors.address }}</p>
                </div>
              </div>
            </template>

            <!-- Дата и время для услуги -->
            <div v-if="hasServices" class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="font-medium text-gray-900 dark:text-white">🎪 Детали мероприятия</h4>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Адрес проведения <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.eventAddress"
                  type="text"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.eventAddress }"
                  @input="clearError('eventAddress')"
                  placeholder="Г. Переметьево, ул. Пушкина, д. 9, кв. 22"
                >
                <p v-if="validationErrors.eventAddress" class="text-xs text-red-500 mt-1">{{ validationErrors.eventAddress }}</p>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Дата <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.eventDate"
                    type="date"
                    :min="minDate"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventDate }"
                    @change="clearError('eventDate')"
                  >
                  <p v-if="validationErrors.eventDate" class="text-xs text-red-500 mt-1">{{ validationErrors.eventDate }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Время <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.eventTime"
                    type="time"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventTime }"
                    @change="clearError('eventTime')"
                  >
                  <p v-if="validationErrors.eventTime" class="text-xs text-red-500 mt-1">{{ validationErrors.eventTime }}</p>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                @click="prevStep"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
              >
                ← Назад
              </button>
              <button 
                type="button"
                @click="nextStep"
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Далее →
              </button>
            </div>
          </div>

          <!-- ШАГ 3: Способ оплаты -->
          <div v-show="currentStep === 3" class="p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              💳 Выбор способа оплаты
            </h3>

            <div class="space-y-3">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="paymentMethod" value="card" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-white">💳 Банковская карта</span>
                  <p class="text-sm text-black dark:text-white">Visa, Mastercard, МИР</p>
                </div>
              </label>

              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="paymentMethod === 'cash' ? 'border-blue-500 bg-blue-500 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="paymentMethod" value="cash" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-black">💵 Наличными при получении</span>
                  <p class="text-sm text-black dark:text-white">Только при самовывозе или курьерской доставке</p>
                </div>
              </label>
            </div>

            <!-- Данные карты -->
            <div v-if="paymentMethod === 'card'" class="space-y-4 pt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Владелец карты <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.cardHolder"
                  type="text"
                  placeholder="IVAN PETROV"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.cardHolder }"
                  @input="clearError('cardHolder')"
                >
                <p v-if="validationErrors.cardHolder" class="text-xs text-red-500 mt-1">{{ validationErrors.cardHolder }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Номер карты <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.cardNumber"
                  type="text"
                  maxlength="19"
                  placeholder="1234 5678 9012 3456"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.cardNumber }"
                  @input="formatCardNumber"
                >
                <p v-if="validationErrors.cardNumber" class="text-xs text-red-500 mt-1">{{ validationErrors.cardNumber }}</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ММ/ГГ <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.cardExpiry"
                    type="text"
                    maxlength="5"
                    placeholder="MM/YY"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.cardExpiry }"
                    @input="formatCardExpiry"
                  >
                  <p v-if="validationErrors.cardExpiry" class="text-xs text-red-500 mt-1">{{ validationErrors.cardExpiry }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    CVV <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.cardCvv"
                    type="text"
                    maxlength="3"
                    placeholder="123"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.cardCvv }"
                    @input="validateCvv"
                  >
                  <p v-if="validationErrors.cardCvv" class="text-xs text-red-500 mt-1">{{ validationErrors.cardCvv }}</p>
                </div>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                @click="prevStep"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
              >
                ← Назад
              </button>
              <button 
                type="button"
                @click="nextStep"
                class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Далее →
              </button>
            </div>
          </div>

          <!-- ШАГ 4: Подтверждение оформления заказа -->
          <div v-show="currentStep === 4" class="p-6 space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              ✅ Подтверждение оформления заказа
            </h3>

            <div class="space-y-3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">🛒 Ваш заказ</h4>
                
                <div class="space-y-2">
                  <div v-for="(item, index) in checkoutItems" :key="item.id + (item.isVinyl ? 'vinyl' : 'service') + index" class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <span>{{ item.isVinyl ? '💿' : '🎤' }}</span>
                      <span class="text-gray-700 dark:text-gray-300">
                        {{ item.isVinyl ? item.title : (item.artist ? `Заказать на мероприятие артиста ${item.name}` : item.name) }}
                        <span v-if="item.isVinyl && item.artist" class="text-gray-500">— {{ item.artist }}</span>
                      </span>
                      <span v-if="item.isVinyl" class="text-gray-500">× {{ item.quantity }}</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ (item.price * item.quantity).toLocaleString() }} ₽</span>
                  </div>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900 dark:text-white">Итого:</span>
                    <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ totalPrice.toLocaleString() }} ₽</span>
                  </div>
                </div>
              </div>

              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">👤 Покупатель</h4>
                <p class="text-gray-700 dark:text-gray-300">{{ form.firstName }} {{ form.lastName }}</p>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{{ form.email }}</p>
              </div>

              <div v-if="hasVinyls" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">📦 Способ получения</h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ deliveryMethod === 'delivery' ? '🚚 Доставка курьером' : '📍 Самовывоз из магазина' }}
                </p>
                <div v-if="deliveryMethod === 'delivery'" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ form.country }}, {{ form.city }}, {{ form.zipCode }}<br>
                  {{ form.address }}
                </div>
                <div v-else class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Москва, ул. Пушкина, д. 9
                </div>
              </div>

              <div v-if="hasServices" class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">🎪 Детали мероприятия</h4>
                <p class="text-gray-700 dark:text-gray-300">{{ form.eventAddress }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ form.eventDate }} в {{ form.eventTime }}
                </p>
              </div>

              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">💳 Способ оплаты</h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ paymentMethod === 'card' ? '💳 Банковская карта' : '💵 Наличными при получении' }}
                </p>
                <p v-if="paymentMethod === 'card' && form.cardNumber" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  **** **** **** {{ form.cardNumber.slice(-4) }}
                </p>
              </div>
            </div>

            <!-- Кнопки -->
            <div class="flex gap-4 pt-4">
              <button 
                type="button"
                @click="prevStep"
                class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-500 dark:hover:bg-gray-700 transition-colors"
              >
                ← Назад
              </button>
              <button 
                type="button"
                @click="submitOrder"
                :disabled="submitting"
                class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {{ submitting ? 'Оформление...' : '✅ Подтвердить оформление заказа' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { authApi } from '../api/auth'

const router = useRouter()
const cartStore = useCartStore()

const currentUser = authApi.getCurrentUser()
const isAuthenticated = computed(() => !!currentUser)

const steps = [
  { id: 1, name: 'Данные' },
  { id: 2, name: 'Доставка' },
  { id: 3, name: 'Оплата' },
  { id: 4, name: 'Подтверждение' }
]
const currentStep = ref(1)

const deliveryMethod = ref('delivery')
const paymentMethod = ref('card')

const validationErrors = ref({})
const emailError = ref('')
const submitting = ref(false)

const minDate = new Date().toISOString().split('T')[0]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  city: '',
  zipCode: '',
  address: '',
  eventAddress: '',
  eventDate: '',
  eventTime: '',
  cardHolder: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: ''
})

const directBuyItem = ref(null)
const selectedItemsFromCart = ref([])
const checkoutItems = ref([])

const hasItems = computed(() => checkoutItems.value.length > 0)
const hasVinyls = computed(() => checkoutItems.value.some(item => item.isVinyl))
const hasServices = computed(() => checkoutItems.value.some(item => !item.isVinyl))

const totalPrice = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const increaseQuantity = (index) => {
  const item = checkoutItems.value[index]
  if (item.isVinyl && item.quantity < (item.stock || 99)) {
    item.quantity++
  }
}

const decreaseQuantity = (index) => {
  const item = checkoutItems.value[index]
  if (item.isVinyl && item.quantity > 1) {
    item.quantity--
  }
}

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    if (directBuyItem.value) {
      router.go(-1)
    } else {
      router.push('/cart')
    }
  }
}

const nextStep = () => {
  if (currentStep.value === 1) {
    if (!validateStep1()) return
  } else if (currentStep.value === 2) {
    if (!validateStep2()) return
  } else if (currentStep.value === 3) {
    if (!validateStep3()) return
  }
  
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const validateStep1 = () => {
  clearAllErrors()
  
  if (!form.value.firstName) validationErrors.value.firstName = 'Имя обязательно'
  if (!form.value.lastName) validationErrors.value.lastName = 'Фамилия обязательна'
  validateEmail()
  
  return !validationErrors.value.firstName && !validationErrors.value.lastName && isEmailValid.value
}

const validateStep2 = () => {
  clearAllErrors()
  
  if (hasVinyls.value && deliveryMethod.value === 'delivery') {
    if (!form.value.country) validationErrors.value.country = 'Страна обязательна'
    if (!form.value.city) validationErrors.value.city = 'Город обязателен'
    if (!form.value.zipCode || form.value.zipCode.length !== 6) {
      validationErrors.value.zipCode = 'Индекс должен содержать 6 цифр'
    }
    if (!form.value.address) validationErrors.value.address = 'Адрес обязателен'
    
    if (validationErrors.value.country || validationErrors.value.city || 
        validationErrors.value.zipCode || validationErrors.value.address) {
      return false
    }
  }
  
  if (hasServices.value) {
    if (!form.value.eventAddress) validationErrors.value.eventAddress = 'Адрес обязателен'
    if (!form.value.eventDate) validationErrors.value.eventDate = 'Дата обязательна'
    if (!form.value.eventTime) validationErrors.value.eventTime = 'Время обязательно'
    
    if (validationErrors.value.eventAddress || validationErrors.value.eventDate || 
        validationErrors.value.eventTime) {
      return false
    }
  }
  
  return true
}

const validateStep3 = () => {
  clearAllErrors()
  
  if (paymentMethod.value === 'card') {
    if (!form.value.cardHolder) validationErrors.value.cardHolder = 'Владелец карты обязателен'
    if (!form.value.cardNumber || form.value.cardNumber.replace(/\s/g, '').length !== 16) {
      validationErrors.value.cardNumber = 'Номер карты должен содержать 16 цифр'
    }
    if (!form.value.cardExpiry || form.value.cardExpiry.length < 5) {
      validationErrors.value.cardExpiry = 'Введите ММ/ГГ'
    }
    if (!form.value.cardCvv || form.value.cardCvv.length !== 3) {
      validationErrors.value.cardCvv = 'CVV должен содержать 3 цифры'
    }
    
    if (validationErrors.value.cardHolder || validationErrors.value.cardNumber ||
        validationErrors.value.cardExpiry || validationErrors.value.cardCvv) {
      return false
    }
  }
  
  return true
}

const clearError = (field) => {
  delete validationErrors.value[field]
}

const clearAllErrors = () => {
  validationErrors.value = {}
}

const validateEmail = () => {
  const email = form.value.email.toLowerCase()
  const validDomains = ['@yandex.ru', '@ya.ru', '@yandex.ua', '@yandex.by', '@yandex.kz', '@yandex.com']
  const hasValidDomain = validDomains.some(domain => email.endsWith(domain))
  
  if (!email) {
    emailError.value = ''
    validationErrors.value.email = 'Email обязателен'
  } else if (!hasValidDomain) {
    emailError.value = 'Только Яндекс Почта'
  } else {
    emailError.value = ''
    delete validationErrors.value.email
  }
}

const isEmailValid = computed(() => {
  return form.value.email && !emailError.value && !validationErrors.value.email
})

const validateZipCode = () => {
  const zip = form.value.zipCode.replace(/\D/g, '')
  if (zip.length !== 6) {
    validationErrors.value.zipCode = 'Индекс должен содержать 6 цифр'
  } else {
    delete validationErrors.value.zipCode
  }
  form.value.zipCode = zip
}

const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  const parts = []
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.slice(i, i + 4))
  }
  form.value.cardNumber = parts.join(' ')
  
  if (value.length === 16) {
    delete validationErrors.value.cardNumber
  }
}

const formatCardExpiry = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  
  if (value.length >= 3) {
    form.value.cardExpiry = value.slice(0, 2) + '/' + value.slice(2)
  } else if (value.length === 2) {
    form.value.cardExpiry = value + '/'
  } else {
    form.value.cardExpiry = value
  }
  
  if (value.length === 4) {
    delete validationErrors.value.cardExpiry
  }
}

const validateCvv = () => {
  const cvv = form.value.cardCvv.replace(/\D/g, '')
  if (cvv.length !== 3) {
    validationErrors.value.cardCvv = 'CVV должен содержать 3 цифры'
  } else {
    delete validationErrors.value.cardCvv
  }
  form.value.cardCvv = cvv
}

const getClientTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    return 'Europe/Moscow'
  }
}

// Функция для обновления счётчика заказов
const updateOrdersCount = (item) => {
  if (!item || item.isVinyl) return // Обновляем только для услуг/артистов
  
  const key = `orders-count-${item.id}`
  const saved = localStorage.getItem('orders-counts')
  let counts = saved ? JSON.parse(saved) : {}
  counts[key] = (counts[key] || 0) + 1
  localStorage.setItem('orders-counts', JSON.stringify(counts))
  console.log(`📦 Счётчик заказов обновлён для ${item.name || item.title}: ${counts[key]}`)
}

const submitOrder = async () => {
  if (!validateStep1() || !validateStep2() || !validateStep3()) {
    alert('Пожалуйста, проверьте правильность заполнения формы')
    return
  }

  submitting.value = true
  
  try {
    const clientTimeZone = getClientTimeZone()
    const clientTimestamp = Date.now()
    
    const cardLast4 = paymentMethod.value === 'card' 
      ? form.value.cardNumber.replace(/\s/g, '').slice(-4) 
      : '0000'
    
    const cardHolder = paymentMethod.value === 'card' 
      ? form.value.cardHolder 
      : 'Наличные'
    
    const orderData = {
      type: hasVinyls.value ? 'vinyl' : 'service',
      items: checkoutItems.value.map(item => ({
        id: item.id,
        title: item.title,
        name: item.name,
        artist: item.artist,
        price: item.price,
        quantity: item.quantity
      })),
      customer: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email
      },
      payment: {
        method: paymentMethod.value,
        card_last4: cardLast4,
        card_holder: cardHolder
      },
      total: totalPrice.value,
      user_email: currentUser?.email || null,
      clientTimestamp: clientTimestamp,
      clientTimeZone: clientTimeZone
    }

    if (hasVinyls.value) {
      orderData.delivery = {
        method: deliveryMethod.value,
        country: deliveryMethod.value === 'delivery' ? form.value.country : '',
        city: deliveryMethod.value === 'delivery' ? form.value.city : '',
        zipCode: deliveryMethod.value === 'delivery' ? form.value.zipCode : '',
        address: deliveryMethod.value === 'delivery' ? form.value.address : ''
      }
    }

    if (hasServices.value) {
      orderData.event = {
        address: form.value.eventAddress || '',
        date: form.value.eventDate || '',
        time: form.value.eventTime || ''
      }
    }

    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      // Обновляем счётчики заказов для услуг/артистов
      checkoutItems.value.forEach(item => {
        updateOrdersCount(item)
      })
      
      alert('✅ Заказ успешно оформлен! Проверьте почту для подтверждения.')
      
      if (!directBuyItem.value) {
        cartStore.clearCart()
      }
      
      router.push('/my-orders')
    } else {
      throw new Error(result.message || 'Ошибка при оформлении заказа')
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
    alert('❌ Ошибка при оформлении заказа: ' + error.message)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // Проверяем, пришли ли выбранные товары из корзины
  if (history.state && history.state.selectedItems) {
    selectedItemsFromCart.value = history.state.selectedItems
    checkoutItems.value = [...history.state.selectedItems]
    console.log('📦 Выбранные товары из корзины:', checkoutItems.value)
  } else if (history.state && history.state.directBuyItem) {
    // Прямая покупка одного товара
    directBuyItem.value = history.state.directBuyItem
    checkoutItems.value = [{ ...history.state.directBuyItem, quantity: 1 }]
    console.log('📦 Прямой товар для покупки:', directBuyItem.value)
  } else {
    // Загружаем все товары из корзины
    const vinyls = (cartStore.vinylItems || []).map(v => ({ ...v, isVinyl: true, quantity: v.quantity || 1 }))
    const services = (cartStore.serviceItems || []).map(s => ({ ...s, isVinyl: false, quantity: 1 }))
    checkoutItems.value = [...vinyls, ...services]
  }
})
</script>