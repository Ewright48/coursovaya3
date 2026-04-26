<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api'

const props = defineProps({
  order: {
    type: Object,
    required: true
  },
  showStatus: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['repeat-order', 'cancel-order'])

const isExpanded = ref(false)
const productImages = ref({})

// Загрузка картинок для товаров в заказе
const loadProductImages = async () => {
  if (!props.order.items) return
  
  for (const item of props.order.items) {
    if (!productImages.value[item.product_id]) {
      try {
        const product = await api.getProductById(item.product_id)
        productImages.value[item.product_id] = product.image
      } catch (error) {
        console.error('Ошибка загрузки картинки:', error)
        productImages.value[item.product_id] = ''
      }
    }
  }
}

const getProductImage = (productId) => {
  return productImages.value[productId] || ''
}

const getStatusInfo = () => {
  switch(props.order.status) {
    case 'active':
      return { text: 'Принят', class: 'border-yellow-400 border-2' }
    case 'cancelled':
      return { text: 'Отменён', class: 'bg-[#D17569] border-red-300' }
    case 'delivery':
      return { text: 'В доставке', class: 'border-yellow-400 border-2' }
    case 'completed':
      return { text: 'Выполнен', class: 'border-green-400 border-2' }
    default:
      return { text: 'В обработке', class: 'border-yellow-400 border-2' }
  }
}

const repeatOrder = () => {
  emit('repeat-order', props.order.order_id)
}

const cancelOrder = () => {
  if (confirm('Вы уверены, что хотите отменить этот заказ?')) {
    emit('cancel-order', props.order.order_id)
  }
}

const hasMultipleItems = computed(() => {
  return props.order.items && props.order.items.length > 1
})

const mainItem = computed(() => {
  return props.order.items && props.order.items[0]
})

const otherItemsCount = computed(() => {
  return props.order.items ? props.order.items.length - 1 : 0
})

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const allItems = computed(() => {
  return props.order.items || []
})

const isCancellable = computed(() => {
  return !props.showStatus && props.order.status === 'active'
})

onMounted(() => {
  loadProductImages()
})
</script>

<template>
  <article class="flex justify-between p-4 gap-4 border border-green-400 rounded-lg mb-6">
    <router-link v-if="!isExpanded && mainItem" :to="`/product/${mainItem.product_id || mainItem.id}`" class="w-24 h-24 flex-shrink-0 block">
      <img :src="getProductImage(mainItem.product_id || mainItem.id)" :alt="mainItem.product_name || mainItem.title" class="w-full h-full object-cover rounded-lg"/>
    </router-link>
    
    <div class="flex-1 flex flex-col">
      <div class="flex items-center justify-between mb-4">
        <div>
          <router-link v-if="!isExpanded && mainItem" :to="`/product/${mainItem.product_id || mainItem.id}`">
            <h3 class="text-xl hover:text-yellow-400 transition-colors">
              {{ mainItem.product_name || mainItem.title }} 
              <span v-if="mainItem.flowers_per_bouquet || mainItem.flowerCount" class="text-lg">{{ mainItem.flowers_per_bouquet || mainItem.flowerCount }} шт</span>
            </h3>
          </router-link>
          <h3 v-else class="text-xl">Заказ #{{ order.order_number || order.id }}</h3>
          
          <button 
            v-if="hasMultipleItems" 
            @click="toggleExpand"
            class="text-sm text-yellow-400 mt-1 hover:text-yellow-300 transition-colors focus:outline-none"
          >
            {{ isExpanded ? '− скрыть' : `+ ещё ${otherItemsCount} ${otherItemsCount === 1 ? 'товар' : 'товара'}` }}
          </button>
        </div>
        
        <div v-if="showStatus" 
          :class="['px-3 py-1 rounded-md border font-medium', getStatusInfo().class]"
        >
          {{ getStatusInfo().text }}
        </div>
        
        <button v-else-if="order.status !== 'cancelled'" @click="repeatOrder"
          class="px-3 py-0.5 no-wrap ring ring-pink-400 rounded-md hover:bg-yellow-100 hover:ring-2 transition-all"
        >
          Повторить заказ
        </button>
      </div>

      <div v-if="isExpanded && hasMultipleItems" class="mt-2 mb-3">
        <div v-for="(item, index) in allItems" :key="index"
          class="flex justify-between gap-4 mb-4 last:mb-0"
        >
          <router-link :to="`/product/${item.product_id || item.id}`" class="w-24 h-24 flex-shrink-0 block">
            <img :src="getProductImage(item.product_id || item.id)" :alt="item.product_name || item.title" class="w-full h-full object-cover rounded-lg hover:opacity-80 transition-opacity"/>
          </router-link>
          
          <div class="flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-2">
              <div>
                <router-link :to="`/product/${item.product_id || item.id}`">
                  <h4 class="text-lg text-stone-800 hover:text-yellow-400 transition-colors">
                    {{ item.product_name || item.title }}
                    <span v-if="item.flowers_per_bouquet || item.flowerCount" class="text-base text-gray-600">{{ item.flowers_per_bouquet || item.flowerCount }} шт</span>
                  </h4>
                </router-link>
              </div>
            </div>
            <div class="flex items-end justify-between mt-auto">
              <div class="flex border border-pink-400 rounded-md px-4 py-1 font-medium">
                {{ item.price_per_bouquet}} ₽ × {{ item.bouquet_count }} шт
              </div>
              <div class="text-right">
                <p class="text-lg font-medium">{{ (item.price_per_bouquet) * (item.bouquet_count) }} ₽</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isExpanded" class="flex items-end justify-between mt-auto">
        <div class="flex border border-pink-400 rounded-md px-6 py-0.5 font-medium">
          <span v-if="mainItem">{{ mainItem.price_per_bouquet }} ₽ × {{ mainItem.bouquet_count}} шт</span>
          <span v-if="hasMultipleItems" class="ml-1">и др.</span>
        </div>
        <div class="text-right">
          <p class="text-xl font-medium">{{ order.total_price }} ₽</p>
        </div>
      </div>
      
      <div v-else class="flex items-end justify-between mt-4 pt-3 border-t border-yellow-400">
        <div class="flex border border-pink-400 rounded-md px-6 py-0.5 font-medium">
          Итого:
        </div>
        <div class="text-right">
          <p class="text-xl font-medium">{{ order.total_price }} ₽</p>
        </div>
      </div>

      <div v-if="isCancellable" class="mt-3">
        <button 
          @click="cancelOrder"
          class="px-3 py-0.5 text-sm ring ring-red-400 text-red-500 rounded-md hover:bg-red-50 hover:ring-2 transition-all"
        >
          Отменить заказ
        </button>
      </div>
    </div>
  </article>
</template>