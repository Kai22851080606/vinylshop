// src/api/profile.js
const API_URL = 'http://localhost:3001/api';

export const profileApi = {
  // Обновить профиль пользователя
  async updateProfile(userId, data) {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) {
        const error = await res.json();
        return { success: false, message: error.error || 'Ошибка сервера' };
      }
      
      return await res.json();
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      return { success: false, message: 'Ошибка соединения с сервером' };
    }
  },

  // Получить данные пользователя
  async getUser(userId) {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      return null;
    }
  }
};