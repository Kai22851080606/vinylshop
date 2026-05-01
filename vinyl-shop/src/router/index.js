// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { authApi } from '../api/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/AboutView.vue')
  },
  {
    path: '/news',
    name: 'News',
    component: () => import('../views/News.vue')
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/ServicesView.vue')
  },
  {
    path: '/vinyl/:id',
    name: 'VinylDetail',
    component: () => import('../views/VinylDetailView.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/CartView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-orders',
    name: 'MyOrders',
    component: () => import('../views/MyOrdersView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorites',
    name: 'FavoriteVinyl',
    component: () => import('../views/FavoriteVinylView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/favorite-news',
    name: 'FavoriteNews',
    component: () => import('../views/FavoriteNews.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrders',
    component: () => import('../views/AdminOrdersView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue')
  },
  {
  path: '/promotions',
  name: 'Promotions',
  component: () => import('../views/PromotionsView.vue')
},
{
  path: '/service/:id',
  name: 'ServiceDetail',
  component: () => import('../views/ServicesDetailView.vue')
},
{
  path: '/news/search',
  name: 'NewsSearch',
  component: () => import('../views/NewsDetailView.vue')
},
{
  path: '/news/:id',
  name: 'NewsDetail',
  component: () => import('../views/NewsDetailView.vue')
},
{
  path: '/vinyl/search',
  name: 'VinylSearch',
  component: () => import('../views/VinylDetailView.vue')
},
{
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
},
{
  path: '/confirm-order/:id',
  name: 'confirm-order',
  component: () => import('../views/ConfirmOrderView.vue')
},
{
  path: '/catalog',
  name: 'catalog',
  component: () => import('../views/CatalogView.vue')
},
{
  path: '/reset-password',
  name: 'ResetPassword',
  component: () => import('../views/ResetPasswordView.vue')
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационный guard
router.beforeEach(async (to, from) => {
  const user = authApi.getCurrentUser()
  const isAuthenticated = !!user
  const isAdmin = user?.role === 'admin'

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return { name: 'Home' }
  }

  if (isAuthenticated && (to.name === 'Login' || to.name === 'Register')) {
    return { name: 'Home' }
  }

  return true
})

export default router