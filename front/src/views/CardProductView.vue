<script setup>
import { ref } from 'vue'
import flowerImg from '../assets/images/flower1.jpg'
import arrowUp from '../assets/icons/arrow-up.svg'

const flower = ref([
  { id: 1, title: 'Розы красные', price: 2500, image: flowerImg },
]).value[0]

const sizes = [3, 5, 9, 11, 15, 21, 25, 35, 51];
const activeSize = ref(null); ///////////////

const setActiveSize = (size) => {
  activeSize.value = size;
};
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > 
    <router-link to="/catalog" class="text-yellow-300 hover:text-yellow-400">Каталог</router-link> >
    <span class="text-yellow-400">{{ flower.title }}</span>
  </div>
  <section>
    <div class="flex justify-between gap-10">
      <img :src="flower.image" alt="Product Image" class="w-120 h-120 object-cover rounded-lg" />
      <div class="w-1/2">
        <h2 class="text-4xl mb-4">{{ flower.title }}</h2>

        <div>
          <p class="mb-2 text-lg">Выберите количество цветов в букете:</p>
          <div class="flex gap-3">
            <button v-for="size in sizes" :key="size"
              class="min-w-9 ring-1 ring-pink-400 text-yellow-300 px-2 rounded hover:ring-2 hover:text-stone-700"
              :class="{ 'ring-2 text-stone-700': activeSize === size }"
              @click="setActiveSize(size)"
            >
              {{ size }}
            </button>
          </div>
        </div>

      </div>
    </div>
    
  </section>
</template>