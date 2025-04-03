// Импорт необходимых модулей и типов
import { serve } from '@upstash/workflow/nextjs';
import { Redis } from '@upstash/redis';
import { ImageResponse } from 'utils/types';

// Инициализация Redis из переменных окружения
const redis = Redis.fromEnv();

// Определение обработчика POST-запросов с использованием Upstash Workflow
export const { POST } = serve<{ prompt: string }>(async (context) => {
  // Извлечение запроса из контекста
  const { prompt } = context.requestPayload;

  // Вызов внешнего API Ideogram через QStash для генерации изображения
  const { body: result } = await context.call(
    'call image generation API',
    {
      url: 'https://api.ideogram.ai/generate',
      method: 'POST',
      body: {
        image_request: {
          model: 'V_2', // Модель, используемая для генерации изображения
          prompt, // Текстовый запрос для генерации изображения
          aspect_ratio: 'ASPECT_1_1', // Соотношение сторон изображения
          magic_prompt_option: 'AUTO', // Опция для автоматического улучшения запроса
        },
      },
      headers: {
        'Content-Type': 'application/json', // Указание типа содержимого
        'Api-Key': process.env.IDEOGRAM_API_KEY!, // API-ключ для доступа к сервису
      },
    }
  ) as { body: ImageResponse };

  // Сохранение URL изображения в Redis
  await context.run('save results in redis', async () => {
    await redis.set<string>(
      context.headers.get('callKey')!, // Ключ для хранения URL
      result.data[0].url, // URL изображения
      { ex: 120 }, // Время истечения кэша - 120 секунд
    );
  });
});
