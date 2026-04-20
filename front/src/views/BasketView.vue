<script setup>
import { ref, computed } from 'vue'
import BasketCard from '../components/BasketCard.vue';
import flowerImg from '../assets/images/flower1.jpg';

const basketInfo = ref([
  { 
    id: 1, 
    name: 'Розы красные', 
    price: 2500,
    flowersCount: 15,
    inStock: 150,
    image: flowerImg, 
    discount: false, 
    isMix: false 
  },
  { 
    id: 2, 
    name: 'Тюльпаны белые', 
    price: 1800,
    flowersCount: 21,
    inStock: 105,
    image: flowerImg, 
    discount: false, 
    isMix: false 
  },
  { 
    id: 3, 
    name: 'Сборный букет', 
    price: 3200,
    flowersCount: 0,
    inStock: 20,
    image: flowerImg, 
    discount: false, 
    isMix: true 
  },
])

const cartItems = ref(basketInfo.value.map(item => ({
  ...item,
  bouquetCount: 1
})))

const updateBouquetCount = (id, newCount) => {
  const item = cartItems.value.find(item => item.id === id)
  if (item) {
    item.bouquetCount = newCount
  }
}

const removeItem = (id) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
}

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price * item.bouquetCount)
  }, 0)
})
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> 
    > <span class="text-yellow-400">Корзина</span>
  </div>

  <h2 class="text-4xl">Корзина</h2>
  
  <div class="mt-8 flex flex-col bg-yellow-100 border border-green-400 rounded-lg min-h-90 w-2/3">
    <div v-if="cartItems.length === 0" class="text-center py-10 text-stone-500">
      Корзина пуста
    </div>
    
    <template v-for="(item, index) in cartItems" :key="item.id">
      <BasketCard 
        :id="item.id"
        :image="item.image"
        :name="item.name"
        :price="item.price"
        :flowersCount="item.flowersCount"
        :discount="item.discount"
        :isMix="item.isMix"
        :inStock="item.inStock"
        @update:bouquetCount="updateBouquetCount"
        @remove="removeItem"
      />
      <hr v-if="index < cartItems.length - 1" class="mx-4 border-green-400">
    </template>
    
    <div v-if="cartItems.length > 0" class="border-t border-green-400 p-4 flex justify-between items-center">
      <span class="text-lg font-medium">Итого:</span>
      <span class="text-2xl font-medium">{{ cartTotal }} ₽</span>
    </div>
  </div>
</template>