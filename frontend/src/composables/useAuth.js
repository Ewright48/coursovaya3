import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useCart } from './useCart'

// Инициализация при загрузке модуля
const user = ref(null)
const token = ref(localStorage.getItem('token') || null)
const loading = ref(false)

export function useAuth() {
    const router = useRouter()
    const { mergeGuestCart } = useCart()
    const isAuthenticated = computed(() => !!token.value && !!user.value)

    const loadUser = async () => {
        if (!token.value) return false
        try {
            const data = await api.getMe(token.value)
            if (data.error) throw new Error(data.error)
            user.value = data
            return true
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error)
            logout()
            return false
        }
    }

    const register = async (userData) => {
        loading.value = true
        try {
            const { email, phone, password, address = '' } = userData
            const data = await api.register(email, phone, password, address)
            if (data.error) throw new Error(data.error)
            
            token.value = data.token
            localStorage.setItem('token', data.token)
            user.value = data.user
            
            await mergeGuestCart(token.value)
            
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    const login = async (credentials) => {
        loading.value = true
        try {
            const { login: email, password } = credentials
            const data = await api.login(email, password)
            if (data.error) throw new Error(data.error)
            
            token.value = data.token
            localStorage.setItem('token', data.token)
            user.value = data.user
            
            await mergeGuestCart(token.value)
            
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        } finally {
            loading.value = false
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('token')
        router.push('/')
    }

    const updateProfile = async (profileData) => {
        if (!token.value) return { success: false, error: 'Не авторизован' }
        try {
            const data = await api.updateProfile(token.value, profileData)
            if (data.error) throw new Error(data.error)
            user.value = data.user || user.value
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const deleteAccount = async () => {
        if (!token.value) return { success: false, error: 'Не авторизован' }
        try {
            const data = await api.deleteAccount(token.value)
            if (data.error) throw new Error(data.error)
            logout()
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // Автоматическая проверка токена при первой загрузке
    const initAuth = async () => {
        if (token.value && !user.value) {
            await loadUser()
        }
    }

    initAuth()

    return {
        user,
        isAuthenticated,
        loading,
        register,
        login,
        logout,
        loadUser,
        updateProfile,
        deleteAccount,
        initAuth
    }
}