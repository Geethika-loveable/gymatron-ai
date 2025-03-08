
/**
 * Formats time in milliseconds to MM:SS.MS format
 */
export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * Formats time in seconds to MM:SS format for rest timers
 */
export const formatRestTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
