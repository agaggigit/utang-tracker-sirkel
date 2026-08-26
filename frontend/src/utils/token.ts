export const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const setToken = (token: string, rememberMe: boolean = true) => {
    if (rememberMe) {
        localStorage.setItem('token', token);
    } else {
        sessionStorage.setItem('token', token);
    }
};

export const removeToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
};
