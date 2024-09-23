const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || "AIzaSyCSSlUVnHRKnG3fQzXPmRSTyuJ_6MBImuE";

export function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google) {
            resolve(window.google);
        } else {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(window.google); 
            script.onerror = (err) => reject(err);
            document.body.appendChild(script);
        }
    });
}