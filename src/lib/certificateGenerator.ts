import html2pdf from 'html2pdf.js';

/**
 * Generate and download a certificate PDF for course completion
 * Uses HTML → PDF approach for perfect Arabic rendering
 * @param fullName - Student's full name in Arabic
 */
export const generateCertificate = async (fullName: string): Promise<void> => {
    try {
        // Get current date in Arabic
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Create HTML certificate with proper RTL and Arabic fonts
        const certificateHTML = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Cairo', Arial, sans-serif;
                        direction: rtl;
                        width: 297mm;
                        height: 210mm;
                        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .certificate {
                        width: 277mm;
                        height: 190mm;
                        background: white;
                        border: 8px solid #059669;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 40px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        right: 15px;
                        bottom: 15px;
                        border: 2px solid #059669;
                        pointer-events: none;
                    }
                    
                    .logo {
                        width: 80px;
                        height: 80px;
                        margin-bottom: 20px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .title-en {
                        font-size: 36px;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 10px;
                        font-family: Arial, sans-serif;
                        direction: ltr;
                        text-align: center;
                    }
                    
                    .title-ar {
                        font-size: 42px;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    
                    .divider {
                        width: 200px;
                        height: 3px;
                        background: linear-gradient(90deg, transparent, #059669, transparent);
                        margin: 20px 0;
                    }
                    
                    .certify-text {
                        font-size: 22px;
                        color: #475569;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    
                    .student-name {
                        font-size: 38px;
                        font-weight: 700;
                        color: #059669;
                        margin: 20px 0;
                        text-align: center;
                        text-decoration: underline;
                        text-decoration-color: #059669;
                        text-underline-offset: 8px;
                    }
                    
                    .description {
                        font-size: 24px;
                        color: #334155;
                        margin: 15px 0;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    .course-name {
                        font-size: 28px;
                        font-weight: 700;
                        color: #059669;
                        margin: 15px 0;
                        text-align: center;
                    }
                    
                    .organization {
                        font-size: 22px;
                        color: #475569;
                        margin: 10px 0;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    .attendance-note {
                        font-size: 18px;
                        color: #64748b;
                        margin: 10px 0;
                        text-align: center;
                    }
                    
                    .date {
                        font-size: 16px;
                        color: #64748b;
                        margin-top: 20px;
                        text-align: center;
                    }
                    
                    .signature-section {
                        position: absolute;
                        bottom: 40px;
                        right: 60px;
                        text-align: center;
                    }
                    
                    .signature-line {
                        width: 150px;
                        height: 2px;
                        background: #059669;
                        margin-bottom: 8px;
                    }
                    
                    .signature-label {
                        font-size: 14px;
                        color: #64748b;
                    }
                    
                    .seal {
                        position: absolute;
                        bottom: 30px;
                        left: 50px;
                        width: 80px;
                        height: 80px;
                        background: #059669;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 20px;
                        font-weight: 700;
                        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                    }
                    
                    .footer {
                        position: absolute;
                        bottom: 15px;
                        text-align: center;
                        width: 100%;
                        font-size: 12px;
                        color: #94a3b8;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <img src="/logo.png" alt="شعار غراس" class="logo">
                    
                    <div class="title-en">Certificate of Completion</div>
                    <div class="title-ar">شهادة إتمام</div>
                    
                    <div class="divider"></div>
                    
                    <div class="certify-text">هذا يشهد بأن</div>
                    
                    <div class="student-name">${fullName}</div>
                    
                    <div class="description">قد أكمل بنجاح</div>
                    
                    <div class="course-name">دورة غراس لمدة 10 أيام</div>
                    
                    <div class="organization">أكاديمية غراس للعلم</div>
                    
                    <div class="attendance-note">بحضور كامل لجميع الأيام العشرة</div>
                    
                    <div class="date">تاريخ الإصدار: ${currentDate}</div>
                    
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="signature-label">التوقيع</div>
                    </div>
                    
                    <div class="seal">غراس</div>
                    
                    <div class="footer">www.ghras.academy</div>
                </div>
            </body>
            </html>
        `;

        // Create a temporary container with proper dimensions
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-10000px';
        container.style.left = '0';
        container.style.width = '1122px'; // A4 landscape width at 96 DPI
        container.style.height = '793px'; // A4 landscape height at 96 DPI
        container.innerHTML = certificateHTML;
        document.body.appendChild(container);

        // Wait for images and fonts to load
        const logo = container.querySelector('.logo') as HTMLImageElement;
        if (logo) {
            await new Promise((resolve) => {
                if (logo.complete) {
                    resolve(null);
                } else {
                    logo.onload = () => resolve(null);
                    logo.onerror = () => resolve(null); // Continue even if logo fails
                }
            });
        }

        // Wait for fonts to load (Cairo from Google Fonts)
        if (document.fonts) {
            await document.fonts.ready;
        }
        
        // Additional delay to ensure everything is rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        // Configure html2pdf options
        const opt = {
            margin: 0,
            filename: `شهادة_غراس_${fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
            image: { type: 'jpeg' as const, quality: 1 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                letterRendering: true,
                allowTaint: true
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'landscape' as const,
                compress: true
            }
        };

        // Generate PDF from the certificate element
        const certificateElement = container.querySelector('.certificate') as HTMLElement;
        if (certificateElement) {
            await html2pdf().set(opt).from(certificateElement).save();
        } else {
            throw new Error('Failed to find certificate element');
        }

        // Cleanup
        document.body.removeChild(container);
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw new Error('فشل في توليد الشهادة');
    }
};

/**
 * Preview certificate as HTML in a new window
 * @param fullName - Student's full name in Arabic
 */
export const previewCertificate = (fullName: string): void => {
    try {
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const certificateHTML = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>معاينة الشهادة - ${fullName}</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Cairo', Arial, sans-serif;
                        direction: rtl;
                        width: 100vw;
                        height: 100vh;
                        background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 20px;
                        margin: 0;
                    }
                    
                    .certificate {
                        width: 1050px;
                        height: 750px;
                        background: white;
                        border: 8px solid #059669;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 40px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    }
                    
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        right: 15px;
                        bottom: 15px;
                        border: 2px solid #059669;
                        pointer-events: none;
                    }
                    
                    .logo {
                        width: 80px;
                        height: 80px;
                        margin-bottom: 20px;
                        position: relative;
                        z-index: 1;
                    }
                    
                    .title-en {
                        font-size: 36px;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 10px;
                        font-family: Arial, sans-serif;
                        direction: ltr;
                        text-align: center;
                    }
                    
                    .title-ar {
                        font-size: 42px;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    
                    .divider {
                        width: 200px;
                        height: 3px;
                        background: linear-gradient(90deg, transparent, #059669, transparent);
                        margin: 20px 0;
                    }
                    
                    .certify-text {
                        font-size: 22px;
                        color: #475569;
                        margin-bottom: 15px;
                        text-align: center;
                    }
                    
                    .student-name {
                        font-size: 38px;
                        font-weight: 700;
                        color: #059669;
                        margin: 20px 0;
                        text-align: center;
                        text-decoration: underline;
                        text-decoration-color: #059669;
                        text-underline-offset: 8px;
                    }
                    
                    .description {
                        font-size: 24px;
                        color: #334155;
                        margin: 15px 0;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    .course-name {
                        font-size: 28px;
                        font-weight: 700;
                        color: #059669;
                        margin: 15px 0;
                        text-align: center;
                    }
                    
                    .organization {
                        font-size: 22px;
                        color: #475569;
                        margin: 10px 0;
                        text-align: center;
                        font-weight: 600;
                    }
                    
                    .attendance-note {
                        font-size: 18px;
                        color: #64748b;
                        margin: 10px 0;
                        text-align: center;
                    }
                    
                    .date {
                        font-size: 16px;
                        color: #64748b;
                        margin-top: 20px;
                        text-align: center;
                    }
                    
                    .signature-section {
                        position: absolute;
                        bottom: 40px;
                        right: 60px;
                        text-align: center;
                    }
                    
                    .signature-line {
                        width: 150px;
                        height: 2px;
                        background: #059669;
                        margin-bottom: 8px;
                    }
                    
                    .signature-label {
                        font-size: 14px;
                        color: #64748b;
                    }
                    
                    .seal {
                        position: absolute;
                        bottom: 30px;
                        left: 50px;
                        width: 80px;
                        height: 80px;
                        background: #059669;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 20px;
                        font-weight: 700;
                        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
                    }
                    
                    .footer {
                        position: absolute;
                        bottom: 15px;
                        text-align: center;
                        width: 100%;
                        font-size: 12px;
                        color: #94a3b8;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <img src="/logo.png" alt="شعار غراس" class="logo">
                    
                    <div class="title-en">Certificate of Completion</div>
                    <div class="title-ar">شهادة إتمام</div>
                    
                    <div class="divider"></div>
                    
                    <div class="certify-text">هذا يشهد بأن</div>
                    
                    <div class="student-name">${fullName}</div>
                    
                    <div class="description">قد أكمل بنجاح</div>
                    
                    <div class="course-name">دورة غراس لمدة 10 أيام</div>
                    
                    <div class="organization">أكاديمية غراس للعلم</div>
                    
                    <div class="attendance-note">بحضور كامل لجميع الأيام العشرة</div>
                    
                    <div class="date">تاريخ الإصدار: ${currentDate}</div>
                    
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="signature-label">التوقيع</div>
                    </div>
                    
                    <div class="seal">غراس</div>
                    
                    <div class="footer">www.ghras.academy</div>
                </div>
            </body>
            </html>
        `;

        // Open in new window
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(certificateHTML);
            previewWindow.document.close();
        }
    } catch (error) {
        console.error('Error previewing certificate:', error);
        throw new Error('فشل في معاينة الشهادة');
    }
};
