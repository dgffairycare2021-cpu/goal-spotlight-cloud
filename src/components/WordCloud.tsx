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

  // Calculate positions to avoid overlaps using spiral positioning
  useEffect(() => {
    if (goals.length === 0) return;
    
    const newPositions: Array<{x: number, y: number, width: number, height: number}> = [];
    const padding = 15; // Increased padding for better spacing
    
    goals.forEach((_, index) => {
      const fontSize = getWordSize(index, goals.length);
      const textLength = goals[index].goal_text.length;
      // More accurate width calculation for Thai text
      const estimatedWidth = Math.max(textLength * fontSize * 0.7, fontSize * 3);
      const estimatedHeight = fontSize * 1.4; // Increased height for better spacing
      
      let position;
      let attempts = 0;
      const maxAttempts = 100;
      
      // Try spiral positioning from center outward
      do {
        if (attempts < 20) {
          // First, try near center with spiral
          position = getSpiralPosition(attempts, estimatedWidth, estimatedHeight);
        } else {
          // Then try random positions with zone distribution
          position = getRandomPosition(index, estimatedWidth, estimatedHeight);
        }
        attempts++;
      } while (
        attempts < maxAttempts && 
        hasOverlap(position, newPositions, padding)
      );
      
      // If still overlapping after max attempts, place in a safe fallback position
      if (hasOverlap(position, newPositions, padding)) {
        position = getFallbackPosition(index, estimatedWidth, estimatedHeight, newPositions, padding);
      }
      
      newPositions.push({
        ...position,
        width: estimatedWidth,
        height: estimatedHeight
      });
    });
    
    setPositions(newPositions);
  }, [goals, dimensions]);

  const getSpiralPosition = (attempt: number, width: number, height: number) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const angle = attempt * 0.5; // Spiral angle increment
    const radius = attempt * 10; // Spiral radius increment
    
    const x = Math.max(20, Math.min(dimensions.width - width - 20, centerX + Math.cos(angle) * radius - width / 2));
    const y = Math.max(20, Math.min(dimensions.height - height - 20, centerY + Math.sin(angle) * radius - height / 2));
    
    return { x, y };
  };

  const getFallbackPosition = (
    index: number, 
    width: number, 
    height: number, 
    existingPositions: Array<{x: number, y: number, width: number, height: number}>,
    padding: number
  ) => {
    // Grid-based fallback positioning
    const cols = Math.floor(dimensions.width / (width + padding + 20));
    const rows = Math.floor(dimensions.height / (height + padding + 20));
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    const x = Math.max(20, col * (width + padding + 20) + 20);
    const y = Math.max(20, row * (height + padding + 20) + 20);
    
    // Ensure within bounds
    return {
      x: Math.min(x, dimensions.width - width - 20),
      y: Math.min(y, dimensions.height - height - 20)
    };
  };

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
    const maxX = Math.max(margin, zone.w - width - margin);
    const maxY = Math.max(margin, zone.h - height - margin);
    const x = zone.x + Math.random() * maxX;
    const y = zone.y + Math.random() * maxY;
    
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