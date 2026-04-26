<template>
  <div class="overflow-hidden w-32 h-8 flex items-center justify-between gap-3 bg-yellow-100 border-2 border-pink-400 rounded-md">
    <button 
      @click="decrement" :disabled="currentValue <= 1"
      class="relative z-10 h-7.5 rounded-l-md border-r-2 border-pink-400 hover:bg-yellow-200 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <img :src="arrowUp" class="rotate-90 w-7">
    </button>
    
    <input type="number" v-model.number="currentValue" 
      @input="handleManualInput" @change="validateValue"
      :min="1" :max="maxValue" step="1"
      class="text-center text-xl outline-none w-10 bg-transparent"
    />
    
    <button 
      @click="increment" 
      :disabled="currentValue >= maxValue"
      class="relative z-10 h-7.5 rounded-r-md border-l-2 border-pink-400 hover:bg-yellow-200 flex items-center justify-center disabled:opacity-40 disabled:hover:bg-transparent"
    >
      <img :src="arrowUp" class="-rotate-90 w-7">
    </button>
  </div>
</template>

<script setup> 
import { ref, watch } from 'vue'
import arrowUp from '../assets/icons/arrow-up.svg'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1
  },
  maxValue: {
    type: Number,
    required: true
  },
  minValue: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['update:modelValue'])
const currentValue = ref(props.modelValue)

const validateValue = () => {
  let value = currentValue.value

  if (isNaN(value) || value === null || value === undefined || value === '') {
    value = props.minValue
  }
  if (value < props.minValue) value = props.minValue
  if (value > props.maxValue) value = props.maxValue
  value = Math.floor(value)

  if (currentValue.value !== value) {
    currentValue.value = value
  }
  
  emitValue()
}

const emitValue = () => {
  emit('update:modelValue', currentValue.value)
}

const handleManualInput = () => {
  validateValue()
}

const increment = () => {
  if (currentValue.value < props.maxValue) {
    currentValue.value++
    emitValue()
  }
}
const decrement = () => {
  if (currentValue.value > props.minValue) {
    currentValue.value--
    emitValue()
  }
}

watch(() => props.modelValue, (newVal) => {
  if (newVal !== currentValue.value) {
    currentValue.value = newVal
    validateValue()
  }
})

watch(() => props.maxValue, () => {
  validateValue()
})
</script>

<style scoped>
/* для удаления стандартных стрелок input number */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

button:disabled {
  cursor: not-allowed;
}
</style>