import confetti from 'canvas-confetti';

const useConfetti = () => {
  return () => {
    // First burst - center
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#6B46C1', '#9F7AEA'],
      startVelocity: 30,
      gravity: 1.2,
      ticks: 300
    });

    // Left side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#6B46C1', '#9F7AEA'],
        startVelocity: 30,
        gravity: 1.2,
        ticks: 300
      });
    }, 150);

    // Right side burst
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#6B46C1', '#9F7AEA'],
        startVelocity: 30,
        gravity: 1.2,
        ticks: 300
      });
    }, 150);
  };
};

export default useConfetti; 