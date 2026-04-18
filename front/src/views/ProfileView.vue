<script setup>
import {ref} from 'vue';
import OrderCard from '../components/OrderInMyOrder.vue'
</script>

<template>
  <div class="flex gap-8 p-6 min-h-screen">
    <section class="w-1/3 bg-yellow-100 rounded-lg border border-yellow-400 shadow-sm">
      <div class="p-6">
        <h2 class="text-2xl text-stone-800 mb-6">Мой профиль</h2>

        <div class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label class="text-yellow-400 w-24 text-sm font-medium">Телефон</label>
              <input type="tel" placeholder="+7 (999) 000-00-00" value="+7 (999) 00-00"
                class="w-full px-3 py-2 bg-white ring-1 ring-green-400 rounded-md focus:outline-none hover:ring-2 focus:ring-2 focus:ring-green-400 transition-all placeholder:text-gray-400"
              />
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label class="text-yellow-400 w-24 text-sm font-medium">Почта</label>
              <input type="email" placeholder="flower@mail.ru" value="flower@main.ru"
                class="w-full px-3 py-2 bg-white ring-1 ring-green-400 rounded-md focus:outline-none hover:ring-2 focus:ring-2 focus:ring-green-400 transition-all placeholder:text-gray-400"
              />
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label class="text-yellow-400 w-24 text-sm font-medium">Пароль</label>
              <input type="password" placeholder="••••••••"
                class="w-full px-3 py-2 bg-white ring-1 ring-green-400 rounded-md focus:outline-none hover:ring-2 focus:ring-2 focus:ring-green-400 transition-all"
              />
          </div>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label class="text-yellow-400 w-24 text-sm font-medium">Адрес</label>
              <input type="text" placeholder="г. Москва, ул. Цветочная, д. 10" value="г. Москва, ул. Цветочная, д. 10"
                class="w-full px-3 py-2 bg-white ring-1 ring-green-400 rounded-md focus:outline-none hover:ring-2 focus:ring-2 focus:ring-green-400 transition-all placeholder:text-gray-400"
              />
          </div>
        </div>

        <button class="my-8 w-full px-4 py-2 ring-2 ring-pink-400 rounded-lg hover:bg-yellow-200 hover:ring-3 text-lg transition-all">
          Изменить данные
        </button>
        <button class="w-full px-4 py-2 ring-2 ring-[#D17569] text-[#D17569] rounded-lg hover:bg-yellow-200 hover:ring-3 hover:ring-[#D17569] text-lg transition-all">
          Удалить аккаунт
        </button>
      </div>
    </section>

    <section class="w-2/3 bg-yellow-100 p-6 rounded-lg border border-yellow-400">
      <h2 class="text-2xl mb-6">Мои заказы</h2>

      <div class="flex gap-8 mb-6 border-b border-yellow-400">
        <button class="pb-1 border-b-2 border-pink-400 text-pink-400">Активные</button>
        <button class="pb-1 text-yellow-300 hover:text-yellow-400">История</button>
      </div>

      <div class="space-y-4">
        <OrderCard />
      </div>
    </section>
  </div>
</template>

