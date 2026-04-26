const API_URL = 'http://localhost:5000/api';

const api = {
    // Товары
    async getPopularProducts() {
        const res = await fetch(`${API_URL}/home/popular`);
        return res.json();
    },
    
    async getNewProducts() {
        const res = await fetch(`${API_URL}/home/new`);
        return res.json();
    },
    
    async getProducts(filters = {}, page = 1, limit = 12, sort = 'popular') {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        params.append('sort', sort);

        // Фильтры
        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);
        if (filters.min_flowers) params.append('min_flowers', filters.min_flowers);
        if (filters.max_flowers) params.append('max_flowers', filters.max_flowers);
        if (filters.flower_ids) params.append('flower_ids', filters.flower_ids);
        if (filters.color_ids) params.append('color_ids', filters.color_ids);
        
        const res = await fetch(`${API_URL}/products?${params}`);
        return res.json();
    },
    
    async getProductById(id) {
        const res = await fetch(`${API_URL}/products/${id}`);
        return res.json();
    },
    
    async getFilterFlowers() {
        const res = await fetch(`${API_URL}/filters/flowers`);
        const data = await res.json();
        return data;
    },

    async getFilterColors() {
        const res = await fetch(`${API_URL}/filters/colors`);
        const data = await res.json();
        return data;
    },
    
    // Корзина (требует авторизацию)
    async getCart(token) {
        const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async addToCart(token, productId, flowersPerBouquet, bouquetCount = 1) {
        const res = await fetch(`${API_URL}/cart/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, flowers_per_bouquet: flowersPerBouquet, bouquet_count: bouquetCount })
        });
        return res.json();
    },
    
    async updateCartItem(token, itemId, bouquetCount) {
        const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bouquet_count: bouquetCount })
        });
        return res.json();
    },
    
    async removeCartItem(token, itemId) {
        const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async clearCart(token) {
        const res = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    // Заказы
    async createOrder(token, orderData) {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
        return res.json();
    },
    
    async getOrders(token) {
        const res = await fetch(`${API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async repeatOrder(token, orderId) {
        const res = await fetch(`${API_URL}/orders/${orderId}/repeat`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async cancelOrder(token, orderId) {
        const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    // Аутентификация
    async register(email, phone, password, address = '') {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phone, password, address })
        });
        return res.json();
    },
    
    async login(email, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        return res.json();
    },
    
    async getMe(token) {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async updateProfile(token, data) {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    async deleteAccount(token) {
        const res = await fetch(`${API_URL}/users/me`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    }
};

export default api;