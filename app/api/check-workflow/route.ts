// Импорт необходимых модулей и типов
import { NextRequest, NextResponse } from 'next/server';
import { RedisEntry } from 'utils/types';
import { RATELIMIT_CODE } from 'utils/constants';
import { checkRatelimit, redis, validateRequest } from 'utils/redis';

// Определение обработчика POST-запросов
export const POST = async (request: NextRequest) => {
  // Валидация запроса и проверка лимита запросов
  const response = await validateRequest(request, checkRatelimit);
  if (response.status === RATELIMIT_CODE) return response;

  // Извлечение ключа вызова из тела запроса
  const { callKey } = (await request.json()) as { callKey: string };

  // Получение данных из Redis по ключу
  const result = (await redis.get(callKey)) as RedisEntry | undefined;

  // Если данные найдены, удаляем их из Redis
  if (result) {
    await redis.del(callKey);
  }

  // Возвращение ответа с данными в формате JSON
  return new NextResponse(JSON.stringify(result), { status: 200 });
};
