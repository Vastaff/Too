// Директива 'use client' указывает, что этот компонент будет выполняться на клиенте
'use client';

// Определение функционального компонента Header
export default function Header({}: {}) {
  return (
    <header className="space-y-6">
      {/* Логотип Upstash */}
      <img
        className="inline-flex w-10"
        src="/upstash-logo.svg"
        alt="upstash logo"
      />

      {/* Заголовок страницы */}
      <h1 className="text-xl font-bold">Optimizing Vercel Functions With Upstash Workflow</h1>

      {/* Описание демо */}
      <h2>
        This demo shows the cost-saving benefits of using Upstash Workflow for Vercel functions.
        <span className="font-bold">It compares two methods of calling an image generation API:</span>
      </h2>

      {/* Список методов */}
      <ul>
        <li>- Method 1: Calling the API in a standard Vercel function</li>
        <li>- Method 2: Calling the API using Upstash Workflow</li>
      </ul>

      {/* Дополнительная информация */}
      <p>
        Both methods start at the same time and take about the same time to finish. The key difference is the estimated cost per 1M requests (hover for details).
      </p>
    </header>
  );
}
