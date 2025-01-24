import axios from 'axios';

// Backend'in temel URL'si
const API_BASE_URL = 'http://127.0.0.1:5000';

// Ürün önerileri API fonksiyonu
export const getProductRecommendations = async (products: string[]) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/recommend`, { products });
    return response.data;
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    throw error;
  }
};

// Kullanıcı önerileri API fonksiyonu
export const getUserRecommendations = async (userId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user-recommend`, { user_id: userId });
    return response.data;
  } catch (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }
};

// Satış tahminleri API fonksiyonu
export const getSalesForecast = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/forecast-sales`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales forecast:', error);
    throw error;
  }
};
