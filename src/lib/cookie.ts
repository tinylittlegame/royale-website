/**
 * Set a cookie in the browser
 * @param name Cookie name
 * @param value Cookie value
 * @param daysOrDate Number of days until expiration or a Date object
 */
export const setCookie = (name: string, value: string, daysOrDate: number | Date = 365) => {
    let expires = "";
    if (daysOrDate) {
        let date: Date;
        if (daysOrDate instanceof Date) {
            date = daysOrDate;
        } else {
            date = new Date();
            date.setTime(date.getTime() + (daysOrDate * 24 * 60 * 60 * 1000));
        }
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null
 */
export const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

/**
 * Delete a cookie by name
 * @param name Cookie name
 */
export const deleteCookie = (name: string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

/**
 * Helper to add minutes to a date
 * @param date Base date
 * @param minutes Number of minutes to add
 * @returns New Date object
 */
export const addMinutesToDate = (date: Date, minutes: number): Date => {
    return new Date(date.getTime() + minutes * 60000);
};
