import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { type FormData } from "src/pages/CreateTopic";
import "./FileUploader.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function FileUploader({ formData, setFormData }: { formData: FormData; setFormData: React.Dispatch<React.SetStateAction<FormData>> }) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (acceptedFiles[0].size > MAX_FILE_SIZE) {
            alert("File is too large. Maximum size is 5MB.");
            return;
        }
        console.log({ acceptedFiles });

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((data) => ({ ...data, resource: reader.result as string, resourceFile: file }));
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
            "video/*": [".mp4"],
        },
        maxFiles: 1,
    });

    return (
        <div className="file-upload-container">
            <div {...getRootProps()} className={`file-drop-zone ${isDragActive ? "active" : ""}`} style={{ height: "100%", padding: 0 }}>
                <input {...getInputProps()} />
                {formData.resource ? (
                    <label>{formData.resourceFile?.type === "video/mp4" ? <video src={formData.resource} controls /> : <img src={formData.resource} />}</label>
                ) : (
                    <div style={{ padding: "1.5rem" }}>
                        <Upload className="file-drop-zone-icon" />
                        <p className="file-drop-zone-text">Drag & drop a file here, or click to select</p>
                        <p className="file-drop-zone-subtext">Supports: JPEG, JPG, PNG, GIF, WEBP, MP4 (max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
