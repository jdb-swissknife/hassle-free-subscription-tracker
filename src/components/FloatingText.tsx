
import React, { useEffect, useRef, useState } from 'react';

interface FloatingTextProps {
  text: string;
  color: string;
  speed: number;
  size: 'sm' | 'md' | 'lg';
}

const FloatingText: React.FC<FloatingTextProps> = ({ text, color, speed, size }) => {
  const [position, setPosition] = useState({ x: Math.random() * 80, y: Math.random() * 80 });
  const [direction, setDirection] = useState({ x: Math.random() > 0.5 ? speed : -speed, y: Math.random() > 0.5 ? speed : -speed });
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  useEffect(() => {
    let animationFrameId: number;
    
    const animate = () => {
      if (!textRef.current || !containerRef.current) return;
      
      const textRect = textRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Calculate boundaries
      const maxX = 90; // Keep within 90% of container width
      const maxY = 90; // Keep within 90% of container height
      
      let newX = position.x + direction.x;
      let newY = position.y + direction.y;
      let newDirX = direction.x;
      let newDirY = direction.y;
      
      // Bounce off the sides
      if (newX <= 0 || newX >= maxX) {
        newDirX = -direction.x;
      }
      
      // Bounce off the top and bottom
      if (newY <= 0 || newY >= maxY) {
        newDirY = -direction.y;
      }
      
      setPosition({ x: newX, y: newY });
      setDirection({ x: newDirX, y: newDirY });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [position, direction]);
  
  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div 
        ref={textRef}
        className={`absolute ${sizeClasses[size]} font-medium glass-card px-3 py-1 rounded-full whitespace-nowrap shadow-sm`}
        style={{ 
          left: `${position.x}%`, 
          top: `${position.y}%`, 
          backgroundColor: `${color}20`,
          color: color,
          transform: 'translate(-50%, -50%)',
          transition: 'left 0.5s ease-out, top 0.5s ease-out',
          zIndex: 10
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default FloatingText;
