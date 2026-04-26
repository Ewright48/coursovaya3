<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OrderCard from '../components/OrderCard.vue'
import { validators } from '../main.js'
import api from '../api'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { isAuthenticated, user, updateProfile, deleteAccount, logout, loadUser } = useAuth()

const orders = ref([])
const loading = ref(true)
const activeTab = ref('active')
const submitted = ref(false)
const errorMessages = ref('')
const successMessage = ref('')

const formData = reactive({
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  phone: false,
  email: false,
  address: false,
  password: false,
  confirmPassword: false
})

// Статусы для активных заказов
const activeStatuses = ['pending', 'active', 'processing', 'confirmed', 'preparing', 'delivery']
const completedStatuses = ['completed', 'cancelled', 'rejected']

const activeOrders = computed(() => {
  return orders.value.filter(order => activeStatuses.includes(order.status))
})

const completedOrders = computed(() => {
  return orders.value.filter(order => completedStatuses.includes(order.status))
})

const loadOrders = async () => {
  const token = localStorage.getItem('token')
  if (!token) {
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const data = await api.getOrders(token)
    orders.value = data || []
  } catch (error) {
    console.error('Ошибка загрузки заказов:', error)
    orders.value = []
  } finally {
    loading.value = false
  }
}

const initForm = () => {
  if (user.value) {
    formData.email = user.value.email || ''
    formData.phone = user.value.phone || ''
    formData.address = user.value.address || ''
  }
}

const isFieldFilled = (value) => value && value.trim() !== ''

const hasChanges = () => {
  return formData.phone !== (user.value?.phone || '') ||
         formData.email !== (user.value?.email || '') ||
         formData.address !== (user.value?.address || '') ||
         isFieldFilled(formData.password)
}

const handleExit = () => {
  logout()
  router.push('/')
}

const isRequiredFieldsFilled = () => {
  return ['phone', 'email', 'address'].every(field => isFieldFilled(formData[field]))
}

const validationRules = {
  email: (value) => !value || validators.validateEmail(value),
  phone: (value) => !value || validators.validatePhone(value),
  address: (value) => !value || validators.validateAddress(value),
  password: (value) => !value || validators.validatePassword(value),
  confirmPassword: (value) => !formData.password || validators.validatePasswordMatch(formData.password, value)
}

const isValid = (field, value) => validationRules[field]?.(value) ?? true

const updateErrors = () => {
  Object.keys(errors).forEach(field => {
    errors[field] = submitted.value && !isValid(field, formData[field])
  })
}

const validateForm = () => {
  if (!isRequiredFieldsFilled()) {
    errorMessages.value = 'Пожалуйста, заполните все обязательные поля'
    return false
  }

  const invalidFields = ['email', 'phone', 'address'].filter(field => 
    !validators[`validate${field.charAt(0).toUpperCase() + field.slice(1)}`](formData[field])
  )
  
  if (invalidFields.length) {
    invalidFields.forEach(field => errors[field] = true)
    errorMessages.value = 'Пожалуйста, исправьте ошибки в форме'
    return false
  }

  if (isFieldFilled(formData.password) && !validators.validatePassword(formData.password)) {
    errors.password = true
    errorMessages.value = 'Пожалуйста, исправьте ошибки в форме'
    return false
  }

  if (isFieldFilled(formData.password) && !validators.validatePasswordMatch(formData.password, formData.confirmPassword)) {
    errors.confirmPassword = true
    errorMessages.value = 'Пожалуйста, исправьте ошибки в форме'
    return false
  }

  return true
}

const resetForm = () => {
  initForm()
  formData.password = ''
  formData.confirmPassword = ''
  errors.password = false
  errors.confirmPassword = false
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const handleUpdate = async () => {
  submitted.value = true
  errorMessages.value = ''
  successMessage.value = ''
  
  updateErrors()

  if (!isRequiredFieldsFilled()) {
    errorMessages.value = 'Пожалуйста, заполните все обязательные поля'
    return
  }

  if (!validateForm()) return
  if (!hasChanges()) {
    errorMessages.value = 'Нет изменений для сохранения'
    return
  }

  const updateData = {
    email: formData.email,
    phone: formData.phone,
    address: formData.address
  }
  if (isFieldFilled(formData.password)) {
    updateData.password = formData.password
  }

  const result = await updateProfile(updateData)
  if (result.success) {
    successMessage.value = 'Данные успешно обновлены'
    resetForm()
    setTimeout(() => {
      successMessage.value = ''
      submitted.value = false
    }, 3000)
  } else {
    errorMessages.value = result.error || 'Ошибка при обновлении данных'
  }
}

const handleDeleteAccount = async () => {
  if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
    const result = await deleteAccount()
    if (result.success) {
      router.push('/')
    } else {
      alert(result.error || 'Ошибка при удалении аккаунта')
    }
  }
}

const inputFields = [
  { name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (999) 000-00-00', errorMsg: 'Введите корректный номер телефона' },
  { name: 'email', label: 'Почта', type: 'email', placeholder: 'flower@mail.ru', errorMsg: 'Введите корректный email' },
  { name: 'address', label: 'Адрес', type: 'text', placeholder: 'г. Москва, ул. Цветочная, д. 10', errorMsg: 'Введите адрес доставки' },
  { name: 'password', label: 'Новый пароль', type: 'password', placeholder: '••••••••', errorMsg: 'Пароль должен содержать минимум 6 символов' },
  { name: 'confirmPassword', label: 'Подтвердите пароль', type: 'password', placeholder: '••••••••', errorMsg: 'Пароли не совпадают' }
]

onMounted(async () => {
  // Сначала загружаем пользователя, если есть токен
  await loadUser()
  
  // После загрузки пользователя проверяем авторизацию
  if (!isAuthenticated.value) {
    router.push('/')
    return
  }
  
  initForm()
  await loadOrders()
})

const repeatOrder = async (orderId) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Войдите в аккаунт')
    return
  }
  try {
    await api.repeatOrder(token, orderId)
    alert('Товары добавлены в корзину')
  } catch (error) {
    console.error('Ошибка повторения заказа:', error)
    alert('Ошибка при добавлении в корзину')
  }
}

const cancelOrder = async (orderId) => {
  if (!confirm('Отменить заказ?')) return
  
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    await api.cancelOrder(token, orderId)
    alert('Заказ отменён')
    await loadOrders()
  } catch (error) {
    console.error('Ошибка отмены заказа:', error)
    alert('Ошибка при отмене заказа')
  }
}
</script>

<template>
  <div v-if="loading && orders.length === 0" class="flex gap-8 p-6 min-h-screen items-center justify-center">
    <div class="text-stone-500">Загрузка...</div>
  </div>
  <div v-else class="flex gap-8 p-6 min-h-screen">
    <section class="w-1/3 bg-yellow-100 rounded-lg border border-yellow-400 shadow-sm">
      <div class="p-6">
        <h2 class="text-2xl text-stone-800 mb-6">Мой профиль</h2>

        <div class="space-y-4">
          <div v-for="field in inputFields" :key="field.name" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label class="text-yellow-400 w-24 text-sm font-medium">{{ field.label }}</label>
            <div class="flex-1">
              <input :type="field.type" :placeholder="field.placeholder" v-model="formData[field.name]"
                :class="[
                  'w-full px-3 py-2 bg-white ring-1 rounded-md focus:outline-none hover:ring-2 focus:ring-2 transition-all',
                  field.name !== 'password' && field.name !== 'confirmPassword' ? 'placeholder:text-gray-400' : '',
                  submitted && errors[field.name] 
                    ? 'ring-red-400 hover:ring-red-400 focus:ring-red-400' 
                    : 'ring-green-400 hover:ring-green-400 focus:ring-green-400'
                ]"
              />
              <p v-if="submitted && errors[field.name]" class="text-red-400 text-xs mt-1">
                {{ field.errorMsg }}
              </p>
            </div>
          </div>
        </div>

        <p v-if="submitted && errorMessages" class="text-red-400 text-sm mt-4 text-center">{{ errorMessages }}</p>
        <p v-if="successMessage" class="text-green-400 text-sm mt-4 text-center">{{ successMessage }}</p>
        <div>
          <button @click="handleUpdate" 
            class="my-8 w-full px-4 py-2 ring-2 ring-pink-400 rounded-lg hover:bg-yellow-200 hover:ring-3 text-lg transition-all"
          >
            Изменить данные
          </button>

          <button @click="handleExit" 
            class="mb-8 w-full px-4 py-2 ring-2 ring-pink-400 rounded-lg hover:bg-yellow-200 hover:ring-3 text-lg transition-all"
          >
            Выйти из аккаунта
          </button>          
        </div>

        <button @click="handleDeleteAccount" 
          class="w-full px-4 py-2 ring-2 ring-red-400 text-red-400 rounded-lg hover:bg-yellow-200 hover:ring-3 hover:ring-red-400 text-lg transition-all"
        >
          Удалить аккаунт
        </button>
      </div>
    </section>

    <section class="w-2/3 bg-yellow-100 p-6 rounded-lg border border-yellow-400">
      <h2 class="text-2xl mb-6">Мои заказы</h2>

      <div class="flex gap-8 mb-6 border-b border-yellow-400">
        <button @click="setActiveTab('active')"
          :class="[
            'pb-1 transition-all',
            activeTab === 'active' 
              ? 'border-b-2 border-pink-400 text-pink-400' 
              : 'text-yellow-300 hover:text-yellow-400'
          ]"
        >
          Активные ({{ activeOrders.length }})
        </button>
        <button @click="setActiveTab('history')"
          :class="[
            'pb-1 transition-all',
            activeTab === 'history' 
              ? 'border-b-2 border-pink-400 text-pink-400' 
              : 'text-yellow-300 hover:text-yellow-400'
          ]"
        >
          История ({{ completedOrders.length }})
        </button>
      </div>

      <div class="space-y-6">
        <div v-if="activeTab === 'active'">
          <div v-if="activeOrders.length === 0" class="text-center py-8 text-stone-700">
            Нет активных заказов
          </div>
          <OrderCard 
            v-for="order in activeOrders" 
            :key="order.order_id" 
            :order="order" 
            :show-status="true"
            @repeat-order="repeatOrder"
            @cancel-order="cancelOrder"
          />
        </div>

        <div v-else>
          <div v-if="completedOrders.length === 0" class="text-center py-8 text-stone-700">
            Нет выполненных заказов
          </div>
          <OrderCard 
            v-for="order in completedOrders" 
            :key="order.order_id" 
            :order="order" 
            :show-status="false"
            @repeat-order="repeatOrder"
          />
        </div>
      </div>
    </section>
  </div>
</template>