import ArabicReshaper from 'arabic-reshaper';

/**
 * Process Arabic text for proper rendering in jsPDF
 * 
 * This function:
 * 1. Reshapes Arabic letters (connects them properly)
 * 2. Reverses the text for RTL display
 * 
 * @param text - Arabic text to process
 * @returns Processed text ready for jsPDF
 */
export const processArabicText = (text: string): string => {
    try {
        // Step 1: Reshape Arabic characters (connect letters properly)
        const reshaped = ArabicReshaper(text);
        
        // Step 2: Reverse the string for RTL display
        const reversed = reshaped.split('').reverse().join('');
        
        return reversed;
    } catch (error) {
        console.error('Error processing Arabic text:', error);
        return text; // Fallback to original text
    }
};

/**
 * Helper function to process mixed Arabic-English text
 * Detects Arabic words and processes them while keeping English intact
 * 
 * @param text - Mixed language text
 * @returns Processed text
 */
export const processMixedText = (text: string): string => {
    // Simple check: if text contains Arabic characters, process it
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    
    if (hasArabic) {
        return processArabicText(text);
    }
    
    return text;
};
