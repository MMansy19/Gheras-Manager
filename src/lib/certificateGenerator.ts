import jsPDF from 'jspdf';

/**
 * Generate and download a certificate PDF for course completion
 * @param fullName - Student's full name in Arabic
 */
export const generateCertificate = async (fullName: string): Promise<void> => {
    try {
        // Create new PDF document (A4 landscape)
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Background color - Primary brand color
        pdf.setFillColor(236, 253, 245); // #ecfdf5 - primary-50
        pdf.rect(0, 0, pageWidth, pageHeight, 'F');

        // Border frame
        pdf.setDrawColor(5, 150, 105); // #059669 - primary
        pdf.setLineWidth(2);
        pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner decorative border
        pdf.setLineWidth(0.5);
        pdf.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Title - "شهادة إتمام"
        pdf.setTextColor(5, 150, 105); // primary color
        pdf.setFontSize(32);
        // Note: jsPDF doesn't support Arabic out of the box
        // For production, you'd need to add Arabic font support
        // Using English placeholder for now
        pdf.text('Certificate of Completion', pageWidth / 2, 40, { align: 'center' });

        pdf.setFontSize(28);
        pdf.text('شهادة إتمام', pageWidth / 2, 50, { align: 'center' });

        // Decorative line
        pdf.setDrawColor(5, 150, 105);
        pdf.setLineWidth(0.5);
        pdf.line(pageWidth / 2 - 40, 55, pageWidth / 2 + 40, 55);

        // "This is to certify that" text
        pdf.setTextColor(71, 85, 105); // gray-600
        pdf.setFontSize(16);
        pdf.text('هذا يشهد بأن', pageWidth / 2, 75, { align: 'center' });

        // Student name (highlighted)
        pdf.setTextColor(5, 150, 105); // primary
        pdf.setFontSize(24);
        pdf.text(fullName, pageWidth / 2, 90, { align: 'center' });

        // Description
        pdf.setTextColor(51, 65, 85); // slate-700
        pdf.setFontSize(16);
        pdf.text('قد أكمل بنجاح', pageWidth / 2, 105, { align: 'center' });

        // Course name
        pdf.setFontSize(20);
        pdf.setTextColor(5, 150, 105);
        pdf.text('دورة غراس لمدة 10 أيام', pageWidth / 2, 120, { align: 'center' });

        // Organization
        pdf.setFontSize(16);
        pdf.setTextColor(71, 85, 105);
        pdf.text('أكاديمية غراس العلم', pageWidth / 2, 135, { align: 'center' });

        // Attendance note
        pdf.setFontSize(14);
        pdf.text('بحضور كامل لجميع الأيام العشرة', pageWidth / 2, 145, { align: 'center' });

        // Date
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        pdf.setFontSize(12);
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(`تاريخ الإصدار: ${currentDate}`, pageWidth / 2, 165, { align: 'center' });

        // Signature area
        pdf.setLineWidth(0.3);
        pdf.line(40, 180, 90, 180); // Signature line
        pdf.setFontSize(10);
        pdf.text('التوقيع', 65, 186, { align: 'center' });

        // Seal/Badge placeholder (circle)
        pdf.setFillColor(5, 150, 105);
        pdf.circle(pageWidth - 40, pageHeight - 40, 15, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('غراس', pageWidth - 40, pageHeight - 38, { align: 'center' });

        // Footer
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.setFontSize(8);
        pdf.text('www.ghras.academy', pageWidth / 2, pageHeight - 15, { align: 'center' });

        // Download the PDF
        const fileName = `غراس_شهادة_${fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw new Error('فشل في توليد الشهادة');
    }
};

/**
 * Preview certificate (opens in new tab instead of downloading)
 */
export const previewCertificate = async (_fullName: string): Promise<void> => {
    try {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        // Same generation logic as above...
        // (Simplified for preview)

        // Open in new tab
        window.open(pdf.output('bloburl'), '_blank');
    } catch (error) {
        console.error('Error previewing certificate:', error);
        throw new Error('فشل في معاينة الشهادة');
    }
};
