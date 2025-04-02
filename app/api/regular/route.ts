// Экспорт константы максимальной продолжительности
export const maxDuration = 30;

/**
 * Маршрут, который напрямую вызывает Ideogram.
 *
 * Этот код аналогичен коду, представленному в интерфейсе, но с дополнительной логикой:
 * - Логика для расчета времени выполнения функции Vercel для каждого workflow.
 * - Ограничение частоты запросов с использованием @upstash/ratelimit.
 */
import { NextRequest, NextResponse } from 'next/server';
import { ratelimit, validateRequest } from 'utils/redis';
import { getFetchParameters } from 'utils/request';
import { CallPayload, ImageResponse, Prompt, RedisEntry } from 'utils/types';
import { PROMPTS, RATELIMIT_CODE } from 'utils/constants';

// Обработчик POST-запросов
export const POST = async (request: NextRequest) => {
  // Проверка ограничения частоты запросов
  const response = await validateRequest(request, ratelimit);
  if (response.status === RATELIMIT_CODE) return response;

  // Запись времени начала и получение запроса
  const t1 = performance.now();
  const params = (await request.json()) as CallPayload;
  const promptIndex = params.promptIndex;
  const prompt = PROMPTS[promptIndex];

  // Вызов Ideogram и запись времени выполнения
  const url = await makeRequest(prompt, request.url);
  const time = performance.now() - t1;

  // Возврат результатов в формате, аналогичном тому, как Workflow сохраняет их в Redis
  const result: RedisEntry = {
    time,
    url,
  };

  return new NextResponse(JSON.stringify(result), { status: 200 });
};

/**
 * Вызывает Ideogram для получения изображения и возвращает его URL.
 *
 * @param prompt - Запрос для генерации изображения.
 * @param requestUrl - URL запроса, передаваемый в getFetchParameters.
 * @returns URL изображения.
 */
const makeRequest = async (prompt: Prompt, requestUrl: string) => {
  // Получение параметров для fetch
  const parameters = getFetchParameters(prompt, requestUrl);

  // Выполнение fetch-запроса
  const response = await fetch(parameters.url, {
    method: parameters.method,
    body: JSON.stringify(parameters.body),
    headers: parameters.headers,
  });

  // Возврат URL изображения из ответа
  const data = (await response.json()) as ImageResponse;
  return data.data[0].url;
};
