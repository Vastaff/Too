// Директива 'use client' указывает, что этот компонент будет выполняться на клиенте
'use client';

// Импорт необходимых модулей из React
import React, { useEffect } from 'react';

// Импорт библиотеки Prism для подсветки синтаксиса кода
import Prism from 'prismjs';

// Определение функционального компонента CodeBlock
export default function CodeBlock({
  children, // Дочерние элементы, содержащие код для отображения
  ...props  // Остальные пропсы, которые могут быть переданы в HTML-элемент <pre>
}: React.ComponentProps<'pre'>) {
  // Создание ссылки на DOM-элемент с помощью useRef
  const ref = React.useRef<HTMLPreElement>(null);

  // Хук useEffect для выполнения побочных эффектов после монтирования компонента
  useEffect(() => {
    // Проверка, что ссылка на DOM-элемент существует
    if (!ref.current) return;

    // Подсветка синтаксиса кода с помощью Prism
    Prism.highlightElement(ref.current);
  }, []); // Пустой массив зависимостей означает, что эффект выполняется только один раз после монтирования

  // Рендеринг компонента
  return (
    <pre
      className="!m-0 border-t border-t-zinc-800 !bg-transparent !p-4 !text-sm"
      {...props}
    >
      <code ref={ref} className="lang-js !whitespace-break-spaces">
        {children}
      </code>
    </pre>
  );
}
