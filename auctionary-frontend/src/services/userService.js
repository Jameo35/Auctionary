const login = (email, password) => {
    return fetch("http://localhost:3333/login", 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                "email":email,
                "password": password 
            })
        }
    )
    .then((response) => {
        return response.json().then(data => {
            if (response.ok) {
                localStorage.setItem('user_id', data.user_id);
                localStorage.setItem('session_token', data.session_token);
                return data;
            } else {
                throw 'Unsuccessful login attempt';
            }
        });
    })
    .catch((err) => {
        console.log("Err",err)
        return Promise.reject(err)
    })
}


const signup = (firstName, lastName, email, password) => {
    return fetch("http://localhost:3333/users", 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "first_name": firstName,
                "last_name": lastName,
                "email":email,
                "password": password
            })
        }
    )
    .then(response => {
        return response.json().then(data => {
        if (response.status === 201){
            return data;
        }else{
            return Promise.reject(data.error_message);
        }
    });
    })
    .catch((err) => {
        console.log("Err",err)
        return Promise.reject(err)
    })
}

const logout = () => {
    const token = localStorage.getItem('session_token');
    return fetch("http://localhost:3333/logout", 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `${token}`
            }
        }
    )
    .then((response) => {
        if (response.ok) {
            localStorage.removeItem('session_token');
            localStorage.removeItem('user_id');
            return true;
        } else {
            throw 'Unsuccessful logout attempt';
        }
    })
    .catch((err) => {
        console.log("Err",err)
        return Promise.reject(err)
    })
}

const getUserProfile = (userId) => {
    return fetch(`http://localhost:3333/users/${userId}`)
    .then((response) => {
        if (response.status === 200){
            return response.json()
        }else{
            throw 'Something went wrong'
        }
    })
    .then((resJson) => {
        return resJson
    })
    .catch((err) => {
        console.log("Err",err)
        return Promise.reject(err)
    })
}  




export const userService = {
    login,
    signup,
    logout,
    getUserProfile
}