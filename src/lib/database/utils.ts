
export const truncatePrompt = (prompt: string, maxLength: number = 1000): string => {
  if (prompt.length <= maxLength) return prompt;
  return prompt.substring(0, maxLength - 3) + '...';
};

export const generateId = (): string => {
  return crypto.randomUUID();
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
