
/**
 * Creates and plays a bell sound
 */
export const playBellSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 830;
    gainNode.gain.value = 0.5;
    
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  } catch (error) {
    console.error("Error playing bell sound:", error);
  }
};
