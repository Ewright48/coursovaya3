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

const deliveryType = ref('courier')
const userAddress = ref('')
const errorMessage = ref('')
const orderSubmitted = ref(false)

const PICKUP_ADDRESS = 'г. Москва, ул. Цветочная, д. 10'

const displayAddress = computed({
  get: () => deliveryType.value === 'pickup' ? PICKUP_ADDRESS : userAddress.value,
  set: (value) => {
    if (deliveryType.value === 'courier') {
      userAddress.value = value
    }
  }
})

const deliveryPrices = {
  courier: 400,
  pickup: 0
}

const totalPrice = computed(() => {
  return cartTotal.value + deliveryPrices[deliveryType.value]
})

const validateForm = () => {
  if (deliveryType.value === 'courier' && !userAddress.value.trim()) {
    errorMessage.value = 'Пожалуйста, укажите адрес доставки'
    return false
  }
  return true
}

const handleSubmitOrder = () => {
  errorMessage.value = ''
  
  if (!validateForm()) {
    return
  }

  orderSubmitted.value = true

  const orderData = {
    items: cartItems.value,
    subtotal: cartTotal.value,
    deliveryType: deliveryType.value,
    deliveryPrice: deliveryPrices[deliveryType.value],
    address: deliveryType.value === 'courier' ? userAddress.value : PICKUP_ADDRESS,
    totalPrice: totalPrice.value,
    orderDate: new Date().toISOString()
  }

  console.log('Заказ оформлен:', orderData)
  emit('submit-order', orderData)
  
  cartItems.value = []
  
  setTimeout(() => {
    orderSubmitted.value = false
  }, 3000)
}

const emit = defineEmits(['submit-order'])
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> 
    > <span class="text-yellow-400">Корзина</span>
  </div>
  <h2 class="text-4xl">Корзина</h2>

  <div class="flex gap-8 justify-between mt-8">

    <section class="flex-1 w-2/3">
      <div class="flex flex-col bg-yellow-100 border border-green-400 rounded-lg min-h-90">
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
    </section>

    <section class="w-1/3 h-125 text-lg bg-yellow-100 rounded-xl border border-yellow-400 p-6 w-96">
      <h2 class="text-3xl text-stone-800 mb-6">Сумма заказа</h2>

      <div class="flex justify-between items-center mb-4 border-b-2 border-yellow-300">
        <span class="text-stone-700 text-lg">Сумма</span>
        <span class="text-xl font-medium text-stone-800">{{ cartTotal }} ₽</span>
      </div>

      <div class="mb-2">
        <p class="text-stone-700 mb-1">Доставка:</p>

        <div class="border-2 border-green-400 rounded-md px-4 py-2">
          <label class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <input type="radio" v-model="deliveryType" value="courier" 
                class="custom-radio"
              />
              <span class="text-stone-700">Курьер</span>
            </div>
            <span class="text-stone-700">{{ deliveryPrices.courier }} ₽</span>
          </label>

          <label class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <input type="radio" v-model="deliveryType" value="pickup" 
                class="custom-radio"
              />
              <span class="text-stone-700">Самовывоз</span>
            </div>
            <span class="text-stone-700">{{ deliveryPrices.pickup }} ₽</span>
          </label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-stone-700 mb-1">Адрес:</label>
        <input type="text" v-model="displayAddress" :readonly="deliveryType === 'pickup'"
          :class="[
            'w-full bg-yellow-100 px-4 py-2 ring-1 rounded-md focus:outline-none transition-all placeholder:text-gray-400',
            deliveryType === 'pickup' 
              ? 'ring-yellow-400 cursor-not-allowed opacity-75' 
              : 'focus:ring-2 ring-pink-400 focus:ring-pink-400'
          ]"
        />
      </div>

      <div class="flex justify-between items-center pt-2 mt-6 border-t-2 border-yellow-400">
        <span class="text-xl text-stone-800">Итого</span>
        <span class="text-2xl font-medium text-stone-800">{{ totalPrice }} ₽</span>
      </div>

      <button @click="handleSubmitOrder" :disabled="orderSubmitted"
        class="w-full mt-6 py-3 ring-2 ring-pink-400 hover:ring-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ orderSubmitted ? 'Заказ оформлен!' : 'Оформить заказ' }}
      </button>

      <p v-if="errorMessage" class="text-red-400 text-sm mt-3 text-center">{{ errorMessage }}</p>
    </section>
  </div>
</template>

<style scoped>
/* Стили для input radio */
.custom-radio {
  appearance: none;
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-pink-400);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.1s ease;
}

.custom-radio:checked {
  border: 4px solid var(--color-pink-400);
}

.custom-radio:hover {
  border-color: var(--color-pink-300);
}

.custom-radio:focus {
  outline: none;
}
</style>