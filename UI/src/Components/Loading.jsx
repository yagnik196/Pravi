import React from 'react';

/**
 * Premium Loading Component with blurred glassmorphism backdrop
 * and smooth multi-layer circular animations.
 */
const Loading = ({
  message = 'Loading...',
  description = 'Please wait a moment',
  fullScreen = true,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: {
      outer: 'w-10 h-10 border-2',
      inner: 'w-6 h-6 border-[1.5px]',
      dot: 'w-1.5 h-1.5',
      glow: '-inset-1 blur-sm',
      textSize: 'text-xs',
      descSize: 'text-[10px]',
      gap: 'mt-3',
    },
    md: {
      outer: 'w-16 h-16 border-4',
      inner: 'w-10 h-10 border-2',
      dot: 'w-2 h-2',
      glow: '-inset-2 blur-md',
      textSize: 'text-sm',
      descSize: 'text-xs',
      gap: 'mt-5',
    },
    lg: {
      outer: 'w-24 h-24 border-[5px]',
      inner: 'w-14 h-14 border-3',
      dot: 'w-3 h-3',
      glow: '-inset-3 blur-lg',
      textSize: 'text-base',
      descSize: 'text-sm',
      gap: 'mt-6',
    },
  };

  const selectedSize = sizeMap[size] || sizeMap.md;
  const containerPosition = fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-20';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${containerPosition} flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md transition-all duration-300 px-4 ${className}`}
    >
      {/* Animated Circular Container */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Gradient Glow */}
        <div
          className={`absolute ${selectedSize.glow} rounded-full bg-gradient-to-tr from-cyan-500/30 via-blue-600/30 to-indigo-500/30 animate-pulse`}
        />

        {/* Outer Background Track */}
        <div
          className={`${selectedSize.outer} rounded-full border-slate-700/40`}
        />

        {/* Outer Rotating Gradient Ring */}
        <div
          className={`absolute ${selectedSize.outer} rounded-full border-transparent border-t-cyan-400 border-r-blue-500 animate-spin`}
          style={{ animationDuration: '1s' }}
        />

        {/* Inner Counter-Rotating Ring */}
        <div
          className={`absolute ${selectedSize.inner} rounded-full border-transparent border-b-indigo-400 border-l-violet-400 animate-spin`}
          style={{ animationDuration: '1.6s', animationDirection: 'reverse' }}
        />

        {/* Center Pulsing Light Orb */}
        <div className={`absolute ${selectedSize.dot} rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-ping opacity-75`} />
        <div className={`absolute ${selectedSize.dot} rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]`} />
      </div>

      {/* Loading Labels */}
      {(message || description) && (
        <div className={`${selectedSize.gap} flex flex-col items-center text-center space-y-1`}>
          {message && (
            <p className={`${selectedSize.textSize} font-semibold tracking-wider text-slate-100 uppercase`}>
              {message}
            </p>
          )}
          {description && (
            <p className={`${selectedSize.descSize} text-slate-400 font-normal`}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Screen reader only helper */}
      <span className="sr-only">{message || 'Loading...'}</span>
    </div>
  );
};

export default Loading;