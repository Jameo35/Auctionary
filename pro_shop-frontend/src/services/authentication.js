const ifAuthenticated = (to, from, next) => {
    const loggedIn = localStorage.getItem('session_token');
    if (loggedIn) {
        next();
        return;
    }
    next('/login');
};

import { reactive } from "vue";

export const authState = reactive({
    isLoggedIn: !!localStorage.getItem('session_token')
});

const getUserId = () => {
    return localStorage.getItem('user_id');
}

const login = () => {
    authState.isLoggedIn = true;
}
const logout = () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_id');
    authState.isLoggedIn = false;
}

const isAuthenticated = () => {
    return authState.isLoggedIn;
}


export const auth = {
    ifAuthenticated,
    isAuthenticated,
    login,
    logout,
    getUserId
};