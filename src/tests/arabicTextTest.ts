import { processArabicText } from '../lib/arabicTextHelper';

/**
 * Test Arabic text processing
 * Run this in browser console to verify Arabic rendering
 */

// Test cases
const testCases = [
    'شهادة إتمام',
    'محمود منسي',
    'دورة غراس لمدة 10 أيام',
    'أكاديمية غراس للعلم',
    'بحضور كامل لجميع الأيام العشرة',
];

console.log('=== Arabic Text Processing Tests ===\n');

testCases.forEach((text, index) => {
    const processed = processArabicText(text);
    console.log(`Test ${index + 1}:`);
    console.log(`  Original: ${text}`);
    console.log(`  Processed: ${processed}`);
    console.log('');
});

console.log('If processed text looks correct when rendered in PDF, the implementation is working!');

export {};
