// src/stores/cart.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const vinylItems = ref([])
  const serviceItems = ref([])
  const activePromotions = ref([])

  // Загрузка активных акций
  const loadPromotions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/promotions/active')
      if (response.ok) {
        activePromotions.value = await response.json()
        console.log('✅ Загружено акций:', activePromotions.value.length)
      }
    } catch (error) {
      console.error('Ошибка загрузки акций:', error)
    }
  }

  // Получение цены со скидкой для пластинки (тип discount)
  const getDiscountedPrice = (vinyl, quantity = 1) => {
    const discountPromo = activePromotions.value.find(p => 
      p.type === 'discount' && 
      p.active === 1 &&
      (!p.start_date || new Date(p.start_date) <= new Date()) &&
      (!p.end_date || new Date(p.end_date) >= new Date())
    )
    
    if (!discountPromo) return vinyl.price * quantity
    
    // Проверяем, действует ли скидка на эту пластинку
    if (discountPromo.target_type === 'specific' && discountPromo.target_ids) {
      try {
        const targetIds = JSON.parse(discountPromo.target_ids)
        if (!targetIds.includes(vinyl.id)) return vinyl.price * quantity
      } catch (e) {
        return vinyl.price * quantity
      }
    }
    
    if (discountPromo.discount_type === 'percentage') {
      return Math.floor(vinyl.price * quantity * (100 - discountPromo.discount_value) / 100)
    } else if (discountPromo.discount_type === 'fixed') {
      const discounted = vinyl.price * quantity - discountPromo.discount_value
      return Math.max(0, discounted)
    }
    
    return vinyl.price * quantity
  }

  // Получение процента скидки для отображения
  const getDiscountPercent = (vinyl) => {
    const discountPromo = activePromotions.value.find(p => 
      p.type === 'discount' && 
      p.active === 1 &&
      (!p.start_date || new Date(p.start_date) <= new Date()) &&
      (!p.end_date || new Date(p.end_date) >= new Date())
    )
    
    if (!discountPromo) return null
    if (discountPromo.discount_type !== 'percentage') return null
    
    if (discountPromo.target_type === 'specific' && discountPromo.target_ids) {
      try {
        const targetIds = JSON.parse(discountPromo.target_ids)
        if (!targetIds.includes(vinyl.id)) return null
      } catch (e) {
        return null
      }
    }
    
    return discountPromo.discount_value
  }

  // Проверка наличия акции bundle (1+1=3)
  const getBundlePromotion = () => {
    return activePromotions.value.find(p => 
      p.type === 'bundle' && 
      p.active === 1 &&
      (!p.start_date || new Date(p.start_date) <= new Date()) &&
      (!p.end_date || new Date(p.end_date) >= new Date())
    )
  }

  // Применение акции bundle к корзине (возвращает массив с бесплатными товарами)
  const applyBundlePromotion = () => {
    const bundlePromo = getBundlePromotion()
    if (!bundlePromo) return { items: vinylItems.value, freeItems: [], bundleApplied: false }
    
    const buyQty = bundlePromo.buy_quantity || 2
    const getQty = bundlePromo.get_quantity || 1
    
    // Создаем копию корзины для расчета
    const itemsCopy = [...vinylItems.value]
    const freeItems = []
    
    // Сортируем по цене (дешевые идут в бесплатные)
    itemsCopy.sort((a, b) => a.price - b.price)
    
    // Рассчитываем количество бесплатных товаров
    const totalItems = itemsCopy.length
    const freeCount = Math.floor(totalItems / (buyQty + getQty)) * getQty
    
    // Добавляем бесплатные товары (копии с ценой 0)
    for (let i = 0; i < freeCount && i < itemsCopy.length; i++) {
      freeItems.push({
        ...itemsCopy[i],
        price: 0,
        isFree: true,
        originalPrice: itemsCopy[i].price
      })
    }
    
    return { items: vinylItems.value, freeItems, bundleApplied: freeItems.length > 0 }
  }

  // Получение кэшбэка для заказа
  const getCashbackPromotion = () => {
    return activePromotions.value.find(p => 
      p.type === 'cashback' && 
      p.active === 1 &&
      (!p.start_date || new Date(p.start_date) <= new Date()) &&
      (!p.end_date || new Date(p.end_date) >= new Date())
    )
  }

  // Расчет итоговой суммы корзины с учётом всех акций
  const cartTotal = computed(() => {
    let total = 0
    
    // Сначала считаем сумму с учётом скидок
    for (const item of vinylItems.value) {
      total += getDiscountedPrice(item, item.quantity || 1)
    }
    
    // Применяем bundle (бесплатные товары)
    const bundleResult = applyBundlePromotion()
    for (const freeItem of bundleResult.freeItems) {
      // Вычитаем цену бесплатных товаров из общей суммы
      total -= freeItem.originalPrice
    }
    
    return total
  })

  // Общая сумма с учётом всех акций для отображения
  const totalWithPromotions = computed(() => {
    return cartTotal.value
  })

  // Получение информации об акциях для отображения
  const getActivePromotionsInfo = () => {
    const info = []
    
    const discountPromo = activePromotions.value.find(p => p.type === 'discount' && p.active === 1)
    if (discountPromo) {
      info.push({
        type: 'discount',
        name: discountPromo.name,
        description: discountPromo.discount_type === 'percentage' 
          ? `Скидка ${discountPromo.discount_value}%` 
          : `Скидка ${discountPromo.discount_value} ₽`
      })
    }
    
    const bundlePromo = getBundlePromotion()
    if (bundlePromo) {
      info.push({
        type: 'bundle',
        name: bundlePromo.name,
        description: `Купи ${bundlePromo.buy_quantity}, получи ${bundlePromo.get_quantity} бесплатно!`
      })
    }
    
    const cashbackPromo = getCashbackPromotion()
    if (cashbackPromo) {
      info.push({
        type: 'cashback',
        name: cashbackPromo.name,
        description: `Кэшбэк ${cashbackPromo.cashback_percent}% от суммы заказа`
      })
    }
    
    return info
  }

  // Загрузка из localStorage
  const loadFromStorage = () => {
    const savedVinyls = localStorage.getItem('cart-vinyls')
    const savedServices = localStorage.getItem('cart-services')
    
    if (savedVinyls) {
      try {
        vinylItems.value = JSON.parse(savedVinyls)
      } catch (e) {
        vinylItems.value = []
      }
    }
    
    if (savedServices) {
      try {
        serviceItems.value = JSON.parse(savedServices)
      } catch (e) {
        serviceItems.value = []
      }
    }
  }
  
  // Сохраняем в localStorage
  const saveToStorage = () => {
    localStorage.setItem('cart-vinyls', JSON.stringify(vinylItems.value))
    localStorage.setItem('cart-services', JSON.stringify(serviceItems.value))
  }

  const addVinyl = (vinyl) => {
    const exists = vinylItems.value.some(item => item.id === vinyl.id)
    if (!exists) {
      vinylItems.value.push({
        id: vinyl.id,
        title: vinyl.title,
        artist: vinyl.artist,
        price: vinyl.price,
        image: vinyl.image,
        type: vinyl.type,
        stock: vinyl.stock || 0,
        quantity: 1
      })
      saveToStorage()
    }
  }

  const addService = (service) => {
    const exists = serviceItems.value.some(item => item.id === service.id)
    if (!exists) {
      serviceItems.value.push({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        image: service.image,
        quantity: 1
      })
      saveToStorage()
    }
  }

  const updateVinylQuantity = (id, quantity) => {
    const item = vinylItems.value.find(item => item.id === id)
    if (item) {
      item.quantity = Math.max(1, Math.min(quantity, item.stock))
      saveToStorage()
    }
  }

  const removeVinyl = (id) => {
    vinylItems.value = vinylItems.value.filter(item => item.id !== id)
    saveToStorage()
  }

  const removeService = (id) => {
    serviceItems.value = serviceItems.value.filter(item => item.id !== id)
    saveToStorage()
  }

  const clearVinyls = () => {
    vinylItems.value = []
    saveToStorage()
  }

  const clearServices = () => {
    serviceItems.value = []
    saveToStorage()
  }

  const clearAll = () => {
    vinylItems.value = []
    serviceItems.value = []
    saveToStorage()
  }

  const isVinylInCart = (id) => {
    return vinylItems.value.some(item => item.id === id)
  }

  const isServiceInCart = (id) => {
    return serviceItems.value.some(item => item.id === id)
  }

  const totalVinyls = computed(() => vinylItems.value.length)
  const totalServices = computed(() => serviceItems.value.length)
  const totalItems = computed(() => totalVinyls.value + totalServices.value)

  loadFromStorage()

  return {
    vinylItems,
    serviceItems,
    activePromotions,
    loadPromotions,
    getDiscountedPrice,
    getDiscountPercent,
    getBundlePromotion,
    applyBundlePromotion,
    getCashbackPromotion,
    cartTotal,
    totalWithPromotions,
    getActivePromotionsInfo,
    addVinyl,
    addService,
    updateVinylQuantity,
    removeVinyl,
    removeService,
    clearVinyls,
    clearServices,
    clearAll,
    isVinylInCart,
    isServiceInCart,
    totalVinyls,
    totalServices,
    totalItems
  }
})