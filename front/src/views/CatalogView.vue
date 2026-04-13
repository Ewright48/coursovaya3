<script setup>
import { ref } from 'vue'
import arrowSort from '../assets/icons/arrow-sort.svg'
import arrowUp from '../assets/icons/arrow-up.svg'
import flowerImg from '../assets/images/flower1.jpg'
import CardProductMini from '../components/CardProductMini.vue'

const flower = ref([
  { id: 1, title: 'Розы красные', price: 2500, image: flowerImg },
  { id: 2, title: 'Тюльпаны', price: 1800, image: flowerImg },
  { id: 3, title: 'Пионы', price: 3200, image: flowerImg },
])
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > <span class="text-yellow-400">Каталог</span>
  </div>

  <div class="flex items-start">
    <aside class="w-60 bg-yellow-100 rounded-lg border border-green-400 p-4 mr-10">
      <h2 class="text-4xl">Фильтры</h2>
    </aside>

    <section class="flex flex-col w-full ml-4">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-4xl">Каталог</h2>
        <div class="flex gap-2 items-center">
          <img :src="arrowSort" class="w-6" alt="Sort" />
          <p class="text-lg">Популярное</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <CardProductMini
          v-for="item in flower"
          :key="item.id"
          :id="item.id"
          :image="item.image"
          :name="item.title"
          :price="item.price"
        />
      </div>
    </section>
  </div>
</template>