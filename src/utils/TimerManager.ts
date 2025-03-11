
/**
 * TimerManager - A singleton to manage timer state outside of React lifecycle
 * This prevents timer resets during re-renders
 */

type TimerCallback = () => void;

class TimerManagerClass {
  private timers: Map<string, {
    intervalId: NodeJS.Timeout | null;
    startTime: number;
    endTime: number;
    onTick: (timeLeft: number, progress: number) => void;
    onComplete: TimerCallback;
  }> = new Map();

  startTimer(
    id: string, 
    durationSeconds: number, 
    onTick: (timeLeft: number, progress: number) => void,
    onComplete: TimerCallback
  ): void {
    // Clean up existing timer if it exists
    this.stopTimer(id);
    
    const now = Date.now();
    const startTime = now;
    const endTime = now + (durationSeconds * 1000);
    
    console.log(`TimerManager: Starting timer ${id} with duration ${durationSeconds}s`);
    
    // Create new timer
    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.max(0, endTime - currentTime);
      const elapsedMs = currentTime - startTime;
      const remainingSeconds = Math.ceil(remaining / 1000);
      const progressValue = (remainingSeconds / durationSeconds) * 100;
      
      // Call the tick callback with current values
      onTick(remainingSeconds, progressValue);
      
      // Check if timer is complete
      if (remaining <= 0) {
        console.log(`TimerManager: Timer ${id} completed`);
        this.stopTimer(id);
        onComplete();
      }
    }, 100); // Update every 100ms for smooth UI
    
    // Store timer reference
    this.timers.set(id, {
      intervalId,
      startTime,
      endTime,
      onTick,
      onComplete
    });
  }
  
  stopTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer && timer.intervalId) {
      console.log(`TimerManager: Stopping timer ${id}`);
      clearInterval(timer.intervalId);
      this.timers.delete(id);
    }
  }
  
  isTimerRunning(id: string): boolean {
    return this.timers.has(id);
  }
  
  getRemainingTime(id: string): number {
    const timer = this.timers.get(id);
    if (!timer) return 0;
    
    const remaining = Math.max(0, timer.endTime - Date.now());
    return Math.ceil(remaining / 1000);
  }
}

// Create singleton instance
export const TimerManager = new TimerManagerClass();
