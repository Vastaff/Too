import { NextRequest } from "next/server"
import { IMAGES, MOCK_WAIT_MS } from "utils/constants"
import { ImageResponse, Prompt } from "utils/types"

export const dynamic = 'force-dynamic' // Отключаем кэширование

export const POST = async (request: NextRequest) => {
  try {
    // 1. Парсим и валидируем входные данные
    const { prompt } = await request.json() as { prompt?: Prompt }
    if (!prompt || !IMAGES[prompt]) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing prompt" }),
        { status: 400 }
      )
    }

    // 2. Имитируем обработку (50% chance ошибки)
    await new Promise(r => setTimeout(r, MOCK_WAIT_MS))
    if (Math.random() > 0.5) {
      throw new Error("Mock API error")
    }

    // 3. Возвращаем успешный ответ
    const response: ImageResponse = {
      created: new Date().toISOString(),
      data: [{
        prompt,
        url: IMAGES[prompt],
        width: 512,
        height: 512
      }]
    }
    return new Response(JSON.stringify(response))

  } catch (error) {
    // 4. Обрабатываем ошибки
    return new Response(
      JSON.stringify({ error: "Mock API failed" }),
      { status: 500 }
    )
  }
}
