<script>

</script>

<template>
  <div class="bg-yellow-100 border-2 border-pink-400 rounded-xl px-8 py-4 w-90">
    <h2 class="text-3xl mb-4">Регистрация</h2>
    
    <form @submit.prevent="handleLogin" class="flex flex-col items-center justify-center placeholder:text-yellow-300">
      <input type="email" placeholder="Почта"
        class="w-full mb-4 px-4 py-1 ring ring-green-400 rounded-lg focus:outline-none focus:ring-2"
      />

      <input type="phone" placeholder="Телефон"
        class="w-full mb-4 px-4 py-1 ring ring-green-400 rounded-lg focus:outline-none focus:ring-2"
      />

      <input type="password" placeholder="Пароль"
        class="w-full mb-5 px-4 py-1 ring ring-green-400 rounded-lg focus:outline-none focus:ring-2"
      />
      <!-- добавить проверки на валидность -->

      <input type="submit" value="Войти"
        class="w-full py-1 border-2 border-pink-400 rounded-lg hover:bg-yellow-200"
      >

      <button @click="handleRegister" class="w-full mt-2 text-yellow-300 hover:text-yellow-400 underline decoration-yellow-300">
        Войти
      </button>
    </form>
  </div>
</template>