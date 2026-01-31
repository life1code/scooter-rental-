/**
 * Compresses a base64 image string to reduce its size for localStorage.
 * @param base64Str Target base64 string
 * @param maxWidth Max width in pixels
 * @param quality Compression quality (0 to 1)
 */
export async function compressImage(base64Str: string, maxWidth = 800, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(base64Str);
                return;
            }

            // Fill white background (crucial for JPEG conversion to avoid black boxes)
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);

            // Return smallest version
            resolve(compressed.length < base64Str.length ? compressed : base64Str);
        };
        img.onerror = () => resolve(base64Str);
    });
}

/**
 * Safely saves data to localStorage by catching QuotaExceededErrors 
 * and pruning old entries from lists if necessary.
 */
export function safeSaveToLocalStorage(key: string, newData: any[]) {
    try {
        localStorage.setItem(key, JSON.stringify(newData));
    } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
            // If storage is full, remove the oldest item and try again recursively
            if (newData.length > 1) {
                const prunedData = newData.slice(0, -1);
                safeSaveToLocalStorage(key, prunedData);
            } else {
                console.error("Critical: Storage is full and cannot even store a single item.");
                alert("Storage is full. Please clear your browser data or delete some old bookings.");
            }
        } else {
            console.error("Unknown localStorage error:", e);
        }
    }
}
