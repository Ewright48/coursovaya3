<script setup>
import logoFlower from '../assets/icons/logo-flower.svg';
import basket from '../assets/icons/basket.svg';
import heart from '../assets/icons/heart.svg'; // Избранное
import profile from '../assets/icons/profile.svg';
</script>

<template>
  <header>
    <nav class="h-14 text-xl flex justify-between items-center border-b-2 border-green-400 px-20">
      <router-link to="/"> 
        <img :src="logoFlower" class="size-12" alt="Logo" />
      </router-link>

      <div class="flex justify-end gap-8 no-wrap w-2/3">
        <div class="flex items-center gap-4 ">
          <a href="#" class="text-yellow-300 hover:text-yellow-400">О нас</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Оплата</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Доставка</a>
          <router-link to="/catalog">
            <a href="#" class="text-yellow-300 hover:text-yellow-400">Каталог</a>
          </router-link>
        </div>

        <div class="flex gap-4">
          <!-- Нет избранного :( -->
          <router-link to="/basket">
            <img :src="basket" class="size-9" alt="Basket" />
          </router-link> 
          <router-link to="/profile">
            <!-- добавить проверку на регистрацию-->
            <img :src="profile" class="size-9" alt="Profile" />
          </router-link>  
          
        </div>
      </div>
    </nav>
  </header>
  
</template>