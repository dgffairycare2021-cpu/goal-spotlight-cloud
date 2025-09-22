import { useState, useEffect } from "react";

interface Goal {
  id: string;
  member_name: string;
  goal_text: string;
  created_at: string;
}

interface WordCloudProps {
  goals: Goal[];
  onGoalClick: (goal: Goal) => void;
}

const WordCloud = ({ goals, onGoalClick }: WordCloudProps) => {
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth * 0.6 : 800, 
    height: 400 
  });

  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.word-cloud-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setDimensions({
          width: rect.width || 800,
          height: rect.height || 400,
        });
      }
    };

    // Set initial dimensions
    setTimeout(updateDimensions, 100);
    
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const getPosition = (index: number) => {
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    
    // Create a more natural word cloud layout
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;
    
    // Spiral pattern for better distribution
    const angle = index * 0.8; // Spiral angle
    const radius = Math.min(30 + index * 8, Math.min(containerWidth, containerHeight) * 0.35);
    
    const x = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20;
    const y = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20;
    
    // Ensure words stay within bounds with padding
    const padding = 80;
    return {
      x: Math.max(padding, Math.min(x, containerWidth - padding)),
      y: Math.max(padding, Math.min(y, containerHeight - padding)),
    };
  };

  const getWordSize = (index: number, total: number) => {
    const baseSize = 14;
    const maxSize = 32;
    const factor = Math.max(0.3, 1 - (index / total));
    return baseSize + (maxSize - baseSize) * factor + Math.random() * 6;
  };

  const getWordColor = (index: number) => {
    const colors = ['word-color-1', 'word-color-2', 'word-color-3', 'word-color-4', 'word-color-5'];
    return colors[index % colors.length];
  };

  return (
    <div className="word-cloud-container relative w-full h-full overflow-hidden min-h-[400px]">
      {goals.map((goal, index) => {
        const position = getPosition(index);
        const fontSize = getWordSize(index, goals.length);
        const colorClass = getWordColor(index);

        return (
          <div
            key={goal.id}
            className={`absolute cursor-pointer select-none font-bold ${colorClass} hover:scale-110 transition-all duration-300 hover:drop-shadow-lg animate-fade-in`}
            style={{
              left: position.x,
              top: position.y,
              fontSize: `${fontSize}px`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${index * 0.1}s`,
            }}
            onClick={() => onGoalClick(goal)}
          >
            {goal.goal_text}
          </div>
        );
      })}
    </div>
  );
};

export default WordCloud;