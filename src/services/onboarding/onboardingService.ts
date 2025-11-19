/**
 * Onboarding Service
 * 
 * Mock onboarding service for UI-only implementation.
 * Manages onboarding state using local storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingResponse, OnboardingState } from '@/src/types/onboarding/types';

const STORAGE_KEY_ONBOARDING = '@onboarding_responses';
const STORAGE_KEY_ONBOARDING_COMPLETE = '@onboarding_complete';

/**
 * Mock onboarding service
 */
export class OnboardingService {
  /**
   * Save onboarding response
   */
  static async saveResponse(
    userId: string,
    response: OnboardingResponse
  ): Promise<{ error: Error | null }> {
    try {
      const key = `${STORAGE_KEY_ONBOARDING}_${userId}`;
      const responsesJson = await AsyncStorage.getItem(key);
      const responses: Record<string, OnboardingResponse> = responsesJson 
        ? JSON.parse(responsesJson) 
        : {};
      
      responses[response.stepId] = {
        ...response,
        updated_at: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(responses));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Get onboarding state for user
   */
  static async getOnboardingState(
    userId: string
  ): Promise<{ state: OnboardingState | null; error: Error | null }> {
    try {
      const key = `${STORAGE_KEY_ONBOARDING}_${userId}`;
      const responsesJson = await AsyncStorage.getItem(key);
      
      if (!responsesJson) {
        return {
          state: {
            currentStep: 0,
            completedSteps: [],
            responses: {},
            isComplete: false,
          },
          error: null,
        };
      }

      const responses: Record<string, OnboardingResponse> = JSON.parse(responsesJson);
      const completedSteps: string[] = [];

      for (const [stepId, response] of Object.entries(responses)) {
        if (response.completed) {
          completedSteps.push(stepId);
        }
      }

      const state: OnboardingState = {
        currentStep: completedSteps.length,
        completedSteps,
        responses,
        isComplete: completedSteps.length >= 12, // 12 onboarding screens
      };

      return { state, error: null };
    } catch (error) {
      return { state: null, error: error as Error };
    }
  }

  /**
   * Mark onboarding as complete
   */
  static async completeOnboarding(userId: string): Promise<{ error: Error | null }> {
    try {
      const key = `${STORAGE_KEY_ONBOARDING_COMPLETE}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        completed: true,
        completed_at: new Date().toISOString(),
      }));
      
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  static async isOnboardingComplete(userId: string): Promise<{ complete: boolean; error: Error | null }> {
    try {
      const key = `${STORAGE_KEY_ONBOARDING_COMPLETE}_${userId}`;
      const completeJson = await AsyncStorage.getItem(key);
      
      if (!completeJson) {
        return { complete: false, error: null };
      }

      const data = JSON.parse(completeJson);
      return { complete: data?.completed || false, error: null };
    } catch (error) {
      return { complete: false, error: error as Error };
    }
  }
}
