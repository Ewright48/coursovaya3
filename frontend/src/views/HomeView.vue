<script setup>
import { ref } from 'vue'
import banner from '../assets/images/banner.png'
import flowerImg from '../assets/images/flower1.jpg'
import CardProductMini from '../components/CardProductMini.vue';

const flower = ref([ //в бэкенде фильтр на популярное, новое, со скидкой(?)
    { id: 1, title: 'Розы красные', price: 2500, image: flowerImg },
    { id: 2, title: 'Тюльпаны', price: 1800, image: flowerImg },
    { id: 3, title: 'Пионы', price: 3200, image: flowerImg },
])
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
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-20 mt-10">
            <CardProductMini v-for="item in flower" :key="item.id" :id="item.id"
            :image="item.image" :name="item.title" :price="item.price"/>
        </div>
        
    </section>
    <section class="flex flex-col justify-center mt-20">
        <h2 class="text-4xl text-center">Новинки</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-20 mt-10">
            <CardProductMini 
                v-for="item in flower" :key="item.id" :id="item.id" :image="item.image"
                :name="item.title" :price="item.price"/>
        </div>
    </section>

</template>