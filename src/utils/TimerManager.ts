
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
    isActive: boolean;
  }> = new Map();

  private pendingTimers: Map<string, NodeJS.Timeout> = new Map();

  startTimer(
    id: string, 
    durationSeconds: number, 
    onTick: (timeLeft: number, progress: number) => void,
    onComplete: TimerCallback
  ): void {
    console.log(`TimerManager: Requesting to start timer ${id} with duration ${durationSeconds}s`);
    
    // Prevent rapid start/stop cycles by adding a small delay for new timer starts
    if (this.pendingTimers.has(id)) {
      clearTimeout(this.pendingTimers.get(id)!);
      this.pendingTimers.delete(id);
    }
    
    // Clean up existing timer if it exists
    this.stopTimer(id);
    
    // Add a small delay before actually starting the timer to allow for React state to settle
    const timeoutId = setTimeout(() => {
      const now = Date.now();
      const startTime = now;
      const endTime = now + (durationSeconds * 1000);
      
      console.log(`TimerManager: Actually starting timer ${id} with duration ${durationSeconds}s`);
      
      // Create new timer
      const intervalId = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const durationMs = durationSeconds * 1000;
        const remaining = Math.max(0, endTime - currentTime);
        const remainingSeconds = Math.ceil(remaining / 1000);
        
        // Calculate progress as percentage remaining (100% to 0%)
        const progressValue = Math.max(0, Math.min(100, (remaining / durationMs) * 100));
        
        // Call the tick callback with current values
        onTick(remainingSeconds, progressValue);
        
        // Check if timer is complete
        if (remaining <= 0) {
          console.log(`TimerManager: Timer ${id} completed after ${elapsed}ms`);
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
        onComplete,
        isActive: true
      });
      
      this.pendingTimers.delete(id);
    }, 50); // Small delay to allow React state to settle
    
    this.pendingTimers.set(id, timeoutId);
  }
  
  stopTimer(id: string): void {
    // First check if there's a pending timer start
    if (this.pendingTimers.has(id)) {
      clearTimeout(this.pendingTimers.get(id)!);
      this.pendingTimers.delete(id);
      console.log(`TimerManager: Canceled pending timer ${id}`);
    }
    
    // Then check for an active timer
    const timer = this.timers.get(id);
    if (timer && timer.intervalId) {
      console.log(`TimerManager: Stopping timer ${id}`);
      clearInterval(timer.intervalId);
      timer.isActive = false;
      this.timers.delete(id);
    }
  }
  
  isTimerRunning(id: string): boolean {
    return this.timers.has(id) && this.timers.get(id)!.isActive;
  }
  
  getRemainingTime(id: string): number {
    const timer = this.timers.get(id);
    if (!timer) return 0;
    
    const remaining = Math.max(0, timer.endTime - Date.now());
    return Math.ceil(remaining / 1000);
  }
  
  dumpTimerState(): void {
    console.log(`Active timers: ${this.timers.size}, Pending timers: ${this.pendingTimers.size}`);
    this.timers.forEach((timer, id) => {
      console.log(`- Timer ${id}: isActive=${timer.isActive}, remaining=${this.getRemainingTime(id)}s`);
    });
  }
}

// Create singleton instance
export const TimerManager = new TimerManagerClass();
