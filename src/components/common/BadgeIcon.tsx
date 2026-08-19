import React from 'react';
import { Award, Crown, Flame, Heart, Medal, Rocket, Sparkles, Star, Trophy, Wand2 } from 'lucide-react';
import { RewardBadge } from '../../types';

interface BadgeIconProps {
  badge: RewardBadge;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  isUnlocked?: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  badge,
  size = 'md',
  showLabel = true,
  isUnlocked = true,
}) => {
  const getIcon = (name: string) => {
    const iconProps = { className: 'w-full h-full' };
    switch (name.toLowerCase()) {
      case 'star':
        return <Star {...iconProps} />;
      case 'trophy':
        return <Trophy {...iconProps} />;
      case 'crown':
        return <Crown {...iconProps} />;
      case 'wizard':
        return <Wand2 {...iconProps} />;
      case 'rocket':
        return <Rocket {...iconProps} />;
      case 'heart':
        return <Heart {...iconProps} />;
      case 'medal':
        return <Medal {...iconProps} />;
      case 'sparkles':
        return <Sparkles {...iconProps} />;
      case 'flame':
        return <Flame {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  const sizeClasses = {
    sm: 'w-10 h-10 p-2 text-xs',
    md: 'w-16 h-16 p-3 text-sm',
    lg: 'w-24 h-24 p-5 text-base',
    xl: 'w-32 h-32 p-7 text-lg',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center text-center gap-1.5 select-none">
      <div
        className={`relative rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 ${
          sizeClasses[size]
        } ${
          isUnlocked
            ? `bg-gradient-to-br ${badge.bgGradient || 'from-amber-400 to-yellow-500'} text-white shadow-amber-500/25 ring-4 ring-white/60 hover:scale-105`
            : 'bg-zinc-200 text-zinc-400 grayscale opacity-50 ring-2 ring-zinc-300'
        }`}
      >
        <div className={iconSizes[size]}>{getIcon(badge.iconName)}</div>
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 bg-yellow-300 text-yellow-900 rounded-full p-1 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-yellow-400" />
          </div>
        )}
      </div>
      {showLabel && (
        <div className="max-w-[130px]">
          <p className="font-bold text-zinc-800 text-sm leading-tight line-clamp-1">{badge.name}</p>
          <p className="text-[11px] text-zinc-500 line-clamp-1">{badge.description}</p>
        </div>
      )}
    </div>
  );
};
