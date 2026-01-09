import html2pdf from 'html2pdf.js';

/**
 * Generate and download a certificate PDF for course completion
 * Uses HTML → PDF approach for perfect Arabic rendering
 * @param fullName - Student's full name in Arabic
 */
export const generateCertificate = async (fullName: string): Promise<void> => {
    try {
        // Get current date in both Hijri and Gregorian
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            calendar: 'islamic-umalqura'
        });
        
        const gregorianDate = new Date().toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Generate certificate serial number
        const serialNumber = `GHR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

        // Create HTML certificate with proper RTL and Arabic fonts
        const certificateHTML = `
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Amiri', 'Traditional Arabic', serif;
                        direction: rtl;
                        width: 297mm;
                        height: 210mm;
                        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .certificate {
                        width: 287mm;
                        height: 200mm;
                        background: white;
                        border: 10px solid #059669;
                        position: relative;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 30px 50px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    }
                    
                    .certificate::before {
                        content: '';
                        position: absolute;
                        top: 18px;
                        left: 18px;
                        right: 18px;
                        bottom: 18px;
                        border: 3px solid #059669;
                        pointer-events: none;
                    }w
                    
                    .certificate::after {
                        content: '';
                        position: absolute;
                        top: 25px;
                        left: 25px;
                        right: 25px;
                        bottom: 25px;
                        border: 1px solid #10b981;
                        pointer-events: none;
                    }
                    
                    .serial-number {
                        position: absolute;
                        top: 35px;
                        left: 50px;
                        font-size: 13px;
                        color: #6b7280;
                        font-weight: 400;
                        direction: ltr;
                        font-family: 'Courier New', monospace;
                    }
                    
                    .logo {
                        width: 85px;
                        height: 85px;
                        position: absolute;
                        top: 35px;
                        right: 50px;
                        z-index: 1;
                    }
                    
                    .title-ar {
                        font-size: 48px;
                        font-weight: 700;
                        color: #059669;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    
                    .divider {
                        width: 250px;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #059669, transparent);
                        margin: 15px 0 25px 0;
                    }
                    
                    .certify-text {
                        font-size: 22px;
                        color: #374151;
                        margin-bottom: 5px;
                        text-align: center;
                        font-weight: 700;
                        line-height: 1.8;
                    }
                    
                    .student-name-container {
                        margin: 20px 0;
                        text-align: center;
                    }
                    
                    .student-title {
                        font-size: 18px;
                        color: #6b7280;
                        margin-bottom: 5px;
                    }
                    
                    .student-name {
                        font-size: 40px;
                        font-weight: 700;
                        color: #059669;
                        text-align: center;
                        padding: 5px 40px;
                        border-bottom: 3px solid #059669;
                        display: inline-block;
                    }
                    
                    .description {
                        font-size: 22px;
                        color: #374151;
                        margin: 20px 0 15px 0;
                        text-align: center;
                        font-weight: 700;
                        line-height: 1.8;
                    }
                    
                    .course-name {
                        font-size: 28px;
                        font-weight: 700;
                        color: #059669;
                        margin: 15px 0;
                        text-align: center;
                        line-height: 1.6;
                    }
                    
                    .organization {
                        font-size: 20px;
                        color: #374151;
                        margin: 10px 0;
                        text-align: center;
                        font-weight: 700;
                    }
                    
                    .attendance-note {
                        font-size: 18px;
                        color: #6b7280;
                        margin: 15px 0 20px 0;
                        text-align: center;
                        font-weight: 400;
                    }
                    
                    .date-section {
                        text-align: center;
                        margin-top: 15px;
                        font-size: 15px;
                        color: #6b7280;
                        line-height: 1.8;
                    }
                    
                    .date-label {
                        font-weight: 700;
                        color: #374151;
                    }
                    
                    .signature-section {
                        position: absolute;
                        bottom: 50px;
                        right: 80px;
                        text-align: center;
                    }
                    
                    .signature-line {
                        width: 180px;
                        height: 2px;
                        background: #059669;
                        margin-bottom: 10px;
                    }
                    
                    .signature-name {
                        font-size: 18px;
                        color: #374151;
                        font-weight: 700;
                        margin-bottom: 5px;
                    }
                    
                    .signature-title {
                        font-size: 14px;
                        color: #6b7280;
                        font-weight: 400;
                    }
                    
                    .seal {
                        position: absolute;
                        bottom: 40px;
                        left: 70px;
                        width: 120px;
                        height: 120px;
                        background: #059669;
                        border-radius: 50%;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 18px;
                        font-weight: 700;
                        box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
                        border: 4px solid white;
                        line-height: 1.2;
                    }
                    
                    .seal-top {
                        font-size: 14px;
                        margin-bottom: 2px;
                        margin-top: -10px;
                    }
                    
                    .seal-main {
                        font-size: 22px;
                        font-weight: 700;
                    }
                    
                    .footer {
                        position: absolute;
                        bottom: 35px;
                        text-align: center;
                        width: 100%;
                        font-size: 13px;
                        font-family: 'Courier New', monospace;
                        direction: ltr;
                    }
                    
                    .footer a {
                        color: #059669;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="serial-number">No. ${serialNumber}</div>
                    
                    <img src="/logo.png" alt="شعار غراس" class="logo">
                    
                    <div class="title-ar">شهادة إتمام</div>
                    
                    <div class="divider"></div>
                    
                    <div class="certify-text">
                        تشهد أكاديمية غراس للعلوم الشرعية 
                        بأن
                    </div>
                    
                    <div class="student-name-container">
                        <div class="student-name">${fullName}</div>
                    </div>
                    
                    <div class="description">
                        قد أتم بنجاح حضور واجتياز
                        برنامج غراس العلمي المكثف
                    </div>
                    
                    <div class="course-name">دورة غراس لمدة عشرة أيام</div>
                    
                    <div class="attendance-note">بحضور كامل لجميع الأيام العشرة وذلك بتوفيق الله تعالى</div>
                    
                    <div class="date-section">
                        <div><span class="date-label">حُررت هذه الشهادة في:</span></div>
                        <div>${currentDate} هـ - الموافق: ${gregorianDate} م</div>
                    </div>
                    
                    <div class="signature-section">
                        <div class="signature-line"></div>
                        <div class="signature-name">التوقيع والختم</div>
                        <div class="signature-title">مدير أكاديمية غراس</div>
                    </div>
                    
                    <div class="seal">
                        <div class="seal-top">أكاديمية</div>
                        <div class="seal-main">غراس العلم</div>
                    </div>
                    
                    <div class="footer"><a href="https://gheras-3elm.com" target="_blank">gheras-3elm.com</a></div>
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
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
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