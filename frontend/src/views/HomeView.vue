<script setup>
import { ref, onMounted } from 'vue'
import banner from '../assets/images/banner.png'
import CardProductMini from '../components/CardProductMini.vue';
import api from '../api';

const popularProducts = ref([])
const newProducts = ref([])
const loading = ref(true)

onMounted(async () => {
    try {
        const [popular, newItems] = await Promise.all([
            api.getPopularProducts(),
            api.getNewProducts()
        ])
        popularProducts.value = popular
        newProducts.value = newItems
    } catch (error) {
        console.error('Ошибка загрузки:', error)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <section class="flex justify-between mt-20">
        <div class="w-1/2 text-2xl flex flex-col justify-center">
            <h1 class="text-7xl mb-20">Свежие цветы — быстро и с любовью</h1>
            <p class="w-115">Хотите удивить близких? У нас вы найдёте букеты на любой вкус и повод! Быстрая доставка, качественный сервис и всегда свежие цветы — ваш идеальный выбор.</p>
            <button class="mt-13 w-30 border-2 rounded-md border-pink-400 hover:bg-yellow-100 px-2 transition-all">
                <router-link to="/catalog">В каталог</router-link>
            </button>
        </div>
        <img :src="banner" alt="Banner">
    </section>

    <section class="flex flex-col justify-center mt-20">
        <h2 class="text-4xl text-center">Популярное</h2>
        <div v-if="loading" class="text-center py-10">Загрузка...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-20 mt-10">
            <CardProductMini 
                v-for="item in popularProducts" 
                :key="item.id" 
                :id="item.id"
                :image="item.image" 
                :name="item.name" 
                :price="item.price"
            />
        </div>
    </section>

    <section class="flex flex-col justify-center mt-20">
        <h2 class="text-4xl text-center">Новинки</h2>
        <div v-if="loading" class="text-center py-10">Загрузка...</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-20 mt-10">
            <CardProductMini 
                v-for="item in newProducts" 
                :key="item.id" 
                :id="item.id"
                :image="item.image" 
                :name="item.name" 
                :price="item.price"
            />
        </div>
    </section>
</template>