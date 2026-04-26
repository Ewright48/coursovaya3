<script setup>
import { ref, computed, watch } from 'vue'
import Cross from '../assets/icons/cross.svg'
import Counter from '../components/Counter.vue'

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  price: Number,           // цена за 1 букет
  flowersCount: Number,    // количество цветов в букете (только для инфо)
  inStock: Number,
  discount: {
    type: Number,
    default: 0
  },
  isMix: Boolean,
  modelValue: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:bouquetCount', 'remove', 'update:modelValue'])

const bouquetCount = ref(props.modelValue)

const maxAvailableBouquets = computed(() => {
  if (props.isMix) {
    return props.inStock
  }
  return Math.floor(props.inStock / props.flowersCount)
})

const getBouquetWord = (count) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'букетов'
  if (lastDigit === 1) return 'букет'
  if (lastDigit >= 2 && lastDigit <= 4) return 'букета'
  return 'букетов'
}

const availableText = computed(() => {
  const count = maxAvailableBouquets.value
  return `(В наличии: ${count} ${getBouquetWord(count)})`
})

const totalPrice = computed(() => {
  const priceWithDiscount = props.price * (1 - props.discount / 100)
  return priceWithDiscount * bouquetCount.value
})

watch(() => props.modelValue, (newVal) => {
  if (newVal !== bouquetCount.value) {
    bouquetCount.value = newVal
  }
})

watch(bouquetCount, (newValue) => {
  emit('update:modelValue', newValue)
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
            <p class="text-sm text-stone-500">{{ availableText }}</p>
          </div>
          <Counter
            v-model="bouquetCount"
            :max-value="maxAvailableBouquets"
            :min-value="1"
          />
        </div>
        <div class="text-right">
          <p class="text-xl font-medium">{{ Math.floor(totalPrice) }} ₽</p>
          <p class="text-sm text-stone-500">{{ Math.floor(props.price) }} ₽ × {{ bouquetCount }}</p>
        </div>
      </div>
    </div>
  </article>
</template>