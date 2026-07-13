import api from './api';

const cartService = {
  getCartByUser: async (userId) => {
    return api.get(`/cart/user/${userId}`);
  },

  getCartItems: async (cartId) => {
    return api.get(`/cart/${cartId}/items`);
  },

  addItem: async (cartId, productId, quantity = 1) => {
    return api.post(`/cart/${cartId}/items`, null, { params: { productId, quantity } });
  },

  updateItemQuantity: async (itemId, quantity) => {
    return api.put(`/cart/items/${itemId}`, null, { params: { quantity } });
  },

  removeItem: async (itemId) => {
    return api.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (cartId) => {
    return api.delete(`/cart/${cartId}`);
  }
};

export default cartService;
