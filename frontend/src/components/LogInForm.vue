<script setup>
import { ref, reactive } from 'vue'
import { validators } from '../main.js'
import { useAuth } from '../composables/useAuth'

const emit = defineEmits(['login-success', 'switch-to-register'])
const { login, loading } = useAuth()

const formData = reactive({
  login: '',
  password: ''
})

const errors = reactive({
  login: false,
  password: false
})

const errorMessages = ref('')
const submitted = ref(false)

const validateField = (field, value) => {
  if (!submitted.value) return true
  
  switch(field) {
    case 'login':
      errors.login = !validators.validateLogin(value)
      return !errors.login
    case 'password':
      errors.password = !validators.validatePassword(value)
      return !errors.password
    default:
      return true
  }
}

const validateForm = () => {
  const isLoginValid = validators.validateLogin(formData.login)
  const isPasswordValid = validators.validatePassword(formData.password)
  
  errors.login = !isLoginValid
  errors.password = !isPasswordValid
  
  return isLoginValid && isPasswordValid
}

const handleLogin = async () => {
  submitted.value = true
  errorMessages.value = ''
  
  if (!validateForm()) return
  
  const result = await login(formData)
  if (result.success) {
    emit('login-success')
  } else {
    errorMessages.value = result.error || 'Неверный email/телефон или пароль'
  }
}

const switchToRegister = () => {
  emit('switch-to-register')
}

const clearFieldError = (field) => {
  if (submitted.value) {
    validateField(field, formData[field])
  }
}
</script>

<template>
  <div class="bg-yellow-100 border-2 border-pink-400 rounded-xl px-8 py-4 w-90">
    <h2 class="text-3xl mb-4">Вход</h2>
    
    <form @submit.prevent="handleLogin" class="flex flex-col items-center justify-center placeholder:text-yellow-300">
      <input type="text" placeholder="Почта" v-model="formData.login" @input="clearFieldError('login')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.login ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.login" class="text-red-400 text-sm mb-2 w-full text-left">Введите корректный email</p>

      <input type="password" placeholder="Пароль" v-model="formData.password" @input="clearFieldError('password')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.password ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.password" class="text-red-400 text-sm mb-2 w-full text-left">Пароль должен содержать минимум 6 символов</p>

      <p v-if="errorMessages" class="text-red-400 text-sm mb-2 w-full text-left">{{ errorMessages }}</p>

      <input type="submit" :value="loading ? 'Вход...' : 'Войти'"
        class="w-full py-1 border-2 border-pink-400 rounded-lg hover:bg-yellow-200 cursor-pointer disabled:opacity-50"
        :disabled="loading"
      />

      <button type="button" @click="switchToRegister" 
        class="w-full mt-2 text-yellow-300 hover:text-yellow-400 underline decoration-yellow-300"
      >
        Зарегистрироваться
      </button>
    </form>
  </div>
</template>