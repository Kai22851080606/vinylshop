<!-- src/components/Footer.vue -->
<template>
  <footer class="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-16">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        <!-- О магазине -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">RPM Media</h3>
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            vinyl-shop - магазин виниловых пластинок, работающий с 2026 года: от легендарных альбомов прошлого века до современных релизов.
          </p>
          <div class="mt-4 space-y-1 text-sm text-gray-500 dark:text-gray-400">
            <p class="flex items-center gap-2">
              <span>🎵</span> Каждая пластинка радует звуком
            </p>
            <p class="flex items-center gap-2">
              <span>📦</span> Заказы доезжают целыми
            </p>
            <p class="flex items-center gap-2">
              <span>💬</span> Вы возвращаетесь к нам снова
            </p>
          </div>
        </div>

        <!-- Контакты -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Контакты</h3>
          <ul class="space-y-3 text-sm">
            <li>
              <a href="tel:+79279429707" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                <span class="text-lg">📞</span> +7 (927) 942-97-07
              </a>
            </li>
            <li>
              <a href="mailto:info@vinyl-shop.ru" class="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2">
                <span class="text-lg">✉️</span> info@vinyl-shop.ru
              </a>
            </li>
            <li class="text-gray-600 dark:text-gray-400 flex items-start gap-2">
              <span class="text-lg">📍</span>
              <span>Г. Туймазы, ул. Лесовода Морозова, д. 9</span>
            </li>
          </ul>
        </div>

        <!-- Социальные сети -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Мы в соцсетях</h3>
          <div class="flex gap-4">
            <a href="#" class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
              <img 
                src="/img/social networks/Facebook.png" 
                alt="Facebook" 
                class="w-8 h-8 object-contain"
                @error="useFallback"
              >
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
              <img 
                src="/img/social networks/Instagram.png" 
                alt="Instagram" 
                class="w-8 h-8 object-contain"
                @error="useFallback"
              >
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden hover:scale-110 transition-transform">
              <img 
                src="/img/social networks/TikTok.png" 
                alt="TikTok" 
                class="w-8 h-8 object-contain"
                @error="useFallback"
              >
            </a>
          </div>
        </div>

        <!-- Карта -->
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">На карте</h3>
          <div class="w-full h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-700">
            <iframe 
              src="https://yandex.ru/map-widget/v1/?pt=53.693769,54.593244&z=17&l=map"
              width="100%" 
              height="100%" 
              frameborder="0"
              allowfullscreen="true"
              class="w-full h-full"
            ></iframe>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Г. Туймазы, ул. Лесовода Морозова, д. 9
          </p>
        </div>
      </div>

      <!-- Копирайт -->
      <div class="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          © 2026 vinyl-shop. Все права защищены.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Функция-заглушка для ошибок загрузки изображений
const useFallback = (e) => {
  const src = e.target.src
  let fallback = '📘'
  
  if (src.includes('facebook')) fallback = '📘'
  else if (src.includes('instagram')) fallback = '📷'
  else if (src.includes('tiktok')) fallback = '🎵'
  
  e.target.parentElement.innerHTML = `<span class="text-xl">${fallback}</span>`
}
</script>