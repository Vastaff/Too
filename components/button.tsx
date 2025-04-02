// Импорт библиотеки React для создания компонента
import React from 'react';

// Импорт утилиты cx, которая, вероятно, используется для объединения классов CSS
import cx from 'utils/cx';

// Определение компонента Button с использованием функционального компонента
const Button = ({
  variant = 'primary', // Параметр variant с значением по умолчанию 'primary'
  className,          // Параметр className для дополнительных классов CSS
  ...props            // Остальные пропсы, которые могут быть переданы в HTML-элемент <button>
}: React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' // Типизация параметра variant
}) => {
  return (
    <button
      type="button" // Установка типа кнопки как "button"
      className={cx(
        // Основные стили кнопки
        'inline-flex select-none items-center gap-2 bg-emerald-500 px-3 py-1 font-bold text-white shadow',
        // Стили для состояния hover
        'hover:bg-emerald-600',
        // Стили для состояния active
        'active:shadow-0 active:translate-y-1 active:opacity-50',
        // Условные стили, если variant равен 'secondary'
        variant === 'secondary' && 'bg-zinc-700 hover:bg-zinc-800',
        // Дополнительные классы, переданные через пропс className
        className,
      )}
      {...props} // Передача остальных пропсов в элемент <button>
    />
  );
};

// Экспорт компонента Button как компонента по умолчанию
export default Button;
