<!-- src/views/CheckoutView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Кнопка назад -->
      <div class="mb-6">
        <button 
          @click="goBack"
          class="inline-flex items-center gap-2 px-6 py-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <span>← Назад</span>
        </button>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        Оформление заказа 🛒
      </h1>

      <!-- Пустая корзина -->
      <div v-if="!hasItems" class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400 text-xl mb-2">😕 Корзина пуста</p>
        <p class="text-gray-400 dark:text-gray-500 mb-6">Добавьте товары в корзину для оформления заказа</p>
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

        <form @submit.prevent="nextStep" class="p-6">
          
          <!-- ШАГ 1: Личные данные -->
          <div v-show="currentStep === 1" class="space-y-4">
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
                  required
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
                  required
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
                required
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
          </div>

          <!-- ШАГ 2: Выбор места получения / доставка -->
          <div v-show="currentStep === 2" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              📦 Выбор места получения
            </h3>

            <!-- Способ получения -->
            <div class="space-y-3">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="deliveryMethod === 'delivery' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="deliveryMethod" value="delivery" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-white">🚚 Доставка курьером</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Бесплатно при заказе от 3000 ₽</p>
                </div>
              </label>

              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="deliveryMethod" value="pickup" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-white">📍 Самовывоз из магазина</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Москва, ул. Пушкина, д. 9</p>
                </div>
              </label>
            </div>

            <!-- Адрес доставки (если выбрана доставка) -->
            <div v-if="deliveryMethod === 'delivery'" class="space-y-4 pt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Страна <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.country"
                  type="text"
                  required
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
                    required
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
                    required
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
                  required
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.address }"
                  @input="validateAddress"
                  placeholder="Ул. Пушкина, д. 9, кв. 44"
                >
                <p v-if="validationErrors.address" class="text-xs text-red-500 mt-1">{{ validationErrors.address }}</p>
                <p v-else class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Формат: Улица, д. номер, кв. номер (если есть)
                </p>
              </div>
            </div>

            <!-- Адрес для мероприятия (если есть услуги) -->
            <div v-if="hasServices" class="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 class="font-medium text-gray-900 dark:text-white">🎪 Адрес проведения мероприятия</h4>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Страна <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.eventCountry"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.eventCountry }"
                  @input="clearError('eventCountry')"
                  placeholder="Россия"
                >
                <p v-if="validationErrors.eventCountry" class="text-xs text-red-500 mt-1">{{ validationErrors.eventCountry }}</p>
              </div>

              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Город <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.eventCity"
                    type="text"
                    required
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventCity }"
                    @input="clearError('eventCity')"
                    placeholder="Москва"
                  >
                  <p v-if="validationErrors.eventCity" class="text-xs text-red-500 mt-1">{{ validationErrors.eventCity }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Индекс <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.eventZipCode"
                    type="text"
                    required
                    maxlength="6"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventZipCode }"
                    @input="validateEventZipCode"
                    placeholder="123456"
                  >
                  <p v-if="validationErrors.eventZipCode" class="text-xs text-red-500 mt-1">{{ validationErrors.eventZipCode }}</p>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Адрес <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.eventAddress"
                  type="text"
                  required
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.eventAddress }"
                  @input="validateEventAddress"
                  placeholder="Ул. Пушкина, д. 9"
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
                    required
                    :min="minDate"
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventDate }"
                    @change="validateEventDate"
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
                    required
                    class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    :class="{ 'border-red-500': validationErrors.eventTime }"
                    @change="validateEventTime"
                  >
                  <p v-if="validationErrors.eventTime" class="text-xs text-red-500 mt-1">{{ validationErrors.eventTime }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- ШАГ 3: Способ оплаты -->
          <div v-show="currentStep === 3" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              💳 Выбор способа оплаты
            </h3>

            <div class="space-y-3">
              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="paymentMethod === 'card' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="paymentMethod" value="card" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-white">💳 Банковская карта</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Visa, Mastercard, МИР</p>
                </div>
              </label>

              <label class="flex items-center p-4 border rounded-lg cursor-pointer transition-all"
                     :class="paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'">
                <input type="radio" v-model="paymentMethod" value="cash" class="w-5 h-5 text-blue-600">
                <div class="ml-3">
                  <span class="font-medium text-gray-900 dark:text-white">💵 Наличными при получении</span>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Только при самовывозе или курьерской доставке</p>
                </div>
              </label>
            </div>

            <!-- Данные карты (если выбрана оплата картой) -->
            <div v-if="paymentMethod === 'card'" class="space-y-4 pt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Владелец карты <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.cardHolder"
                  type="text"
                  required
                  placeholder="IVAN PETROV"
                  class="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  :class="{ 'border-red-500': validationErrors.cardHolder }"
                  @input="validateCardHolder"
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
                  required
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
                    required
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
                    required
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
          </div>

          <!-- ШАГ 4: Подтверждение заказа -->
          <div v-show="currentStep === 4" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              ✅ Подтверждение заказа
            </h3>

            <!-- Состав заказа -->
            <div class="space-y-3">
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-3">🛒 Ваш заказ</h4>
                
                <div class="space-y-2">
                  <div v-for="item in checkoutItems" :key="item.id" class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2">
                      <span>{{ item.isVinyl ? '💿' : '🎤' }}</span>
                      <span class="text-gray-700 dark:text-gray-300">
                        {{ item.title || item.name }}
                        <span v-if="item.artist" class="text-gray-500">— {{ item.artist }}</span>
                      </span>
                      <span class="text-gray-500">× {{ item.quantity }}</span>
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white">{{ item.finalPrice || item.price }} ₽</span>
                  </div>
                </div>

                <div class="border-t border-gray-200 dark:border-gray-600 mt-3 pt-3">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-900 dark:text-white">Итого:</span>
                    <span class="text-xl font-bold text-blue-600 dark:text-blue-400">{{ totalPrice }} ₽</span>
                  </div>
                </div>
              </div>

              <!-- Данные покупателя -->
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">👤 Покупатель</h4>
                <p class="text-gray-700 dark:text-gray-300">{{ form.firstName }} {{ form.lastName }}</p>
                <p class="text-gray-500 dark:text-gray-400 text-sm">{{ form.email }}</p>
              </div>

              <!-- Способ получения -->
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
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

              <!-- Способ оплаты -->
              <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 class="font-medium text-gray-900 dark:text-white mb-2">💳 Способ оплаты</h4>
                <p class="text-gray-700 dark:text-gray-300">
                  {{ paymentMethod === 'card' ? '💳 Банковская карта' : '💵 Наличными при получении' }}
                </p>
                <p v-if="paymentMethod === 'card'" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  **** **** **** {{ form.cardNumber.slice(-4) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Кнопки навигации -->
          <div class="flex gap-4 mt-8">
            <button 
              v-if="currentStep > 1"
              type="button"
              @click="prevStep"
              class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ← Назад
            </button>
            
            <button 
              v-if="currentStep < 4"
              type="submit"
              class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
            >
              Далее →
            </button>

            <button 
              v-if="currentStep === 4"
              type="button"
              @click="submitOrder"
              :disabled="submitting"
              class="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Оформление...' : '✅ Подтвердить заказ' }}
            </button>
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

// Шаги оформления
const steps = [
  { id: 1, name: 'Данные' },
  { id: 2, name: 'Доставка' },
  { id: 3, name: 'Оплата' },
  { id: 4, name: 'Подтверждение' }
]
const currentStep = ref(1)

// Способы доставки и оплаты
const deliveryMethod = ref('delivery')
const paymentMethod = ref('card')

// Валидация
const validationErrors = ref({})
const emailError = ref('')
const submitting = ref(false)

const minDate = new Date().toISOString().split('T')[0]

// Форма
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  city: '',
  zipCode: '',
  address: '',
  eventCountry: '',
  eventCity: '',
  eventZipCode: '',
  eventAddress: '',
  eventDate: '',
  eventTime: '',
  cardHolder: '',
  cardNumber: '',
  cardExpiry: '',
  cardCvv: ''
})

// Товары в корзине
const vinylItems = computed(() => cartStore.vinyls.map(v => ({ ...v, isVinyl: true, quantity: v.quantity || 1, finalPrice: v.price })))
const serviceItems = computed(() => cartStore.services.map(s => ({ ...s, isVinyl: false, quantity: 1, finalPrice: s.price })))
const checkoutItems = computed(() => [...vinylItems.value, ...serviceItems.value])
const hasItems = computed(() => checkoutItems.value.length > 0)
const hasServices = computed(() => serviceItems.value.length > 0)

const totalPrice = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (item.finalPrice * (item.quantity || 1)), 0)
})

// Заполнение формы данными пользователя
const fillUserData = () => {
  if (currentUser) {
    form.value.firstName = currentUser.first_name || ''
    form.value.lastName = currentUser.last_name || ''
    form.value.email = currentUser.email || ''
  }
}

// Навигация
const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.push('/cart')
  }
}

const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < 4) {
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Валидация текущего шага
const validateCurrentStep = () => {
  clearAllErrors()
  
  if (currentStep.value === 1) {
    if (!form.value.firstName) validationErrors.value.firstName = 'Имя обязательно'
    if (!form.value.lastName) validationErrors.value.lastName = 'Фамилия обязательна'
    validateEmail()
    return !validationErrors.value.firstName && !validationErrors.value.lastName && isEmailValid.value
  }
  
  if (currentStep.value === 2) {
    if (deliveryMethod.value === 'delivery') {
      if (!form.value.country) validationErrors.value.country = 'Страна обязательна'
      if (!form.value.city) validationErrors.value.city = 'Город обязателен'
      validateZipCode()
      validateAddress()
      return !validationErrors.value.country && !validationErrors.value.city && 
             !validationErrors.value.zipCode && !validationErrors.value.address
    }
    
    if (hasServices.value) {
      if (!form.value.eventCountry) validationErrors.value.eventCountry = 'Страна обязательна'
      if (!form.value.eventCity) validationErrors.value.eventCity = 'Город обязателен'
      if (!form.value.eventDate) validationErrors.value.eventDate = 'Дата обязательна'
      if (!form.value.eventTime) validationErrors.value.eventTime = 'Время обязательно'
      validateEventZipCode()
      validateEventAddress()
      return !validationErrors.value.eventCountry && !validationErrors.value.eventCity &&
             !validationErrors.value.eventZipCode && !validationErrors.value.eventAddress &&
             !validationErrors.value.eventDate && !validationErrors.value.eventTime
    }
    
    return true
  }
  
  if (currentStep.value === 3) {
    if (paymentMethod.value === 'card') {
      validateCardHolder()
      validateCardNumber()
      formatCardExpiry({ target: { value: form.value.cardExpiry } })
      validateCvv()
      return !validationErrors.value.cardHolder && !validationErrors.value.cardNumber &&
             !validationErrors.value.cardExpiry && !validationErrors.value.cardCvv
    }
    return true
  }
  
  return true
}

const clearError = (field) => {
  delete validationErrors.value[field]
}

const clearAllErrors = () => {
  validationErrors.value = {}
}

// Валидация email
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

// Валидация адреса
const validateZipCode = () => {
  const zip = form.value.zipCode.replace(/\D/g, '')
  if (zip.length !== 6) {
    validationErrors.value.zipCode = 'Индекс должен содержать 6 цифр'
  } else {
    delete validationErrors.value.zipCode
  }
  form.value.zipCode = zip
}

const validateAddress = () => {
  const address = form.value.address
  const addressPattern = /^[А-Яа-я\s\.]+,\s*д\.\s*\d+(?:\s*,\s*кв\.\s*\d+)?$/i
  
  if (!address) {
    validationErrors.value.address = 'Адрес обязателен'
  } else if (!addressPattern.test(address)) {
    validationErrors.value.address = 'Формат: Улица, д. номер, кв. номер'
  } else {
    delete validationErrors.value.address
  }
}

const validateEventZipCode = () => {
  const zip = form.value.eventZipCode.replace(/\D/g, '')
  if (zip.length !== 6) {
    validationErrors.value.eventZipCode = 'Индекс должен содержать 6 цифр'
  } else {
    delete validationErrors.value.eventZipCode
  }
  form.value.eventZipCode = zip
}

const validateEventAddress = () => {
  const address = form.value.eventAddress
  const addressPattern = /^[А-Яа-я\s\.]+,\s*д\.\s*\d+(?:,\s*кв\.\s*\d+)?$/i
  
  if (!address) {
    validationErrors.value.eventAddress = 'Адрес обязателен'
  } else if (!addressPattern.test(address)) {
    validationErrors.value.eventAddress = 'Формат: Улица, д. номер'
  } else {
    delete validationErrors.value.eventAddress
  }
}

const validateEventDate = () => {
  const selectedDate = new Date(form.value.eventDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (selectedDate < today) {
    validationErrors.value.eventDate = 'Дата не может быть в прошлом'
  } else {
    delete validationErrors.value.eventDate
  }
}

const validateEventTime = () => {
  if (!form.value.eventTime) {
    validationErrors.value.eventTime = 'Время обязательно'
  } else {
    delete validationErrors.value.eventTime
  }
}

// Валидация карты
const validateCardHolder = () => {
  const holder = form.value.cardHolder
  const holderPattern = /^[A-Z\s\.]+$/i
  
  if (!holder) {
    validationErrors.value.cardHolder = 'Владелец карты обязателен'
  } else if (!holderPattern.test(holder)) {
    validationErrors.value.cardHolder = 'Только латиница'
  } else {
    delete validationErrors.value.cardHolder
  }
}

const validateCardNumber = () => {
  const number = form.value.cardNumber.replace(/\s/g, '')
  if (number.length !== 16) {
    validationErrors.value.cardNumber = 'Номер карты должен содержать 16 цифр'
  } else {
    delete validationErrors.value.cardNumber
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

const formatCardNumber = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  const parts = []
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.slice(i, i + 4))
  }
  form.value.cardNumber = parts.join(' ')
  validateCardNumber()
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
    const month = parseInt(value.slice(0, 2))
    const year = parseInt('20' + value.slice(2))
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (month < 1 || month > 12) {
      validationErrors.value.cardExpiry = 'Неверный месяц'
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      validationErrors.value.cardExpiry = 'Карта просрочена'
    } else {
      delete validationErrors.value.cardExpiry
    }
  } else {
    validationErrors.value.cardExpiry = 'Введите ММ/ГГ'
  }
}

const getClientTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (e) {
    return 'Europe/Moscow'
  }
}

// Отправка заказа
const submitOrder = async () => {
  if (!validateCurrentStep()) {
    alert('Пожалуйста, проверьте правильность заполнения формы')
    return
  }

  submitting.value = true
  
  try {
    const clientTimeZone = getClientTimeZone()
    const clientTimestamp = Date.now()
    
    const orderData = {
      type: checkoutItems.value.some(i => i.isVinyl) ? 'vinyl' : 'service',
      items: checkoutItems.value.map(item => ({
        id: item.id,
        title: item.title,
        name: item.name,
        artist: item.artist,
        price: item.price,
        quantity: item.quantity || 1,
        finalPrice: item.finalPrice || item.price
      })),
      customer: {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        email: form.value.email
      },
      payment: {
        method: paymentMethod.value,
        cardNumber: paymentMethod.value === 'card' ? form.value.cardNumber.replace(/\s/g, '').slice(-4) : null,
        cardHolder: paymentMethod.value === 'card' ? form.value.cardHolder : null
      },
      delivery: {
        method: deliveryMethod.value,
        country: deliveryMethod.value === 'delivery' ? form.value.country : null,
        city: deliveryMethod.value === 'delivery' ? form.value.city : null,
        zipCode: deliveryMethod.value === 'delivery' ? form.value.zipCode : null,
        address: deliveryMethod.value === 'delivery' ? form.value.address : null
      },
      total: totalPrice.value,
      userEmail: currentUser?.email,
      clientTimestamp: clientTimestamp,
      clientTimeZone: clientTimeZone
    }

    // Добавляем мероприятие если есть услуги
    if (hasServices.value) {
      orderData.event = {
        country: form.value.eventCountry,
        city: form.value.eventCity,
        zipCode: form.value.eventZipCode,
        address: form.value.eventAddress,
        date: form.value.eventDate,
        time: form.value.eventTime
      }
    }

    console.log('📦 Отправка заказа:', orderData)

    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    })

    const result = await response.json()

    if (response.ok && result.success) {
      alert('✅ Заказ успешно оформлен! Проверьте почту для подтверждения.')
      
      // Очищаем корзину
      cartStore.clearCart()
      
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
  fillUserData()
  
  // Если корзина пуста, перенаправляем
  if (!hasItems.value) {
    // Оставляем на странице, показываем сообщение
  }
})
</script>