import { useEffect, useRef } from 'react';

const MatrixBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    const createMatrixChar = () => {
      const char = document.createElement('div');
      char.className = 'matrix-char';
      char.textContent = characters[Math.floor(Math.random() * characters.length)];
      char.style.left = Math.random() * 100 + '%';
      char.style.animationDuration = (Math.random() * 3 + 2) + 's';
      char.style.opacity = (Math.random() * 0.8 + 0.2).toString();
      char.style.fontSize = Math.random() * 10 + 12 + 'px';
      
      container.appendChild(char);

      // Remove character after animation
      setTimeout(() => {
        if (container.contains(char)) {
          container.removeChild(char);
        }
      }, 5000);
    };

    // Create initial characters more frequently
    const interval = setInterval(createMatrixChar, 80);

    // Start immediately
    createMatrixChar();

    return () => {
      clearInterval(interval);
      // Clean up remaining characters
      if (container) {
        const chars = container.querySelectorAll('.matrix-char');
        chars.forEach(char => char.remove());
      }
    };
  }, []);

  return <div ref={containerRef} className="matrix-bg" />;
};

export default MatrixBackground;