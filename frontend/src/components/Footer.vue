<script setup>
import phone from '../assets/icons/phone.svg'
import logoFlower from '../assets/icons/logo-flower.svg'
import vk from '../assets/icons/vk.svg'
</script>

<template>
  <footer>
    <div class="h-14 flex justify-between border-t-2 border-green-400 px-10">
        <div class="gap-4 flex items-center">
          <div class="flex items-center gap-2 text-yellow-300">
              <img :src="logoFlower" class="size-11" alt="Logo" />
              <p>flower@delivery-flower.ru</p>
          </div>
          <div class="flex items-center gap-2 text-yellow-300">
              <img :src="phone" class="size-10" alt="Logo" />
              <p>+7 (999) 000 00-00</p>
          </div>
          <div class="flex items-center gap-2 text-yellow-300">
              <img :src="vk" class="size-12" alt="Logo" />
              <p>@delivery-flower</p>
          </div>            
        </div>
        <nav class="flex items-center gap-4 ">
          <a href="#" class="text-yellow-300 hover:text-yellow-400">О нас</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Оплата</a>
          <a href="#" class="text-yellow-300 hover:text-yellow-400">Доставка</a>
        </nav>
    </div>  
  </footer>
</template>