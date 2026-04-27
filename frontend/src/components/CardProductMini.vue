<script setup>
import { useCart } from '../composables/useCart'
import { computed } from 'vue'

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  price: Number,
  flowersCount: {
    type: Number,
    default: 15
  }
})

const { addToCart, loading, addedItemId } = useCart()

const isAdded = computed(() => addedItemId.value === props.id)

const addToBasket = async (event) => {
  event.stopPropagation()
  await addToCart(props.id, props.flowersCount || 15, 1)
}
</script>

<template>
  <article class="flex flex-col justify-center items-center border border-green-400 rounded-xl bg-yellow-100 w-60 h-85">
    <router-link :to="`/product/${id}`" class="group block">
      <img :src="image" class="rounded-xl w-50 h-50 transition-all duration-300 group-hover:scale-103 group-hover:shadow-lg" alt="PhotoProduct">
      <div class="flex flex-col items-center text-xl">
        <h3 class="mt-2">{{ name }} </h3>
        <p>{{ price }} ₽</p>  
      </div>
    </router-link>
    <button 
      @click="addToBasket" 
      :disabled="loading"
      :class="[
        'mt-3 w-35 border-2 rounded-md border-pink-400 px-3 py-1 transition-all duration-200',
        isAdded 
          ? 'text-green-400 !border-green-400' 
          : 'bg-transparent hover:bg-yellow-200 disabled:opacity-50'
      ]"
    >
      {{ isAdded ? 'Добавлено!' : (loading ? 'Добавление...' : 'В корзину') }}
    </button>
  </article>
</template>
