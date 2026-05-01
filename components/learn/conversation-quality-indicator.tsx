'use client';

import { useState, useMemo } from 'react';
import type { ChatMessage } from '@/lib/llm/baseProvider';

interface ConversationQualityIndicatorProps {
  messages: ChatMessage[]; // 保留以便未来扩展
  word: string; // 保留以便未来扩展
  onGenerateCard: () => void;
  generating: boolean;
  aiProgress: number; // AI评估的进度
}

export function ConversationQualityIndicator({
  generating,
  aiProgress,
}: ConversationQualityIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // 使用AI评估的进度，而不是客户端计算
  const quality = useMemo(() => {
    const progress = aiProgress;
    
    // 根据进度确定等级
    let level: 'insufficient' | 'ready' | 'excellent';
    
    if (progress < 40) {
      level = 'insufficient';
    } else if (progress < 80) {
      level = 'ready';
    } else {
      level = 'excellent';
    }

    return {
      level,
      progress,
    };
  }, [aiProgress]);

  // 获取提示文本
  const getTooltipText = () => {
    const progress = quality.progress;

    if (progress < 20) {
      return 'AI 已经给出了初步介绍\n\n现在开始提问吧：\n• 这个词的用法\n• 有什么例句\n• 容易混淆的词';
    } else if (progress < 40) {
      return '继续深入探索吧～\n\n试着问问：\n• 词源和来历\n• 使用场景\n• 与相似词的区别';
    } else if (progress < 60) {
      return '很好！\n\n可以生成基础卡片了！\n想要更丰富的内容？试着问：\n• 词源和来历\n• 使用场景和语境\n• 与相似词的区别';
    } else if (progress < 80) {
      return '太棒了！\n\n可以生成卡片了，还想了解更多吗？\n\n继续探索：\n• 地道的使用场景\n• 常见搭配\n• 语气细微差别';
    } else if (progress < 100) {
      return '非常好！\n\n已经可以生成很不错的卡片了\n\n可以继续深入探讨，\n或者现在就生成卡片';
    } else {
      return '完美！✨\n\n对话非常充分，可以生成\n高质量的学习卡片了！';
    }
  };

  // 获取颜色
  const getColor = () => {
    switch (quality.level) {
      case 'insufficient':
        return {
          stroke: 'stroke-red-500',
          fill: 'fill-red-500/10',
          glow: '',
          text: 'text-red-500',
        };
      case 'ready':
        return {
          stroke: 'stroke-green-500',
          fill: 'fill-green-500/10',
          glow: '',
          text: 'text-green-500',
        };
      case 'excellent':
        return {
          stroke: 'stroke-green-500',
          fill: 'fill-green-500/20',
          glow: 'drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]',
          text: 'text-green-500',
        };
    }
  };

  const colors = getColor();

  return (
    <div className="fixed right-6 top-24 z-40">
      {/* 圆环指示器 */}
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={generating}
        className={`
          relative flex h-16 w-16 items-center justify-center rounded-full
          transition-all duration-300
          ${generating ? 'opacity-50' : 'cursor-pointer hover:scale-110'}
        `}
        style={quality.level === 'excellent' ? { animation: 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' } : undefined}
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          {/* 背景圆环 */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-border"
          />
          
          {/* 进度圆环 */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            strokeDashoffset={`${2 * Math.PI * 42 * (1 - quality.progress / 100)}`}
            className={`
              ${colors.stroke}
              ${colors.glow}
              transition-all duration-500 ease-out
            `}
          />
          
          {/* 中心填充 */}
          <circle
            cx="50"
            cy="50"
            r="36"
            className={`${colors.fill} transition-all duration-500`}
          />
        </svg>

        {/* 中心图标 */}
        <div className={`absolute inset-0 flex items-center justify-center ${colors.text}`}>
          {generating ? (
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current delay-75" />
              <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-current delay-150" />
            </div>
          ) : (
            <div className="text-center">
              <div className="text-lg font-semibold">{Math.round(quality.progress)}</div>
              <div className="text-[8px] font-medium uppercase tracking-wider">%</div>
            </div>
          )}
        </div>
      </button>

      {/* 提示框 */}
      {showTooltip && (
        <div
          className={`
            absolute right-20 top-0 z-50 w-64 rounded-md border bg-background p-4 shadow-lg
            animate-in fade-in slide-in-from-right-2 duration-200
            ${colors.text}
          `}
        >
          <div className="space-y-2">
            <div className="whitespace-pre-line text-xs leading-relaxed">
              {getTooltipText()}
            </div>
          </div>
          
          {/* 箭头 */}
          <div
            className={`
              absolute -right-2 top-6 h-4 w-4 rotate-45 border-r border-t bg-background
            `}
          />
        </div>
      )}
    </div>
  );
}
