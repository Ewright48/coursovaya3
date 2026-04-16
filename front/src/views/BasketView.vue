<script setup>
import { ref } from 'vue'
import BasketCard from '../components/BasketCard.vue';
import flowerImg from '../assets/images/flower1.jpg';

const basketInfo = ref([
  { id: 1, title: 'Розы красные', price: 2500, inStock: 50, image: flowerImg, quantity: 2, discount: false, isMix: true },
]).value[0]
</script>

<template>
    <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > <span class="text-yellow-400">Корзина</span>
  </div>

  <h2 class="text-4xl">Корзина</h2>
  <div class="mt-8 flex justify-center bg-yellow-100 border border-green-400 rounded-lg min-h-90 w-2/3">
    <BasketCard 
      v-for="item in basketInfo"
      :key="item.id"
      :id="item.id"
      :image="item.image"
      :name="item.name"
      :price="item.price"
      :quantity="item.quantity"
      :discount="item.discount"
      :isMix="item.isMix"/>    
  </div>

</template>

