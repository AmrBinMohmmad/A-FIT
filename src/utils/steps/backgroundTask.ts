/**
 * Periodic background sync (expo-background-task: BGTaskScheduler on iOS, WorkManager on
 * Android). The OS decides the exact moment; we ask for at least every 30 minutes. The task
 * is defined at module scope — this file must be imported once from app/_layout.tsx.
 */
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { logger } from "@/utils/logger";
import { syncSteps } from "@/utils/steps/stepSync";

export const STEP_SYNC_TASK = "a-fit-step-sync";

if (!TaskManager.isTaskDefined(STEP_SYNC_TASK)) {
  TaskManager.defineTask(STEP_SYNC_TASK, async () => {
    try {
      const outcome = await syncSteps("background");
      return outcome.status === "failed"
        ? BackgroundTask.BackgroundTaskResult.Failed
        : BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
      logger.warn("Background step sync threw", error);
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
}

export async function registerStepSyncTask(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status !== BackgroundTask.BackgroundTaskStatus.Available) return;
    if (await TaskManager.isTaskRegisteredAsync(STEP_SYNC_TASK)) return;
    await BackgroundTask.registerTaskAsync(STEP_SYNC_TASK, { minimumInterval: 30 });
  } catch (error) {
    logger.warn("Could not register the background step sync task", error);
  }
}

export async function unregisterStepSyncTask(): Promise<void> {
  try {
    if (await TaskManager.isTaskRegisteredAsync(STEP_SYNC_TASK))
      await BackgroundTask.unregisterTaskAsync(STEP_SYNC_TASK);
  } catch (error) {
    logger.warn("Could not unregister the background step sync task", error);
  }
}
