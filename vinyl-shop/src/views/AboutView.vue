<!-- src/views/AboutView.vue -->
<template>
  <main class="py-8">
    <div class="max-w-3xl mx-auto px-4">
      <h1 class="text-4xl font-bold dark:text-white text-center mb-8">
        О нас
      </h1>
      
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-black dark:border-white p-8 space-y-6">
        
        <!-- Кто мы -->
        <div>
          <h2 class="text-2xl font-bold dark:text-white mb-3">Привет! 👋</h2>
          <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
            Мы — <span class="font-bold">RPM Media</span> — такие же любители музыки, как и вы. 
            Наш магазин виниловых пластинок работает с 2026 года, и за это время мы собрали для вас 
            крутой каталог: от легендарных альбомов прошлого века до современных релизов.
          </p>
        </div>

        <!-- Что мы любим -->
        <div>
          <h2 class="text-xl font-bold dark:text-white mb-3">Что для нас важно</h2>
          <ul class="space-y-3 text-gray-600 dark:text-gray-300">
            <li class="flex items-start gap-3">
              <span class="text-blue-600 text-xl">🎵</span>
              <span>Чтобы каждая пластинка радовала звуком</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-blue-600 text-xl">📦</span>
              <span>Чтобы заказы доезжали целыми и невредимыми</span>
            </li>
            <li class="flex items-start gap-3">
              <span class="text-blue-600 text-xl">💬</span>
              <span>Чтобы вы возвращались к нам снова</span>
            </li>
          </ul>
        </div>

        <!-- Контакты -->
        <div>
          <h2 class="text-xl font-bold dark:text-white mb-3">Всегда на связи</h2>
          <div class="text-gray-600 dark:text-gray-300 space-y-2">
            <p>✉️ info@vinyl-shop.ru</p>
            <p>📞 +7 (927) 942-97-07</p>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>