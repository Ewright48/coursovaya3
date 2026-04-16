<script setup>
import cardImg from '../assets/images/flower1.jpg'

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  price: Number
})
</script>

<template>
  <!-- выделение карточки при наведении -->
  <article class="flex flex-col justify-center items-center border border-green-400 rounded-xl bg-yellow-100 w-60 h-85">
    <router-link :to="`/product/${id}`">
      <img :src="image" class="rounded-xl w-50 h-50" alt="PhotoProduct">
      <div class="flex flex-col items-center text-xl">
        <h3 class="mt-2">{{ name }}</h3>
        <p>{{price}} ₽</p>  
      </div>
    </router-link>
    <button @click="addToBasket" class="mt-3 w-35 border-2 rounded-md border-pink-400 hover:bg-yellow-200 px-3 py-1">
      <router-link to="/basket">Купить в 1 клик</router-link>
    </button> 
  </article>
</template>

<script>
const addToBasket = (event) => { //////////////////
  event.stopPropagation();
  console.log(`Товар ${props.id} добавлен в корзину`);
};
</script>