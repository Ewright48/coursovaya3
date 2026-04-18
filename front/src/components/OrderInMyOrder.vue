<script setup>
import flowerImg from '../assets/images/flower1.jpg';
const props = defineProps({
  order: {
    type: Object,
    required: true,
    default: () => ({
      image: flowerImg,
      title: 'Букет из красных роз',
      flowerCount: 15,
      quantity: 1,
      priceTotal: 2000,
      price: 1000
    }),
  },
});
</script>

<template>
  <article class="flex justify-between p-4 gap-4 border border-green-400 rounded-lg">
    <div class="w-24 h-24 flex-shrink-0">
      <img :src="order.image" alt="Букет" class="w-full h-full object-cover rounded-lg"/>
    </div>
    <div class="flex-1 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <router-link :to="`/product/${id}`">
        <h3 class="text-xl">
          {{ order.title }} 
          <span v-if="!isMix" class="text-lg">{{ order.flowerCount }} шт</span>
          <span v-else class="text-lg">(микс)</span>
        </h3>
        </router-link>
        <button class="px-3 py-0.5 ring ring-pink-400 rounded-md hover:bg-yellow-100 hover:ring-2">
          Повторить заказ
        </button>
      </div>

      <div class="flex items-end justify-between mt-auto">
        <div class="flex border border-pink-400 rounded-md px-6 py-0.5 font-medium">
          {{ order.price }} ₽ × {{ order.quantity }} шт
        </div>
        <div class="text-right">
          <p class="text-xl font-medium">{{ order.priceTotal }} ₽</p>
        </div>
      </div>
    </div>
  </article>
</template>