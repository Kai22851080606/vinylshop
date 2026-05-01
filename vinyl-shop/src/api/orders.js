// src/api/orders.js
const API_URL = '/api';

export const ordersApi = {
  // Получить заказы пользователя по email
  async getUserOrders(email) {
    try {
      console.log('🔍 Запрос заказов для email:', email)
      const res = await fetch(`${API_URL}/orders/user/${encodeURIComponent(email)}`)
      
      if (!res.ok) {
        const error = await res.text()
        console.error('❌ Ошибка ответа:', error)
        throw new Error('Ошибка загрузки заказов')
      }
      
      const data = await res.json()
      console.log('✅ Получены заказы:', data)
      return data
    } catch (error) {
      console.error('❌ Ошибка получения заказов:', error)
      return []
    }
  },

  // Получить все заказы (для админа)
  async getAllOrders() {
    try {
      const res = await fetch(`${API_URL}/orders`)
      return await res.json()
    } catch (error) {
      console.error('❌ Ошибка получения заказов:', error)
      return []
    }
  },

  // Получить заказ по ID
  async getOrderById(id) {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`)
      return await res.json()
    } catch (error) {
      console.error('❌ Ошибка получения заказа:', error)
      return null
    }
  }
}