<script setup>
import { ref } from 'vue'
import logoFlower from '../assets/icons/logo-flower.svg';
import basket from '../assets/icons/basket.svg';
import heart from '../assets/icons/heart.svg';
import profile from '../assets/icons/profile.svg';
import { useAuth } from '../composables/useAuth';
import AuthModal from './AuthModal.vue';

const { isAuthenticated, user, logout } = useAuth()
const showAuthModal = ref(false)
const showProfileMenu = ref(false)

const handleLogout = () => {
  logout()
  showProfileMenu.value = false
}

const handleProfileClick = () => {
  if (isAuthenticated.value) {
    showProfileMenu.value = !showProfileMenu.value
  } else {
    showAuthModal.value = true
  }
}
</script>

<template>
  <header>
    <nav class="h-14 text-xl flex justify-between items-center border-b-2 border-green-400 px-20">
      <router-link to="/"> 
        <img :src="logoFlower" class="size-12" alt="Logo" />
      </router-link>

      <div class="flex justify-end gap-8 no-wrap w-2/3">
        <div class="flex items-center gap-4">
          <a href="#" class="text-yellow-300 hover:text-yellow-400">О нас</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Оплата</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Доставка</a>
          <router-link to="/catalog">
            <span class="text-yellow-300 hover:text-yellow-400">Каталог</span>
          </router-link>
        </div>

        <div class="flex gap-4 relative">
          <router-link to="/basket">
            <img :src="basket" class="size-9" alt="Basket" />
          </router-link>
          
          <div class="relative">
            <button @click="handleProfileClick" class="cursor-pointer">
              <img :src="profile" class="size-9" alt="Profile" />
            </button>
            
            <div v-if="isAuthenticated && showProfileMenu" class="absolute right-0 mt-2 w-48 bg-yellow-100 rounded-lg shadow-lg border border-yellow-400 z-50">
              <div class="px-4 py-2 border-b border-yellow-400">
                <p class="text-sm text-stone-600">{{ user?.email }}</p>
              </div>
              <router-link to="/profile" @click="showProfileMenu = false" class="block px-4 py-2 hover:bg-yellow-200 rounded-t-lg">
                Профиль
              </router-link>
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 hover:bg-yellow-200 rounded-b-lg">
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </header>
  
  <AuthModal v-if="showAuthModal" @close="showAuthModal = false" />
</template>