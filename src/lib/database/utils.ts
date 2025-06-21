
// Utility function to truncate prompt if too long
export const truncatePrompt = (prompt: string, maxLength: number = 1800): string => {
  if (prompt.length <= maxLength) return prompt;
  
  // Try to truncate at a sentence boundary
  const truncated = prompt.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('. ');
  const lastComma = truncated.lastIndexOf(', ');
  
  if (lastSentence > maxLength * 0.8) {
    return truncated.substring(0, lastSentence + 1);
  } else if (lastComma > maxLength * 0.8) {
    return truncated.substring(0, lastComma + 1);
  } else {
    return truncated + '...';
  }
};
