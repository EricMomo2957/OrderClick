import React, { useState } from 'react';
import axios from 'axios';
import { Upload, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const FileUploadSample = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [uploadedUrl, setUploadedUrl] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setUploadStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            setUploadStatus('uploading');
            // Sending to the new route we created in fileRoutes.js
            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setUploadedUrl(response.data.url);
            setUploadStatus('success');
        } catch (error) {
            console.error("Upload Error:", error);
            setUploadStatus('error');
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100">
            <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="text-[#004a80]" /> Admin Media Upload
            </h2>

            <div className="space-y-4">
                {/* Custom File Input */}
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <File className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">
                            {selectedFile ? selectedFile.name : "Click to select a file"}
                        </p>
                    </div>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                </label>

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadStatus === 'uploading'}
                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        !selectedFile 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-[#004a80] text-white hover:bg-[#00355c]'
                    }`}
                >
                    {uploadStatus === 'uploading' ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        "Start Upload"
                    )}
                </button>

                {/* Status Feedback */}
                {uploadStatus === 'success' && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                            <CheckCircle size={18} /> Upload Complete!
                        </div>
                        <input 
                            readOnly 
                            value={uploadedUrl} 
                            className="text-[10px] bg-white border border-green-200 p-2 rounded-lg text-slate-600 truncate"
                        />
                    </div>
                )}

                {uploadStatus === 'error' && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 text-red-700 font-bold text-sm">
                        <AlertCircle size={18} /> Upload failed. Try again.
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadSample;