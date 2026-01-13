export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  isDevelopment: process.env.NODE_ENV === 'development',

  akashML: {
    baseUrl: 'https://api.akashml.com/v1',
    apiKey: process.env.VITE_AKASHML_API_KEY,
    model: 'deepseek-ai/DeepSeek-V3.2',
  },
} as const;

export function validateConfig(): void {
  if (!config.akashML.apiKey) {
    console.warn('Warning: VITE_AKASHML_API_KEY is not set');
  }
}
