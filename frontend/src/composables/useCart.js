import { ref } from 'vue'
import api from '../api'

// Гостевая корзина в localStorage
const getGuestCart = () => {
    const cart = localStorage.getItem('guestCart')
    return cart ? JSON.parse(cart) : []
}

const saveGuestCart = (items) => {
    localStorage.setItem('guestCart', JSON.stringify(items))
}

export function useCart() {
    const loading = ref(false)
    const error = ref(null)
    const addedItemId = ref(null)

    const addToCart = async (productId, flowersPerBouquet, bouquetCount = 1) => {
        const token = localStorage.getItem('token')
        
        loading.value = true
        error.value = null
        
        try {
            if (token) {
                const result = await api.addToCart(token, productId, flowersPerBouquet, bouquetCount)
                if (result.error) throw new Error(result.error)
            } else {
                const guestCart = getGuestCart()
                const existingIndex = guestCart.findIndex(
                    item => item.product_id === productId && item.flowers_per_bouquet === flowersPerBouquet
                )
                
                if (existingIndex >= 0) {
                    guestCart[existingIndex].bouquet_count += bouquetCount
                } else {
                    guestCart.push({
                        product_id: productId,
                        flowers_per_bouquet: flowersPerBouquet,
                        bouquet_count: bouquetCount
                    })
                }
                saveGuestCart(guestCart)
            }
            
            addedItemId.value = productId
            setTimeout(() => {
                addedItemId.value = null
            }, 1000)
            
            return true
        } catch (err) {
            error.value = err.message
            console.error(err.message)
            return false
        } finally {
            loading.value = false
        }
    }

    const mergeGuestCart = async (token) => {
        const guestCart = getGuestCart()
        if (guestCart.length === 0) return
        
        for (const item of guestCart) {
            await api.addToCart(token, item.product_id, item.flowers_per_bouquet, item.bouquet_count)
        }
        saveGuestCart([])
    }

    const clearGuestCart = () => {
        saveGuestCart([])
    }

    return {
        addToCart,
        mergeGuestCart,
        clearGuestCart,
        loading,
        error,
        addedItemId
    }
}