import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const columns = Math.floor(window.innerWidth / 20);
    
    const createMatrixChar = () => {
      const char = document.createElement('div');
      char.className = 'matrix-char';
      char.textContent = characters[Math.floor(Math.random() * characters.length)];
      char.style.left = Math.random() * window.innerWidth + 'px';
      char.style.animationDuration = (Math.random() * 3 + 2) + 's';
      char.style.opacity = Math.random().toString();
      
      container.appendChild(char);

      // Remove character after animation
      setTimeout(() => {
        if (container.contains(char)) {
          container.removeChild(char);
        }
      }, 5000);
    };

    // Create initial characters
    for (let i = 0; i < columns; i++) {
      setTimeout(() => createMatrixChar(), Math.random() * 2000);
    }

    // Continue creating characters
    const interval = setInterval(createMatrixChar, 100);

    return () => {
      clearInterval(interval);
      // Clean up remaining characters
      const chars = container.querySelectorAll('.matrix-char');
      chars.forEach(char => char.remove());
    };
  }, []);

  return <div ref={containerRef} className="matrix-bg" />;
};

export default MatrixBackground;