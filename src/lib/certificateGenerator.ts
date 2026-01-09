import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

/**
 * Proper Arabic text reshaping with contextual forms
 */
const reshapeArabic = (text: string): string => {
    // Characters that connect to the next character
    const connectingChars = new Set([
        'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ',
        'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'ي', 'ئ'
    ]);
    
    // Non-connecting characters (isolated forms)
    const nonConnectingChars = new Set(['ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ة', 'ء', 'ى']);
    
    // Arabic character forms: [isolated, final, initial, medial]
    const arabicForms: Record<string, string[]> = {
        'ا': ['\uFE8D', '\uFE8E', '\uFE8D', '\uFE8E'],
        'أ': ['\uFE83', '\uFE84', '\uFE83', '\uFE84'],
        'إ': ['\uFE87', '\uFE88', '\uFE87', '\uFE88'],
        'آ': ['\uFE81', '\uFE82', '\uFE81', '\uFE82'],
        'ب': ['\uFE8F', '\uFE90', '\uFE91', '\uFE92'],
        'ت': ['\uFE95', '\uFE96', '\uFE97', '\uFE98'],
        'ث': ['\uFE99', '\uFE9A', '\uFE9B', '\uFE9C'],
        'ج': ['\uFE9D', '\uFE9E', '\uFE9F', '\uFEA0'],
        'ح': ['\uFEA1', '\uFEA2', '\uFEA3', '\uFEA4'],
        'خ': ['\uFEA5', '\uFEA6', '\uFEA7', '\uFEA8'],
        'د': ['\uFEA9', '\uFEAA', '\uFEA9', '\uFEAA'],
        'ذ': ['\uFEAB', '\uFEAC', '\uFEAB', '\uFEAC'],
        'ر': ['\uFEAD', '\uFEAE', '\uFEAD', '\uFEAE'],
        'ز': ['\uFEAF', '\uFEB0', '\uFEAF', '\uFEB0'],
        'س': ['\uFEB1', '\uFEB2', '\uFEB3', '\uFEB4'],
        'ش': ['\uFEB5', '\uFEB6', '\uFEB7', '\uFEB8'],
        'ص': ['\uFEB9', '\uFEBA', '\uFEBB', '\uFEBC'],
        'ض': ['\uFEBD', '\uFEBE', '\uFEBF', '\uFEC0'],
        'ط': ['\uFEC1', '\uFEC2', '\uFEC3', '\uFEC4'],
        'ظ': ['\uFEC5', '\uFEC6', '\uFEC7', '\uFEC8'],
        'ع': ['\uFEC9', '\uFECA', '\uFECB', '\uFECC'],
        'غ': ['\uFECD', '\uFECE', '\uFECF', '\uFED0'],
        'ف': ['\uFED1', '\uFED2', '\uFED3', '\uFED4'],
        'ق': ['\uFED5', '\uFED6', '\uFED7', '\uFED8'],
        'ك': ['\uFED9', '\uFEDA', '\uFEDB', '\uFEDC'],
        'ل': ['\uFEDD', '\uFEDE', '\uFEDF', '\uFEE0'],
        'م': ['\uFEE1', '\uFEE2', '\uFEE3', '\uFEE4'],
        'ن': ['\uFEE5', '\uFEE6', '\uFEE7', '\uFEE8'],
        'ه': ['\uFEE9', '\uFEEA', '\uFEEB', '\uFEEC'],
        'و': ['\uFEED', '\uFEEE', '\uFEED', '\uFEEE'],
        'ي': ['\uFEF1', '\uFEF2', '\uFEF3', '\uFEF4'],
        'ى': ['\uFEEF', '\uFEF0', '\uFEEF', '\uFEF0'],
        'ة': ['\uFE93', '\uFE94', '\uFE93', '\uFE94'],
        'ئ': ['\uFE89', '\uFE8A', '\uFE8B', '\uFE8C'],
        'ء': ['\uFE80', '\uFE80', '\uFE80', '\uFE80'],
    };
    
    const chars = text.split('');
    const result: string[] = [];
    
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const prevChar = i > 0 ? chars[i - 1] : null;
        const nextChar = i < chars.length - 1 ? chars[i + 1] : null;
        
        // Skip spaces
        if (char === ' ') {
            result.push(char);
            continue;
        }
        
        // If not Arabic, keep as is
        if (!arabicForms[char]) {
            result.push(char);
            continue;
        }
        
        // Determine position: 0=isolated, 1=final, 2=initial, 3=medial
        const prevConnects = prevChar && connectingChars.has(prevChar);
        const nextConnects = nextChar && (connectingChars.has(nextChar) || nonConnectingChars.has(nextChar));
        
        let formIndex = 0; // isolated
        if (prevConnects && nextConnects) {
            formIndex = 3; // medial
        } else if (prevConnects) {
            formIndex = 1; // final
        } else if (nextConnects && connectingChars.has(char)) {
            formIndex = 2; // initial
        }
        
        result.push(arabicForms[char][formIndex]);
    }
    
    // Reverse for RTL
    return result.join('');
};

/**
 * Generate and download a certificate PDF for course completion
 * Uses existing PDF template from storage and adds student name
 * @param fullName - Student's full name in Arabic
 * @param templateUrl - URL to the certificate template PDF from Supabase Storage (required)
 */
export const generateCertificate = async (fullName: string, templateUrl?: string): Promise<void> => {
    try {
        // Template URL is required - must be from storage
        if (!templateUrl) {
            throw new Error('لم يتم تحميل قالب شهادة لهذه الدورة. يرجى التواصل مع الإدارة.');
        }
        
        // Load the PDF template from storage
        const existingPdfBytes = await fetch(templateUrl).then(res => {
            if (!res.ok) throw new Error(`Failed to load certificate template from ${templateUrl}`);
            return res.arrayBuffer();
        });
        
        // Load the PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Register fontkit to use custom fonts
        pdfDoc.registerFontkit(fontkit);
        
        // Load Arabic font from public folder
        const fontUrl = '/fonts/Amiri-Bold.ttf';
        const fontBytes = await fetch(fontUrl).then(res => {
            if (!res.ok) throw new Error('Failed to load font. Please ensure Amiri-Bold.ttf is in the public folder.');
            return res.arrayBuffer();
        });
        const arabicFont = await pdfDoc.embedFont(fontBytes);
        
        // Get the first page
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const { width, height } = firstPage.getSize();
        
        // Add student name
        // Position coordinates: adjust these based on your template
        // Y coordinate: 0 = bottom, height = top
        // For A4 landscape (842 x 595 points), middle is ~297
        const fontSize = 42;
        
        // Reshape Arabic text for proper display
        const processedName = reshapeArabic(fullName);
        const textWidth = arabicFont.widthOfTextAtSize(processedName, fontSize);
        
        // Position: center horizontally, adjust Y based on your template
        // Change this Y value to match your certificate design
        const xPosition = width / 2 - textWidth / 2 - 20; // Adjust this number left/right as needed
        const yPosition = height / 2 - 50; // Adjust this number up/down as needed
        
        firstPage.drawText(processedName, {
            x: xPosition,
            y: yPosition,
            size: fontSize,
            font: arabicFont,
            color: rgb(0.82, 0.11, 0.14), // #D21D23 in RGB
        });
        
        // Save the PDF
        const pdfBytes = await pdfDoc.save();
        
        // Download the PDF
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `شهادة_غراس_${fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw new Error('فشل في توليد الشهادة');
    }
};