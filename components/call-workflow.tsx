// Импорт необходимых хуков из React
import { useEffect, useState } from 'react';

// Импорт констант, утилит и типов из других модулей
import { RATELIMIT_CODE } from 'utils/constants';
import { costCalc, generateCallKey } from 'utils/helper';
import { CallInfo, CallPayload, RedisEntry } from 'utils/types';
import ResultInfo from './result';
import CodeBlock from './codeblock';

// Асинхронная функция для проверки результата в Redis
async function checkRedisForResult(callKey: string) {
  const response = await fetch('/api/check-workflow', {
    method: 'POST',
    body: JSON.stringify({ callKey }),
  });

  const result: RedisEntry = await response.json();
  return result;
}

// Определение функционального компонента CallWorkflow
export default function CallWorkflow({
  promptIndex, // Индекс запроса
  start = false, // Флаг для запуска процесса
  showCode = false, // Флаг для отображения кода
}: {
  promptIndex: number;
  start?: boolean;
  showCode?: boolean;
}) {
  // Состояние для хранения данных, ошибок и состояния загрузки
  const [data, setData] = useState<CallInfo | null>(null);
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Генерация уникального ключа вызова
  const callKey = generateCallKey();

  // Функция для начала процесса
  const onStart = async () => {
    try {
      setLoading(true); // Установка состояния загрузки
      setError(null); // Сброс ошибок
      setData(null); // Сброс данных

      // Формирование payload для запроса
      const payload: CallPayload = { promptIndex };

      // Отправка POST-запроса на сервер
      const response = await fetch('/api/workflow', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          callKey, // Передача уникального ключа вызова
        },
      });

      // Обработка ошибки превышения лимита запросов
      if (response.status === RATELIMIT_CODE) {
        throw new Error(
          'Your request was rejected because you surpassed the ratelimit. Please try again later.'
        );
      }

      // Запуск опроса данных
      pollData();
    } catch (e) {
      // Обработка ошибок
      if (typeof e === 'string') {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    }
  };

  // Функция для опроса данных
  const pollData = async () => {
    const startTime = performance.now(); // Запоминание времени начала
    let checkCount = 0; // Счетчик попыток

    while (true) {
      const result = await checkRedisForResult(callKey);

      if (result) {
        // Обновление состояния данных
        setData({
          duration: performance.now() - startTime,
          functionTime: Number(result.time),
          result: result.url,
        });
        setLoading(false); // Сброс состояния загрузки
        break;
      }

      checkCount++;
      if (checkCount > 45) {
        // Обработка тайм-аута
        setError('Workflow request got timeout. Please try again later.');
        setLoading(false);
        break;
      }

      // Ожидание перед следующей проверкой
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  // Хук useEffect для запуска процесса при изменении значения start
  useEffect(() => {
    if (!start) return;
    onStart();
  }, [start]);

  // Рендеринг компонента
  return (
    <>
      <legend>Serverless Function with Upstash Workflow</legend>

      {error && <div>{error}</div>} {/* Отображение ошибок */}

      <ResultInfo
        cost={costCalc(data?.functionTime, true)} // Расчет стоимости
        data={data} // Передача данных
        loading={loading} // Передача состояния загрузки
      />

      <details className="mt-4 bg-zinc-800 text-white" open={showCode}>
        <summary className="select-none block px-2 py-1 text-sm">Workflow Function</summary>
        <CodeBlock>
          {`import { serve } from '@upstash/workflow/nextjs'
import { Redis } from '@upstash/redis'
import { ImageResponse } from 'utils/types'

const redis = Redis.fromEnv()

export const { POST } = serve<{ prompt: string }>(async (context) => {
  // Получение параметров из запроса
  const { prompt } = context.requestPayload

  // Вызов внешнего API через QStash
  const { body: result } = await context.call(
    'call image generation API',
    {
      url: 'https://api.ideogram.ai/generate',
      method: 'POST',
      body: {
        image_request: {
          model: 'V_2',
          prompt,
          aspect_ratio: 'ASPECT_1_1',
          magic_prompt_option: 'AUTO',
        },
      },
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.IDEOGRAM_API_KEY!,
      },
    }
  ) as { body: ImageResponse };

  // Сохранение URL изображения в Redis
  await context.run('save results in redis', async () => {
    await redis.set<string>(
      context.headers.get('callKey')!,
      result.data[0].url,
      { ex: 120 }, // Истечение через 120 секунд
    )
  })
})`}
        </CodeBlock>
      </details>
    </>
  );
}
