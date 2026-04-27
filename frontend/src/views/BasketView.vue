<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BasketCard from '../components/BasketCard.vue';
import api from '../api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isAuthenticated } = useAuth()
const cartItems = ref([])
const loading = ref(true)
const errorMessage = ref('')
const orderSubmitted = ref(false)
const deliveryType = ref('courier')
const userAddress = ref('')
const PICKUP_ADDRESS = 'г. Великий Новгород, ул. Цветочная, д. 10'

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

const cartTotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    return total + (item.price_at_time * item.bouquet_count)
  }, 0)
})

const totalPrice = computed(() => {
  return cartTotal.value + deliveryPrices[deliveryType.value]
})

const formatPrice = (price) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const loadCart = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    if (guestCart.length === 0) {
      cartItems.value = []
      loading.value = false
      return
    }
    
    const items = []
    for (const item of guestCart) {
      try {
        const product = await api.getProductById(item.product_id)
        items.push({
          product_id: item.product_id,
          name: product.title,
          image: product.image,
          price_at_time: product.defaultPrice,
          price_per_flower: product.defaultPrice / 9,
          bouquet_count: item.bouquet_count,
          flowers_per_bouquet: item.flowers_per_bouquet,
          max_bouquets: product.inStock,
          is_mix: product.isMix,
          cart_item_id: `guest_${item.product_id}`,
          discount: 0
        })
      } catch (err) {
        console.error('Ошибка загрузки товара:', err)
      }
    }
    cartItems.value = items
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const data = await api.getCart(token)
    cartItems.value = (data.items || []).map(item => ({
      ...item,
      discount: 0
    }))
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error)
    cartItems.value = []
  } finally {
    loading.value = false
  }
}

const updateBouquetCount = async (id, newCount) => {
  const token = localStorage.getItem('token')
  const itemIndex = cartItems.value.findIndex(item => item.product_id === id)
  if (itemIndex === -1) return
  
  const oldCount = cartItems.value[itemIndex].bouquet_count
  cartItems.value[itemIndex].bouquet_count = newCount
  
  if (!token) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const guestItem = guestCart.find(i => i.product_id === id)
    if (guestItem) {
      guestItem.bouquet_count = newCount
      localStorage.setItem('guestCart', JSON.stringify(guestCart))
    }
    return
  }
  
  try {
    await api.updateCartItem(token, cartItems.value[itemIndex].cart_item_id, newCount)
  } catch (error) {
    console.error('Ошибка обновления:', error)
    cartItems.value[itemIndex].bouquet_count = oldCount
    alert('Ошибка при обновлении количества')
  }
}

const removeItem = async (id) => {
  const token = localStorage.getItem('token')
  const itemIndex = cartItems.value.findIndex(item => item.product_id === id)
  if (itemIndex === -1) return
  
  const removedItem = cartItems.value[itemIndex]
  cartItems.value.splice(itemIndex, 1)
  
  if (!token) {
    const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
    const newGuestCart = guestCart.filter(i => i.product_id !== id)
    localStorage.setItem('guestCart', JSON.stringify(newGuestCart))
    return
  }
  
  try {
    await api.removeCartItem(token, removedItem.cart_item_id)
  } catch (error) {
    console.error('Ошибка удаления:', error)
    cartItems.value.splice(itemIndex, 0, removedItem)
    alert('Ошибка при удалении товара')
  }
}

const validateForm = () => {
  if (!isAuthenticated.value) {
    errorMessage.value = 'Пожалуйста, войдите в аккаунт для оформления заказа'
    return false
  }
  if (deliveryType.value === 'courier' && !userAddress.value.trim()) {
    errorMessage.value = 'Пожалуйста, укажите адрес доставки'
    return false
  }
  return true
}

const handleSubmitOrder = async () => {
  errorMessage.value = ''
  
  if (!validateForm()) return

  const token = localStorage.getItem('token')
  if (!token) {
    errorMessage.value = 'Пожалуйста, войдите в аккаунт'
    return
  }

  orderSubmitted.value = true

  try {
    const orderData = {
      delivery_type: deliveryType.value,
      delivery_address: deliveryType.value === 'courier' ? userAddress.value : null
    }
    
    const result = await api.createOrder(token, orderData)
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    alert('Заказ успешно оформлен!')
    
    cartItems.value = []
    if (!token) {
      localStorage.setItem('guestCart', '[]')
    }
    
    userAddress.value = ''
    
    router.push('/profile')
  } catch (error) {
    console.error('Ошибка оформления заказа:', error)
    alert(error.message || 'Ошибка при оформлении заказа')
  } finally {
    orderSubmitted.value = false
  }
}

onMounted(() => {
  loadCart()
})
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
        <div v-if="loading" class="text-center py-10 text-stone-500">Загрузка...</div>
        <div v-else-if="cartItems.length === 0" class="text-center py-10 text-stone-500">
          Корзина пуста
        </div>
        
        <template v-else v-for="(item, index) in cartItems" :key="item.product_id">
          <BasketCard 
            :id="item.product_id"
            :image="item.image"
            :name="item.name"
            :price="item.price_at_time"
            :pricePerFlower="item.price_per_flower"
            :flowersCount="item.flowers_per_bouquet"
            :inStock="item.max_bouquets"
            :discount="item.discount"
            :isMix="item.is_mix"
            v-model="item.bouquet_count"
            @update:bouquetCount="updateBouquetCount"
            @remove="removeItem"
          />
          <hr v-if="index < cartItems.length - 1" class="mx-4 border-green-400">
        </template>
        
        <div v-if="cartItems.length > 0" class="border-t border-green-400 p-4 flex justify-between items-center">
          <span class="text-lg font-medium">Итого:</span>
          <span class="text-2xl font-medium">{{ formatPrice(cartTotal) }} ₽</span>
        </div>
      </div>
    </section>

    <section class="w-1/3 text-lg bg-yellow-100 rounded-xl border border-yellow-400 p-6">
      <h2 class="text-3xl text-stone-800 mb-6">Сумма заказа</h2>

      <div class="flex justify-between items-center mb-4 border-b-2 border-yellow-300">
        <span class="text-stone-700 text-lg">Сумма</span>
        <span class="text-xl font-medium text-stone-800">{{ formatPrice(cartTotal) }} ₽</span>
      </div>

      <div class="mb-2">
        <p class="text-stone-700 mb-1">Доставка:</p>
        <div class="border-2 border-green-400 rounded-md px-4 py-2">
          <label class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <input type="radio" v-model="deliveryType" value="courier" class="custom-radio" />
              <span class="text-stone-700">Курьер</span>
            </div>
            <span class="text-stone-700">{{ formatPrice(deliveryPrices.courier) }} ₽</span>
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <div class="flex items-center gap-2">
              <input type="radio" v-model="deliveryType" value="pickup" class="custom-radio" />
              <span class="text-stone-700">Самовывоз</span>
            </div>
            <span class="text-stone-700">{{ formatPrice(deliveryPrices.pickup) }} ₽</span>
          </label>
        </div>
      </div>

      <div class="mb-4">
        <label class="block text-stone-700 mb-1">Адрес:</label>
        <input type="text" v-model="displayAddress" :readonly="deliveryType === 'pickup'"
          :class="[
            'w-full bg-yellow-100 px-4 py-2 ring-1 rounded-md focus:outline-none transition-all',
            deliveryType === 'pickup' 
              ? 'ring-yellow-400 cursor-not-allowed opacity-75' 
              : 'focus:ring-2 ring-pink-400 focus:ring-pink-400'
          ]"
        />
      </div>

      <div class="flex justify-between items-center pt-2 mt-6 border-t-2 border-yellow-400">
        <span class="text-xl text-stone-800">Итого</span>
        <span class="text-2xl font-medium text-stone-800">{{ formatPrice(totalPrice) }} ₽</span>
      </div>

      <button @click="handleSubmitOrder" :disabled="orderSubmitted || cartItems.length === 0"
        class="w-full mt-6 py-3 ring-2 ring-pink-400 hover:ring-3 font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ orderSubmitted ? 'Заказ оформлен!' : 'Оформить заказ' }}
      </button>

      <p v-if="errorMessage" class="text-red-400 text-sm mt-3 text-center">{{ errorMessage }}</p>
    </section>
  </div>
</template>

<style scoped>
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
</style>