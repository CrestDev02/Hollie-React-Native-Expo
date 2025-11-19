export interface OnboardingStep {
  id: string;
  title: string;
  description?: string;
  component: string;
  required: boolean;
}

export interface OnboardingResponse {
  stepId: string;
  data: Record<string, unknown>;
  completed: boolean;
}

export interface OnboardingState {
  currentStep: number;
  completedSteps: string[];
  responses: Record<string, OnboardingResponse>;
  isComplete: boolean;
}

