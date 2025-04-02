// Директива 'use client' указывает, что этот компонент будет выполняться на клиенте
'use client';

// Импорт необходимых хуков из React
import { useEffect, useState } from 'react';

// Импорт типов и утилит из других модулей
import { CallInfo, RedisEntry, CallPayload } from 'utils/types';
import ResultInfo from './result';
import { RATELIMIT_CODE } from 'utils/constants';
import { costCalc } from 'utils/helper';
import CodeBlock from './codeblock';

// Определение функционального компонента CallRegular
export default function CallRegular({
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

  // Функция для начала процесса
  const onStart = async () => {
    try {
      setLoading(true); // Установка состояния загрузки
      setError(null); // Сброс ошибок
      setData(null); // Сброс данных

      // Формирование payload для запроса
      const payload: CallPayload = { promptIndex };

      // Отправка POST-запроса на сервер
      const response = await fetch('/api/regular', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Обработка ошибки превышения лимита запросов
      if (response.status === RATELIMIT_CODE) {
        throw new Error(
          'Your request was rejected because you surpassed the ratelimit. Please try again later.'
        );
      }

      // Обработка успешного ответа
      const data: RedisEntry = await response.json();

      // Обновление состояния данных
      setData({
        duration: data.time,
        functionTime: data.time,
        result: data.url,
      });
    } catch (e) {
      // Обработка ошибок
      if (typeof e === 'string') {
        setError(e);
      } else if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false); // Сброс состояния загрузки
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
      <legend>Traditional Serverless Function</legend>

      {error && <div>{error}</div>} {/* Отображение ошибок */}

      <ResultInfo
        cost={costCalc(data?.functionTime, false)} // Расчет стоимости
        data={data} // Передача данных
        loading={loading} // Передача состояния загрузки
      />

      <details className="mt-4 bg-zinc-800 text-white" open={showCode}>
        <summary className="select-none block px-2 py-1 text-sm">Vercel Function</summary>

        <CodeBlock>
          {`import { NextRequest, NextResponse } from 'next/server'
import { ImageResponse } from 'utils/types'

export const POST = async (request: NextRequest) => {
  // Получение параметров из запроса
  const params = await request.json()
  const prompt = params.prompt as string

  // Отправка запроса на внешний API
  const response = await fetch(
    "https://api.ideogram.ai/generate",
    {
      method: "POST",
      body: JSON.stringify({
        image_request: {
          model: 'V_2',
          prompt,
          aspect_ratio: 'ASPECT_1_1',
          magic_prompt_option: 'AUTO',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': process.env.IDEOGRAM_API_KEY!
      },
    }
  )

  // Получение URL изображения из ответа
  const payload = await response.json() as ImageResponse
  const url = payload.data[0].url

  return new NextResponse(
    JSON.stringify({ url }),
    { status: 200 }
  )`}
        </CodeBlock>
      </details>
    </>
  );
}
