import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CatalogView from '../views/CatalogView.vue'
import CardProductView from '../views/CardProductView.vue'
import BasketView from '../views/BasketView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: CatalogView
  },
  {
    path: '/product/:id',
    name: 'product',
    component: CardProductView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView
  },
  {
    path: '/basket',
    name: 'basket',
    component: BasketView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router