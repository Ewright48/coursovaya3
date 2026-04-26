<script setup>
import { ref } from 'vue'
import LogInForm from './LogInForm.vue'
import RegistrationForm from './RegistrationForm.vue'
import Cross from '../assets/icons/cross.svg'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['close'])
const { isAuthenticated, logout } = useAuth()

const showLogin = ref(true)

const handleLoginSuccess = () => {
  emit('close')
}

const handleRegisterSuccess = () => {
  showLogin.value = true
}

const switchToLogin = () => {
  showLogin.value = true
}

const switchToRegister = () => {
  showLogin.value = false
}

const handleLogout = () => {
  logout()
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="emit('close')">
    <div class="relative">
      <button @click="emit('close')" class="absolute top-5 right-5 text-white text-2xl hover:text-yellow-300">
        <img :src="Cross" class="w-8 cursor-pointer hover:opacity-70"/>
      </button>
      
      <LogInForm 
        v-if="showLogin" 
        @login-success="handleLoginSuccess"
        @switch-to-register="switchToRegister"
      />
      <RegistrationForm 
        v-else
        @register-success="handleRegisterSuccess"
        @switch-to-login="switchToLogin"
      />
    </div>
  </div>
</template>