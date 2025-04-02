// Импорт необходимых модулей и типов
import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'utils/types';

// Определение обработчика POST-запросов
export const POST = async (request: NextRequest) => {
  // Извлечение параметров из тела запроса
  const params = await request.json();
  const prompt = params.prompt as string;

  // Отправка запроса на внешний API для генерации изображения
  const response = await fetch('https://api.ideogram.ai/generate', {
    method: 'POST',
    body: JSON.stringify({
      image_request: {
        model: 'V_2', // Модель, используемая для генерации изображения
        prompt, // Текстовый запрос для генерации изображения
        aspect_ratio: 'ASPECT_1_1', // Соотношение сторон изображения
        magic_prompt_option: 'AUTO', // Опция для автоматического улучшения запроса
      },
    }),
    headers: {
      'Content-Type': 'application/json', // Указание типа содержимого
      'Api-Key': process.env.IDEOGRAM_API_KEY!, // API-ключ для доступа к сервису
    },
  });

  // Извлечение URL сгенерированного изображения из ответа
  const payload = (await response.json()) as ImageResponse;
  const url = payload.data[0].url;

  // Возврат URL изображения в формате JSON
  return new NextResponse(JSON.stringify({ url }), { status: 200 });
};
