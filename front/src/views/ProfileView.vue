<script setup>
import { ref, computed, reactive } from 'vue'
import OrderCard from '../components/OrderCard.vue'
import flowerImg from '../assets/images/flower1.jpg'
import { validators } from '../main.js'

const emit = defineEmits(['update-profile', 'delete-account'])

const orders = ref([
  {
    id: 1,
    items: [{ id: 101, image: flowerImg, title: 'Букет из красных роз', flowerCount: 15, quantity: 1, price: 1000 }],
    priceTotal: 1000,
    status: 'completed'
  },
  {
    id: 2,
    items: [{ id: 102, image: flowerImg, title: 'Букет из белых роз', flowerCount: 21, quantity: 2, price: 1200 }],
    priceTotal: 2400,
    status: 'active'
  },
  {
    id: 3,
    items: [{ id: 103, image: flowerImg, title: 'Букет из пионов', flowerCount: 11, quantity: 1, price: 1500 }],
    priceTotal: 1500,
    status: 'completed'
  },
  {
    id: 4,
    items: [{ id: 104, image: flowerImg, title: 'Букет из тюльпанов', flowerCount: 25, quantity: 1, price: 1800 }],
    priceTotal: 1800,
    status: 'active'
  },
  {
    id: 5,
    items: [
      { id: 105, image: flowerImg, title: 'Букет из роз', flowerCount: 15, quantity: 1, price: 2000 },
      { id: 106, image: flowerImg, title: 'Букет из лилий', flowerCount: 11, quantity: 2, price: 1500 },
      { id: 107, image: flowerImg, title: 'Букет из хризантем', flowerCount: 21, quantity: 1, price: 1800 }
    ],
    priceTotal: 6800,
    status: 'active'
  }
])

const activeOrders = computed(() => orders.value.filter(order => order.status === 'active'))
const completedOrders = computed(() => orders.value.filter(order => order.status === 'completed'))

const activeTab = ref('active')
const submitted = ref(false)
const errorMessages = ref('')
const successMessage = ref('')

const ORIGINAL_DATA = {
  phone: '+7 (999) 00-00',
  email: 'flower@main.ru',
  address: 'г. Москва, ул. Цветочная, д. 10'
}

const formData = reactive({ ...ORIGINAL_DATA, password: '', confirmPassword: '' })

const errors = reactive({
  phone: false,
  email: false,
  address: false,
  password: false,
  confirmPassword: false
})

const isFieldFilled = (value) => value && value.trim() !== ''

const hasChanges = () => {
  return formData.phone !== ORIGINAL_DATA.phone ||
         formData.email !== ORIGINAL_DATA.email ||
         formData.address !== ORIGINAL_DATA.address ||
         isFieldFilled(formData.password)
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
  ORIGINAL_DATA.phone = formData.phone
  ORIGINAL_DATA.email = formData.email
  ORIGINAL_DATA.address = formData.address
  formData.password = ''
  formData.confirmPassword = ''
  errors.password = false
  errors.confirmPassword = false
}

const setActiveTab = (tab) => {
  activeTab.value = tab
}

const handleUpdate = () => {
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

  const updateData = { phone: formData.phone, email: formData.email, address: formData.address }
  if (isFieldFilled(formData.password)) updateData.password = formData.password

  emit('update-profile', updateData)
  successMessage.value = 'Данные успешно обновлены'
  
  resetForm()
  setTimeout(() => {
    successMessage.value = ''
    submitted.value = false
  }, 3000)
}

const handleDeleteAccount = () => {
  if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие необратимо.')) {
    emit('delete-account')
  }
}

const inputFields = [
  { name: 'phone', label: 'Телефон', type: 'tel', placeholder: '+7 (999) 000-00-00', errorMsg: 'Введите корректный номер телефона' },
  { name: 'email', label: 'Почта', type: 'email', placeholder: 'flower@mail.ru', errorMsg: 'Введите корректный email' },
  { name: 'address', label: 'Адрес', type: 'text', placeholder: 'г. Москва, ул. Цветочная, д. 10', errorMsg: 'Введите адрес доставки' },
  { name: 'password', label: 'Новый пароль', type: 'password', placeholder: '••••••••', errorMsg: 'Пароль должен содержать минимум 6 символов' },
  { name: 'confirmPassword', label: 'Подтвердите пароль', type: 'password', placeholder: '••••••••', errorMsg: 'Пароли не совпадают' }
]
</script>

<template>
  <div class="flex gap-8 p-6 min-h-screen">
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

        <button @click="handleUpdate" 
          class="my-8 w-full px-4 py-2 ring-2 ring-pink-400 rounded-lg hover:bg-yellow-200 hover:ring-3 text-lg transition-all"
        >
          Изменить данные
        </button>
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
          :class="['pb-1 transition-all', activeTab === 'active' 
              ? 'border-b-2 border-pink-400 text-pink-400' 
              : 'text-yellow-300 hover:text-yellow-400'
          ]"
        >
          Активные ({{ activeOrders.length }})
        </button>
        <button @click="setActiveTab('history')"
          :class="['pb-1 transition-all', activeTab === 'history' 
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
          <OrderCard v-for="order in activeOrders" :key="order.id" :order="order" :show-status="true" />
        </div>

        <div v-else>
          <div v-if="completedOrders.length === 0" class="text-center py-8 text-stone-700">
            Нет выполненных заказов
          </div>
          <OrderCard v-for="order in completedOrders" :key="order.id" :order="order" :show-status="false" />
        </div>
      </div>
    </section>
  </div>
</template>