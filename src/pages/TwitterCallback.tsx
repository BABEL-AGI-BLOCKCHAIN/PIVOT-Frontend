import { useEffect } from "react";

export default function TwitterCallback() {
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");
        window.opener.postMessage({ status }, window.origin);
        window.close();
    }, []);
    return null;
}
