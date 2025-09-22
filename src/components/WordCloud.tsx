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
  const [positions, setPositions] = useState<Array<{x: number, y: number, width: number, height: number}>>([]);

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

  // Calculate positions to avoid overlaps
  useEffect(() => {
    if (goals.length === 0) return;
    
    const newPositions: Array<{x: number, y: number, width: number, height: number}> = [];
    const padding = 10;
    
    goals.forEach((_, index) => {
      const fontSize = getWordSize(index, goals.length);
      const textLength = goals[index].goal_text.length;
      const estimatedWidth = textLength * fontSize * 0.6;
      const estimatedHeight = fontSize * 1.2;
      
      let attempts = 0;
      let position;
      
      do {
        position = getRandomPosition(index, estimatedWidth, estimatedHeight);
        attempts++;
      } while (
        attempts < 50 && 
        hasOverlap(position, newPositions, padding)
      );
      
      newPositions.push({
        ...position,
        width: estimatedWidth,
        height: estimatedHeight
      });
    });
    
    setPositions(newPositions);
  }, [goals, dimensions]);

  const getRandomPosition = (index: number, width: number, height: number) => {
    const containerWidth = dimensions.width;
    const containerHeight = dimensions.height;
    const margin = 50;
    
    // Create zones to distribute words more evenly
    const zones = [
      { x: margin, y: margin, w: containerWidth/3, h: containerHeight/3 },
      { x: containerWidth/3, y: margin, w: containerWidth/3, h: containerHeight/3 },
      { x: 2*containerWidth/3, y: margin, w: containerWidth/3, h: containerHeight/3 },
      { x: margin, y: containerHeight/3, w: containerWidth/3, h: containerHeight/3 },
      { x: containerWidth/3, y: containerHeight/3, w: containerWidth/3, h: containerHeight/3 },
      { x: 2*containerWidth/3, y: containerHeight/3, w: containerWidth/3, h: containerHeight/3 },
      { x: margin, y: 2*containerHeight/3, w: containerWidth/3, h: containerHeight/3 },
      { x: containerWidth/3, y: 2*containerHeight/3, w: containerWidth/3, h: containerHeight/3 },
      { x: 2*containerWidth/3, y: 2*containerHeight/3, w: containerWidth/3, h: containerHeight/3 }
    ];
    
    const zone = zones[index % zones.length];
    const x = zone.x + Math.random() * (zone.w - width - margin);
    const y = zone.y + Math.random() * (zone.h - height - margin);
    
    return { x, y };
  };

  const hasOverlap = (
    newPos: {x: number, y: number, width: number, height: number}, 
    existingPositions: Array<{x: number, y: number, width: number, height: number}>, 
    padding: number
  ) => {
    return existingPositions.some(existing => {
      return !(
        newPos.x > existing.x + existing.width + padding ||
        newPos.x + newPos.width + padding < existing.x ||
        newPos.y > existing.y + existing.height + padding ||
        newPos.y + newPos.height + padding < existing.y
      );
    });
  };

  const getWordSize = (index: number, total: number) => {
    const baseSize = 16;
    const maxSize = 36;
    // More random variation for visual appeal
    const randomFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
    const sizeFactor = Math.max(0.4, 1 - (index / total));
    return Math.floor((baseSize + (maxSize - baseSize) * sizeFactor * randomFactor));
  };

  const getWordColor = (index: number) => {
    const colors = ['word-color-1', 'word-color-2', 'word-color-3', 'word-color-4', 'word-color-5'];
    return colors[index % colors.length];
  };

  return (
    <div className="word-cloud-container relative w-full h-full overflow-hidden min-h-[400px] bg-white rounded-lg shadow-lg">
      {goals.map((goal, index) => {
        if (!positions[index]) return null;
        
        const position = positions[index];
        const fontSize = getWordSize(index, goals.length);
        const colorClass = getWordColor(index);

        return (
          <div
            key={goal.id}
            className={`absolute cursor-pointer select-none font-kanit font-medium ${colorClass} hover:scale-110 transition-all duration-300 hover:drop-shadow-lg animate-fade-in`}
            style={{
              left: position.x,
              top: position.y,
              fontSize: `${fontSize}px`,
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