import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import ScoreCard from '@/components/ScoreCard';

function calcWorkcationScore(score) {
  if (!score) return 0;
  let total = 0;
  let max = 0;
  total += Math.min((score.internetSpeed || 0) / 100, 1) * 30;
  max += 30;
  total += score.workspaceAvailable ? 20 : 0;
  max += 20;
  const noiseMap = { Low: 20, Moderate: 10, High: 0 };
  total += noiseMap[score.noiseLevel] || 10;
  max += 20;
  total += Math.min((score.nearbyCafes || 0) / 10, 1) * 15;
  max += 15;
  total += score.powerBackup ? 15 : 0;
  max += 15;
  return Math.round((total / max) * 100);
}

export default function WorkcationBadge({ scores }) {
  const overall = calcWorkcationScore(scores);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            <ScoreCard label="Workcation Score" value={overall} size="sm" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64 p-3">
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Workcation Score Details</p>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Internet Speed</span>
                <span className="font-medium">{scores?.internetSpeed || 0} Mbps</span>
              </div>
              <div className="flex justify-between">
                <span>Workspace</span>
                <span className="font-medium">{scores?.workspaceAvailable ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Noise Level</span>
                <span className="font-medium">{scores?.noiseLevel || 'Moderate'}</span>
              </div>
              <div className="flex justify-between">
                <span>Nearby Cafes</span>
                <span className="font-medium">{scores?.nearbyCafes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Power Backup</span>
                <span className="font-medium">{scores?.powerBackup ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
