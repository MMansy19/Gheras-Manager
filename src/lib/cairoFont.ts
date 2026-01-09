/**
 * Cairo Font for jsPDF - Arabic Support
 * 
 * This file contains the Cairo font in base64 format for jsPDF.
 * To update this font:
 * 1. Download Cairo-Regular.ttf from Google Fonts
 * 2. Use online converter: https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html
 * 3. Replace the font data below
 * 
 * For now, we'll use a workaround with custom font loading
 */

import { jsPDF } from 'jspdf';

/**
 * Add Cairo font to jsPDF
 * This uses a publicly hosted font file
 */
export const addCairoFont = async (doc: jsPDF): Promise<void> => {
    try {
        // Note: For production, you should:
        // 1. Download Cairo font TTF
        // 2. Convert it using jsPDF font converter
        // 3. Import and add it here
        
        // For now, we'll use Helvetica with Arabic character support
        // and rely on the reshaping + reversal in arabicTextHelper.ts
        
        doc.setFont('helvetica');
        
        // Future implementation:
        // const CairoFont = await import('./fonts/Cairo-normal');
        // doc.addFileToVFS('Cairo-Regular.ttf', CairoFont.default);
        // doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
        // doc.setFont('Cairo');
        
    } catch (error) {
        console.error('Error loading Cairo font:', error);
        // Fallback to default font
        doc.setFont('helvetica');
    }
};

/**
 * Temporary: Load font from CDN
 * This is a workaround until proper font conversion is done
 */
export const loadCairoFontFromCDN = (): Promise<ArrayBuffer> => {
    return fetch('https://fonts.gstatic.com/s/cairo/v28/SLXVc1nY6HkvangtZmpcWmhzfH5lkSscQ1FsqYSsJQ.woff2')
        .then(response => response.arrayBuffer());
};
