// src/api/vinyls.js
const API_URL = '/api';

export const vinylsApi = {
  // Получить все пластинки
  async getAll() {
    try {
      const res = await fetch(`${API_URL}/vinyls`);
      if (!res.ok) throw new Error('Ошибка загрузки');
      return await res.json();
    } catch (error) {
      console.error('Ошибка:', error);
      return [];
    }
  },

  // Получить одну пластинку
  async getById(id) {
    try {
      const res = await fetch(`${API_URL}/vinyls/${id}`);
      if (!res.ok) throw new Error('Ошибка загрузки');
      return await res.json();
    } catch (error) {
      console.error('Ошибка:', error);
      return null;
    }
  }
};