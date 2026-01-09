import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Upload, FileText, X, Loader2 } from 'lucide-react';

interface CertificateUploadProps {
    courseId?: number;
    currentTemplateUrl?: string | null;
    onUploadSuccess: (url: string) => void;
    onRemove?: () => void;
}

export const CertificateUpload = ({
    courseId,
    currentTemplateUrl,
    onUploadSuccess,
    onRemove
}: CertificateUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== 'application/pdf') {
            setError('يرجى اختيار ملف PDF فقط');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Generate unique filename
            const fileExt = 'pdf';
            const fileName = courseId
                ? `course-${courseId}-${Date.now()}.${fileExt}`
                : `template-${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('certificate-templates')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data } = supabase.storage
                .from('certificate-templates')
                .getPublicUrl(fileName);

            onUploadSuccess(data.publicUrl);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('حدث خطأ أثناء رفع الملف. يرجى المحاولة مرة أخرى.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveTemplate = async () => {
        if (!currentTemplateUrl || !onRemove) return;

        try {
            // Extract filename from URL
            const urlParts = currentTemplateUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            // Delete from storage
            const { error: deleteError } = await supabase.storage
                .from('certificate-templates')
                .remove([fileName]);

            if (deleteError) {
                console.error('Delete error:', deleteError);
            }

            onRemove();
        } catch (err) {
            console.error('Error removing template:', err);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    قالب الشهادة (اختياري)
                </label>
                {currentTemplateUrl && (
                    <a
                        href={currentTemplateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                    >
                        <FileText className="w-4 h-4" />
                        عرض القالب الحالي
                    </a>
                )}
            </div>

            <div className="flex gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                />

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الرفع...
                        </>
                    ) : (
                        <>
                            <Upload className="w-4 h-4 ml-2" />
                            {currentTemplateUrl ? 'تغيير القالب' : 'رفع قالب PDF'}
                        </>
                    )}
                </Button>

                {currentTemplateUrl && onRemove && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveTemplate}
                        disabled={uploading}
                        className="text-red-600 hover:text-red-700 dark:text-red-400"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
                ملف PDF بحد أقصى 5 ميجابايت. إذا لم يتم رفع قالب، سيتم استخدام القالب الافتراضي.
            </p>
        </div>
    );
};
