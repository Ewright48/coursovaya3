<script setup>
import { ref, reactive } from 'vue'
import { validators } from '../main.js'

const emit = defineEmits(['register', 'switch-to-login'])

const formData = reactive({
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: false,
  phone: false,
  password: false,
  confirmPassword: false
})

const errorMessages = ref('')
const submitted = ref(false)

const validateField = (field, value) => {
  if (!submitted.value) return true
  
  switch(field) {
    case 'email':
      errors.email = !validators.validateEmail(value)
      return !errors.email
    case 'phone':
      errors.phone = !validators.validatePhone(value)
      return !errors.phone
    case 'password':
      errors.password = !validators.validatePassword(value)
      if (!errors.password && formData.confirmPassword) {
        errors.confirmPassword = !validators.validatePasswordMatch(value, formData.confirmPassword)
      }
      return !errors.password
    case 'confirmPassword':
      errors.confirmPassword = !validators.validatePasswordMatch(formData.password, value)
      return !errors.confirmPassword
    default:
      return true
  }
}

const validateForm = () => {
  const isEmailValid = validators.validateEmail(formData.email)
  const isPhoneValid = validators.validatePhone(formData.phone)
  const isPasswordValid = validators.validatePassword(formData.password)
  const isConfirmValid = validators.validatePasswordMatch(formData.password, formData.confirmPassword)
  
  errors.email = !isEmailValid
  errors.phone = !isPhoneValid
  errors.password = !isPasswordValid
  errors.confirmPassword = !isConfirmValid
  
  return isEmailValid && isPhoneValid && isPasswordValid && isConfirmValid
}

const handleRegister = () => {
  submitted.value = true
  errorMessages.value = ''
  
  if (validateForm()) {
    emit('register', { ...formData })
  } else {
    errorMessages.value = 'Пожалуйста, заполните все поля корректно'
  }
}

const switchToLogin = () => {
  emit('switch-to-login')
}

const clearFieldError = (field) => {
  if (submitted.value) {
    validateField(field, formData[field])
  }
}
</script>

<template>
  <div class="bg-yellow-100 border-2 border-pink-400 rounded-xl px-8 py-4 w-90">
    <h2 class="text-3xl mb-4">Регистрация</h2>
    
    <form @submit.prevent="handleRegister" class="flex flex-col items-center justify-center placeholder:text-yellow-300">
      <input type="email" placeholder="Почта"v-model="formData.email" @input="clearFieldError('email')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.email ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.email" class="text-red-400 text-sm mb-2 w-full text-left">Введите корректный email</p>

      <input type="tel" placeholder="Телефон"v-model="formData.phone"@input="clearFieldError('phone')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.phone ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.phone" class="text-red-400 text-sm mb-2 w-full text-left">Введите корректный номер телефона</p>

      <input type="password" placeholder="Пароль" v-model="formData.password" @input="clearFieldError('password')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.password ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.password" class="text-red-400 text-sm mb-2 w-full text-left">Пароль должен содержать минимум 6 символов</p>

      <input type="password" placeholder="Подтвердите пароль" v-model="formData.confirmPassword" @input="clearFieldError('confirmPassword')"
        :class="[
          'w-full mb-2 px-4 py-1 ring rounded-lg focus:outline-none focus:ring-2',
          submitted && errors.confirmPassword ? 'ring-red-400 focus:ring-red-400' : 'ring-green-400 focus:ring-green-400'
        ]"
      />
      <p v-if="submitted && errors.confirmPassword" class="text-red-400 text-sm mb-5 w-full text-left">Пароли не совпадают</p>

      <p v-if="submitted && errorMessages" class="text-red-400 text-sm mb-2 w-full text-left">{{ errorMessages }}</p>

      <input type="submit" value="Зарегистрироваться"
        class="w-full py-1 border-2 border-pink-400 rounded-lg hover:bg-yellow-200 cursor-pointer"
      />

      <button type="button" @click="switchToLogin" 
        class="w-full mt-2 text-yellow-300 hover:text-yellow-400 underline decoration-yellow-300"
      >
        Уже есть аккаунт? Войти
      </button>
    </form>
  </div>
</template>