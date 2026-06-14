import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import ScoreCard from '@/components/ScoreCard';

function calcSustainabilityScore(score) {
  if (!score) return 0;
  const earned = [
    score.solarEnergy,
    score.waterConservation,
    score.wasteManagement,
    score.greenCertified,
  ].filter(Boolean).length;
  return Math.round((earned / 4) * 100);
}

export default function SustainabilityBadge({ scores }) {
  const overall = calcSustainabilityScore(scores);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ScoreCard label="Eco Score" value={overall} size="sm" color="green" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64 p-3">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Sustainability Features</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={scores?.solarEnergy ? 'text-green-600' : 'text-muted-foreground'}>
                  {scores?.solarEnergy ? '✓' : '○'}
                </span>
                <span>Solar Energy</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={scores?.waterConservation ? 'text-green-600' : 'text-muted-foreground'}
                >
                  {scores?.waterConservation ? '✓' : '○'}
                </span>
                <span>Water Conservation</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={scores?.wasteManagement ? 'text-green-600' : 'text-muted-foreground'}
                >
                  {scores?.wasteManagement ? '✓' : '○'}
                </span>
                <span>Waste Management</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={scores?.greenCertified ? 'text-green-600' : 'text-muted-foreground'}
                >
                  {scores?.greenCertified ? '✓' : '○'}
                </span>
                <span>Green Certified</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
