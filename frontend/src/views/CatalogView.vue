<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import arrowSort from '../assets/icons/arrow-sort.svg'
import arrowUp from '../assets/icons/arrow-up.svg'
import CardProductMini from '../components/CardProductMini.vue'
import api from '../api'

const validateNumber = (event) => {
  let value = event.target.value;
  value = value.replace(/\D/g, '');
  if (value.length > 1 && value.startsWith('0')) {
    value = value.substring(1);
  }
  event.target.value = value;
};

const products = ref([])
const loading = ref(true)

// Фильтры
const minPrice = ref('')
const maxPrice = ref('')
const minFlowers = ref('')
const maxFlowers = ref('')
const selectedFlowerIds = ref([])
const selectedColorIds = ref([])

const isSortMenuOpen = ref(false)
const currentSort = ref('По популярности')

// Справочники для фильтров
const flowersList = ref([])
const colorsList = ref([])

const toggleSortMenu = () => {
  isSortMenuOpen.value = !isSortMenuOpen.value
}

const selectSort = (sortType) => {
  currentSort.value = sortType
  isSortMenuOpen.value = false
  loadProducts()
}

const loadProducts = async () => {
  loading.value = true
  try {
    const filters = {}
    if (minPrice.value) filters.min_price = minPrice.value
    if (maxPrice.value) filters.max_price = maxPrice.value
    if (minFlowers.value) filters.min_flowers = minFlowers.value
    if (maxFlowers.value) filters.max_flowers = maxFlowers.value
    if (selectedFlowerIds.value.length) {
      filters.flower_ids = selectedFlowerIds.value.join(',')
    }
    if (selectedColorIds.value.length) {
      filters.color_ids = selectedColorIds.value.join(',')
    }
    
    let sort = 'popular'
    if (currentSort.value === 'Новинки') sort = 'new'
    if (currentSort.value === 'Цена по возрастанию') sort = 'price_asc'
    if (currentSort.value === 'Цена по убыванию') sort = 'price_desc'
    
    const data = await api.getProducts(filters, 1, 100, sort)
    products.value = data.items || []
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    products.value = []
  } finally {
    loading.value = false
  }
}

const loadFilters = async () => {
  try {
    const [flowersData, colorsData] = await Promise.all([
      api.getFilterFlowers(),
      api.getFilterColors()
    ])
    
    flowersList.value = flowersData || []
    colorsList.value = colorsData || []
    
  } catch (error) {
    console.error('Ошибка загрузки фильтров:', error)
  }
}

const applyFilters = () => {
  loadProducts()
}

const resetFilters = () => {
  minPrice.value = ''
  maxPrice.value = ''
  minFlowers.value = ''
  maxFlowers.value = ''
  selectedFlowerIds.value = []
  selectedColorIds.value = []
  loadProducts()
}

// Следим за изменениями фильтров
watch([minPrice, maxPrice, minFlowers, maxFlowers], () => {
  applyFilters()
})

onMounted(() => {
  loadFilters()
  loadProducts()
})

const isAnyFilterActive = computed(() => {
  return minPrice.value !== '' ||
         maxPrice.value !== '' ||
         minFlowers.value !== '' ||
         maxFlowers.value !== '' ||
         selectedFlowerIds.value.length > 0 ||
         selectedColorIds.value.length > 0
})
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > <span class="text-yellow-400">Каталог</span>
  </div>

  <div class="flex items-start relative">
    <aside class="bg-yellow-100 rounded-lg ring-1 ring-green-400 p-6 font-display">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-4xl">Фильтры</h2>
      </div>

      <div class="my-6">
        <h3 class="text-lg font-medium mb-2">Цена</h3>
        <div class="flex items-center gap-2 mb-2">
          <span>от</span>
          <input type="text" pattern="[0-9]*" min="0" v-model="minPrice"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2 transition-all"
          />
          <span>до</span>
          <input type="text" pattern="[0-9]*" min="0" v-model="maxPrice"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2 transition-all"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Количество цветов</h3>
        <div class="flex items-center gap-2 mb-2">
          <span>от</span>
          <input type="text" pattern="[0-9]*" min="0" v-model="minFlowers"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2 transition-all"
          />
          <span>до</span>
          <input type="text" pattern="[0-9]*" min="0" v-model="maxFlowers"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2 transition-all"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2 inline-flex items-center gap-1">
          Состав <img :src="arrowUp" class="w-4 h-4" alt="Sort" />
        </h3>
        <div class="space-y-2">
          <div v-for="flower in flowersList" :key="flower.id" class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                :value="flower.id"
                v-model="selectedFlowerIds"
                @change="applyFilters"
                class="desine-checkbox h-4 w-4 text-green-400 rounded focus:ring-green-400" 
              />
              <span>{{ flower.name }}</span>
            </label>
            <span class="text-sm text-green-400">{{ flower.count }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium mb-2 inline-flex items-center gap-1">
          Цвет букета <img :src="arrowUp" class="w-4 h-4" alt="Sort" />
        </h3>
        <div class="space-y-2">
          <div v-for="color in colorsList" :key="color.id" class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                :value="color.id"
                v-model="selectedColorIds"
                @change="applyFilters"
                class="desine-checkbox h-4 w-4 text-green-400 rounded focus:ring-green-400" 
              />
              <span>{{ color.name }}</span>
            </label>
            <span class="text-sm text-green-400">{{ color.count }}</span>
          </div>
        </div>
      </div>
      <button 
        @click="isAnyFilterActive ? resetFilters() : null" 
        :class="['mt-4 ring-2 ring-pink-400 text-lg w-full transition-all rounded-lg py-2',
          isAnyFilterActive 
            ? 'hover:ring-3 text-stone-800 hover:text-stone-800 cursor-pointer' 
            : 'text-yellow-400 cursor-default opacity-80'
        ]"
      >
        Сбросить все
      </button>
    </aside>

    <section class="flex flex-col w-full ml-6">
      <div class="flex justify-between items-center mb-4 relative">
        <h2 class="text-4xl">Каталог</h2>
        
        <button @click="toggleSortMenu" class="flex gap-2 items-center relative z-10 hover:underline hover:underline-yellow-400">
          <img :src="arrowSort" class="w-6" alt="Sort" />
          <p class="text-lg">{{ currentSort }}</p>
        </button>

        <div v-if="isSortMenuOpen" 
          class="absolute right-0 top-full mt-2 w-48 bg-yellow-100 border border-yellow-400 rounded-lg p-4 z-20 shadow-lg"
        >
          <button @click="selectSort('По популярности')" class="hover:bg-yellow-200 p-2 rounded-sm w-full text-start">По популярности</button>
          <hr class="my-1 border-green-400">
          <button @click="selectSort('Новинки')" class="hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Новинки</button>
          <hr class="my-1 border-green-400">
          <button @click="selectSort('Цена по возрастанию')" class="hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Цена по возрастанию</button>
          <hr class="my-1 border-green-400">
          <button @click="selectSort('Цена по убыванию')" class="hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Цена по убыванию</button>
        </div>
      </div>

      <div v-if="loading" class="text-center py-20 text-stone-500">Загрузка...</div>
      <div v-else-if="products.length === 0" class="text-center py-20 text-stone-500">Товары не найдены</div>
      <div v-else class="grid grid-cols-3 gap-4">
        <CardProductMini
          v-for="item in products"
          :key="item.id"
          :id="item.id"
          :image="item.image"
          :name="item.name"
          :price="item.price"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.desine-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--color-pink-400);
  border-radius: 4px;
  cursor: pointer;
  accent-color: var(--color-pink-400);
  border-color: var(--color-yellow-400);
}

.desine-checkbox:checked {
  background-color: var(--color-pink-400);
  border-color: var(--color-pink-400);
}
</style>