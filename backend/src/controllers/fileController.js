import path from 'path';

export const uploadFile = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Generate the file URL for the frontend
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(200).json({
            message: "File uploaded successfully",
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};