export const config = {
  API_BASE: 'https://restaurantapi.stepacademy.ge',
  API_KEY: '0cdc10b8-cf48-4010-9902-7a895179e018',
  PAGE_SIZE: 12,
  CURRENCY: '$',
};

export const price = (n) => `${config.CURRENCY}${Number(n || 0).toFixed(2)}`;
