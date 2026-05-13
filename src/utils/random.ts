export function wait(ms: number) {
    return new Promise<void>(resolve => {
        setTimeout(resolve, ms);
    });
}

export function capitalizeWords(str?: string | null): string {
    if (!str) return "";

    return str.replace(
        /\p{L}+/gu,
        word => word[0].toUpperCase() + word.slice(1).toLowerCase()
    );
}

export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(new Error(error.message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    });
}

export function convertSecondsToHours(sec: number){
    return sec / 3600;
}

export function convertHoursToSeconds(hours: number){
    return hours * 60 * 60;
}

export function timeAgo(date: string | number | Date): string {
    const inputDate = new Date(date);

    if(isNaN(inputDate.getTime()))
        return '';

    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if(diffSeconds < 60)
        return rtf.format(-diffSeconds, 'second');

    if(diffSeconds < 3600)
        return rtf.format(-Math.floor(diffSeconds / 60), 'minute');

    if(diffSeconds < 86400)
        return rtf.format(-Math.floor(diffSeconds / 3600), 'hour');

    if(diffSeconds < 2592000)
        return rtf.format(-Math.floor(diffSeconds / 86400), 'day');

    if(diffSeconds < 31536000)
        return rtf.format(-Math.floor(diffSeconds / 2592000), 'month');

    return rtf.format(-Math.floor(diffSeconds / 31536000), 'year');
}