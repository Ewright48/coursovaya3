<script setup>
import {ref} from 'vue'
import Cross from '../assets/icons/cross.svg'

const props = defineProps({
  id: Number,
  image: String,
  name: String,
  price: Number,
  quantity: Number,
  discount: Number,
  inStoke: Number,
  isMix: Boolean,
})
</script>

<template>
  <article class="flex justify-between">
    <img :src='image' class="w-40" alt="photo">
  </article>
</template>