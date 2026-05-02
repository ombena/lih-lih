export const formatSocialProofNumber = (num: number): string => {
  if (!num) return "0";
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M+'; // e.g., 1.2M+
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k+'; // e.g., 1.5k+
  }
  if (num >= 100) {
    // For AliExpress style "500+ sold", round down to nearest 100
    return Math.floor(num / 100) * 100 + '+'; 
  }
  if (num >= 50) {
    return '50+';
  }
  // If it's a very new store with 15 orders, just show the exact number
  return num.toString(); 
};
