import { LoaderCircle } from "lucide-react";

export default function Loading() {
    return (
        <div className="text-black w-full h-[96vh] flex justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2">
                <LoaderCircle className="text-[#0e76fd] size-16 animate-spin" />
                <div className="font-bold">Loading...</div>
            </div>
        </div>
    );
}
