<script setup>
import { ref, computed, watch } from 'vue'
import Cross from '../assets/icons/cross.svg'
import Counter from '../components/Counter.vue'

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  price: Number,
  flowersCount: Number,
  inStock: Number,
  discount: Number,
  isMix: Boolean,
})

const emit = defineEmits(['update:bouquetCount', 'remove'])
const bouquetCount = ref(1)

const maxAvailableBouquets = computed(() => {
  if (props.isMix) {
    return props.inStock
  }
  return Math.floor(props.inStock / props.flowersCount)
})

const totalPrice = computed(() => {
  return props.price * bouquetCount.value
})

watch(bouquetCount, (newValue) => {
  emit('update:bouquetCount', props.id, newValue)
})

watch(maxAvailableBouquets, (newMax) => {
  if (bouquetCount.value > newMax) {
    bouquetCount.value = newMax
  }
})

const removeItem = () => {
  emit('remove', props.id)
}
</script>

<template>
  <article class="flex justify-between p-4 gap-4">
    <img :src="image" class="w-35 h-35 object-cover rounded" alt="photo">
    <div class="flex-1 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <router-link :to="`/product/${id}`">
        <h3 class="text-2xl">
          {{ name }} 
          <span v-if="!isMix" class="text-lg">{{ flowersCount }} шт</span>
          <span v-else class="text-lg">(микс)</span>
        </h3>
        </router-link>
        <img :src="Cross" alt="cross" @click="removeItem" class="w-8 cursor-pointer hover:opacity-70">
      </div>
      <div class="flex items-end justify-between mt-auto">
        <div class="flex flex-col gap-1">
          <div class="flex flex-col gap-2 mb-2">
            <p class="text-sm text-stone-500">
              (В наличии: {{ maxAvailableBouquets }} букетов)
            </p>
          </div>
          <Counter
            v-model="bouquetCount"
            :max-value="maxAvailableBouquets"
            :min-value="1"
          />
        </div>
        <div class="text-right">
          <p class="text-xl font-medium">{{ totalPrice }} ₽</p>
          <p class="text-sm text-stone-500">{{ price }} ₽ × {{bouquetCount}}</p>
        </div>
      </div>
    </div>
  </article>
</template>