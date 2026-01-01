const searchItems = ({ q, status, limit, offset, token } = {}) => {
    let url = "http://localhost:3333/search";
    const params = [];
    if (q) {
        params.push(`q=${encodeURIComponent(q)}`);
    }
    if (status){
        params.push(`status=${status}`);
    }
    if (limit) {
        params.push(`limit=${limit}`);
    }
    if (offset){
        params.push(`offset=${offset}`);
    }
    if (params.length) {
        url += `?${params.join('&')}`;
    }

    const headers = {};
    if (token) headers['X-Authorization'] = token;
    return fetch(url, { headers })
    .then((response) => {
        if (response.status === 200){
            return response.json()
        }else{
            throw 'Someting went wrong'
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

const getSingleItem = (id) => {
    return fetch(`http://localhost:3333/item/${id}`)
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

const getBidHistory = (id) => {
    return fetch(`http://localhost:3333/item/${id}/bid`)
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

const getQuestionsForItem = (id) => {
    return fetch(`http://localhost:3333/item/${id}/question`)
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

const createItem = (itemData) => {
    const token = localStorage.getItem('session_token');
    return fetch(`http://localhost:3333/item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': `${token}`
        },
        body: JSON.stringify(itemData),
    })
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

const placeBid = (itemId, bidAmount) => {
    const token = localStorage.getItem('session_token');
    return fetch(`http://localhost:3333/item/${itemId}/bid`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Authorization': `${token}`
        },
        body: JSON.stringify({ amount: bidAmount }),
    })
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

export const coreService = {
    searchItems,
    getSingleItem,
    getBidHistory,
    getQuestionsForItem,
    createItem,
    placeBid
}