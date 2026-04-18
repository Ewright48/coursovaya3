<script setup>
import { ref, watch, computed } from 'vue'
import flowerImg from '../assets/images/flower1.jpg'
import arrowUp from '../assets/icons/arrow-up.svg'
import Counter from '../components/Counter.vue'
</script>


<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > 
    <router-link to="/catalog" class="text-yellow-300 hover:text-yellow-400">Каталог</router-link> >
    <span class="text-yellow-400">{{ flower.title }}</span>
  </div>
  <section>
    
    <div class="flex justify-between gap-10">
      <img :src="flower.image" alt="Product Image" class="w-120 h-120 object-cover rounded-lg" />
      <div class="w-1/2">
        <h2 class="text-4xl mb-4">{{ flower.title }}</h2>

        <div>
          <p class="mb-2 text-lg">Выберите количество цветов в букете:</p>
          <div class="flex gap-3 mb-4">
            <button 
              v-for="amount in availablePresetAmounts" 
              :key="amount" 
              @click="selectAmount(amount)"
              :class="[
                'w-12 ring-1 ring-pink-400 bg-yellow-100 px-2 rounded hover:ring-2',
                activeButton === amount ? 'ring-2 font-medium text-stone-700' : 'text-yellow-400 hover:text-stone-700'
              ]"
            >
              {{ amount }}
            </button>
          </div>

          <Counter 
            v-model="counterValue"
            :max-value="flower.inStock"
            :min-value="1"
          />
        </div>

        <hr class="my-8 border-green-400">

        <div class="flex items-center gap-8 text-2xl mb-4">
          <div class="bg-yellow-100 border-2 border-green-400 rounded-md px-5">
            {{ flower.price }} ₽
          </div>
          <!-- <div class="flex items-center gap-2">
            <p class="line-through">скидка</p>
            размер скидки
          </div> -->
        </div>

        <div class="flex justify-between items-center text-xl">
          <button class="bg-yellow-100 border-2 border-pink-400 rounded-md px-4 py-1 hover:bg-yellow-200">
            В корзину
          </button>
          <button class="bg-yellow-100 border-2 border-pink-400 rounded-md px-4 py-1 hover:bg-yellow-200">
            Купить в 1 клик
          </button>
        </div>

        <hr class="my-8 border-green-400">

        <div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-2xl">Состав</h3>
                <p>Элемент в составе {{ counterValue }} шт</p>
                <p v-for="elem in composition">
                  {{ elem }}
                </p>
            </div>
            <div>
              <h3 class="text-2xl">Упаковка</h3>
                <p>Элемент в составе</p>
                <p v-for="elem in packaging">
                  {{ elem }}
                </p>
            </div>
            <div>
              <h3 class="text-2xl">Дополнения</h3>
                <p>Элемент в составе</p>
                <p v-for="elem in decoration">
                  {{ elem }}
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script>

const flower = ref([
  { id: 1, title: 'Розы красные', price: 2500, inStock: 50, image: flowerImg },
]).value[0]

const counterValue = ref(15)
const activeButton = ref(15)
const allPresetAmounts = [3, 5, 7, 9, 11, 15, 21, 25, 35, 51]

const availablePresetAmounts = computed(() => {
  return allPresetAmounts.filter(amount => amount <= flower.inStock)
})

const updateActiveButton = () => {
  if (availablePresetAmounts.value.includes(counterValue.value)) {
    activeButton.value = counterValue.value
  } else {
    activeButton.value = null
  }
}

const selectAmount = (amount) => {
  if (amount <= flower.inStock) {
    counterValue.value = amount
    activeButton.value = amount
  } else {
    counterValue.value = flower.inStock
    activeButton.value = null
  }
}

watch(counterValue, () => updateActiveButton())

watch(() => flower.inStock, () => {
  if (counterValue.value > flower.inStock) {
    counterValue.value = flower.inStock
  }
  updateActiveButton()
})
</script>