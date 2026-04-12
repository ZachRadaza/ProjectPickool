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