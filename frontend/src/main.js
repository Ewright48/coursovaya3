import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'


//Валидация
export const validators = {
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  validatePhone(phone) {
    const phoneRegex = /^[\+\d\s\(\)\-]{10,}$/
    return phoneRegex.test(phone)
  },

  validatePassword(password) {
    return password && password.length >= 6
  },

  validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword
  },

  validateAddress(address) {
    return address && address.trim().length > 0
  },

  validateLogin(login) {
    return this.validateEmail(login) || this.validatePhone(login)
  },

  getErrorClass(isValid) {
    return isValid ? '' : 'ring-red-400 focus:ring-red-400'
  }
}

createApp(App).use(router).mount('#app')
