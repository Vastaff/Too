// Импорт необходимых модулей из React и Radix UI
import React from 'react';
import type { TooltipProps } from '@radix-ui/react-tooltip';
import * as RadixTooltip from '@radix-ui/react-tooltip';

// Определение функционального компонента Tooltip
const Tooltip = ({
  children, // Дочерние элементы, которые будут использоваться в качестве триггера
  title, // Содержимое всплывающей подсказки
}: TooltipProps & {
  title: React.ReactNode;
}) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          {/* Дочерние элементы оборачиваются в триггер */}
          <span>{children}</span>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            align="start" // Выравнивание подсказки по началу триггера
            side="bottom" // Позиционирование подсказки снизу от триггера
            sideOffset={0} // Отступ от триггера
            className="w-screen max-w-screen-sm select-none border-2 bg-white px-6 py-4 shadow" // Стилизация подсказки
          >
            {title} {/* Отображение содержимого подсказки */}
            <RadixTooltip.Arrow className="fill-white" /> {/* Стрелка подсказки */}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
