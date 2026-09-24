export interface TourStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  badge: string;
  targetSelector: string;
  position: "bottom" | "top" | "left" | "right" | "center";
  description: string;
  bullets?: string[];
  actionLabel?: string;
  onBeforeStep?: () => void;
}

export const TOUR_STEPS_COUNT = 7;
