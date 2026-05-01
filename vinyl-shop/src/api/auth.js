// src/api/auth.js
const API_URL = '/api';

export const authApi = {
  // Вход
  async login(credentials) {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return await res.json();
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, message: 'Ошибка соединения с сервером' };
    }
  },

  // Регистрация
  async register(userData) {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await res.json();
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { success: false, message: 'Ошибка соединения с сервером' };
    }
  },

  // Выход
  logout() {
    localStorage.removeItem('user');
  },

  // Получить текущего пользователя
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Проверка, авторизован ли пользователь
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  // Проверка, является ли пользователь админом
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
};