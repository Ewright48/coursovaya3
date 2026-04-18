<script setup>
import { ref } from 'vue'
import arrowSort from '../assets/icons/arrow-sort.svg'
import arrowUp from '../assets/icons/arrow-up.svg'
import flowerImg from '../assets/images/flower1.jpg'
import CardProductMini from '../components/CardProductMini.vue'

const validateNumber = (event) => {
  let value = event.target.value;
  value = value.replace(/\D/g, '');
  if (value.length > 1 && value.startsWith('0')) {
    value = value.substring(1);
  }
  event.target.value = value;
};

const flower = ref([
  { id: 1, title: 'Розы красные', price: 2500, image: flowerImg },
  { id: 2, title: 'Тюльпаны', price: 1800, image: flowerImg },
  { id: 3, title: 'Пионы', price: 3200, image: flowerImg },
])
const composition = {
  Розы: 3,
  Гортензии: 2,
  Хризантемы: 2,
  Микс: 2,
};  //все переделать

const colors = {
  Красный: 3,
  Белый: 2,
  Микс: 4,
};
</script>

<template>
  <div class="text-yellow-300 my-4">
    <router-link to="/" class="text-yellow-300 hover:text-yellow-400">Главная</router-link> > <span class="text-yellow-400">Каталог</span>
  </div>

  <div class="   w-48 bg-yellow-100 border border-yellow-400 rounded-lg p-4">
    <!-- мб скрыть примененный вариант, починить сетку каталога -->
    <button class=" hover:bg-yellow-200 p-2 rounded-sm w-full text-start">По популярности</button>
    <hr class="my-1 border-green-400">
    <button class=" hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Новинки</button>
    <hr class="my-1 border-green-400">
    <button class=" hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Цена по возрастанию</button>
    <hr class="my-1 border-green-400">
    <button class=" hover:bg-yellow-200 p-2 rounded-sm w-full text-start">Цена по убыванию</button>
  </div>

  <div class="flex items-start">
    <aside class="bg-yellow-100 rounded-lg border border-green-400 p-6 font-display">
      <h2 class="text-4xl">Фильтры</h2>

      <div class="my-6">
        <h3 class="text-lg font-medium mb-2">Цена</h3>
        <div class="flex items-center gap-2 mb-2">
          <span>от</span>
          <input type="text" pattern="[0-9]*" min="0" value="0" @input="validateNumber"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2"
          />
          <span>до</span>
          <input type="text" pattern="[0-9]*" min="0" value="0" @input="validateNumber"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2">Количество</h3>
        <div class="flex items-center gap-2 mb-2">
          <span>от</span>
          <input type="text" pattern="[0-9]*" min="0" value="0" @input="validateNumber"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2"
          />
          <span>до</span>
          <input type="text" pattern="[0-9]*" min="0" value="0" @input="validateNumber"
            class="w-18 px-2 ring ring-pink-400 rounded text-center bg-yellow-200 focus:outline-none focus:ring-2"
          />
        </div>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-medium mb-2 inline-flex items-center gap-1">
          Состав <img :src="arrowUp" class="w-4 h-4" alt="Sort" />
        </h3>
        <div class="space-y-2">
          <div v-for="(count, name) in composition" :key="name" class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="desine-checkbox h-4 w-4 text-green-400 rounded focus:ring-green-400" />
              <span>{{ name }}</span>
            </label>
            <span class="text-sm text-green-400">{{ count }}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium mb-2 inline-flex items-center gap-1">
          Цвет <img :src="arrowUp" class="w-4 h-4" alt="Sort" />
        </h3>
        <div class="space-y-2">
          <div v-for="(count, color) in colors" :key="color" class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" class="desine-checkbox h-4 w-4 text-green-400 rounded focus:ring-green-400" />
              <span>{{ color }}</span>
            </label>
            <span class="text-sm text-green-400">{{ count }}</span>
          </div>
        </div>
      </div>
    </aside>

    <section class="flex flex-col w-full ml-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-4xl">Каталог</h2>
        <button class="flex gap-2 items-center">
          <img :src="arrowSort" class="w-6" alt="Sort" />
          <p class="text-lg">По популярности</p>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <CardProductMini
          v-for="item in flower"
          :key="item.id"
          :id="item.id"
          :image="item.image"
          :name="item.title"
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