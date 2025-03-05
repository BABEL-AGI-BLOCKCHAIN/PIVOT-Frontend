import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { type FormData } from "src/pages/CreateTopic";

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
        <div className="w-full h-40">
            <div
                {...getRootProps()}
                className={`flex items-center justify-center border-2 border-dashed rounded-md transition-all duration-200 ease-in-out ${
                    isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
                } h-full p-0 cursor-pointer`}
            >
                <input {...getInputProps()} />
                {formData.resource ? (
                    <label className="h-full flex cursor-pointer items-center">
                        {formData.resourceFile?.type === "video/mp4" ? (
                            <video src={formData.resource} controls className="w-full h-full object-contain" />
                        ) : (
                            <img src={formData.resource} className="w-full h-full object-contain" />
                        )}
                    </label>
                ) : (
                    <div className="p-6 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Drag & drop a file here, or click to select</p>
                        <p className="mt-1 text-xs text-gray-500">Supports: JPEG, JPG, PNG, GIF, WEBP, MP4 (max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
