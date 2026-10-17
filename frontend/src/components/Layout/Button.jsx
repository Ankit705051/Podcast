import React from 'react';

export function Button({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
}) {

  /* ─── Variants ─── */
  const variants = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    primary: 'bg-purple-600 text-white hover:bg-purple-700',
    secondary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700',
    muted: 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700',
  };

  /* ─── Sizes ─── */
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
}