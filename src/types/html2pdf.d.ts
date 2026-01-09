declare module 'html2pdf.js' {
    interface Html2PdfOptions {
        margin?: number | number[];
        filename?: string;
        image?: {
            type?: 'jpeg' | 'png' | 'webp';
            quality?: number;
        };
        html2canvas?: {
            scale?: number;
            useCORS?: boolean;
            logging?: boolean;
            letterRendering?: boolean;
            allowTaint?: boolean;
        };
        jsPDF?: {
            unit?: string;
            format?: string;
            orientation?: 'landscape' | 'portrait';
            compress?: boolean;
        };
    }

    interface Html2Pdf {
        set(options: Html2PdfOptions): Html2Pdf;
        from(element: HTMLElement): Html2Pdf;
        save(): Promise<void>;
        output(type: string): string;
        outputPdf(type?: string): any;
        toPdf(): Html2Pdf;
        get(key: string): any;
    }

    function html2pdf(): Html2Pdf;
    
    export default html2pdf;
}
