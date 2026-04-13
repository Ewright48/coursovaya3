<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import LogInForm from './components/LogInForm.vue'
import RegistrationForm from './components/RegistrationForm.vue'
</script>

<template>
  <Header />
  <main class="md:px-15 px-10 mb-20">
    <router-view />
  </main>
  <Footer />
</template>