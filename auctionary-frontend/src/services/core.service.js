const searchItems = (query = "") => {
    let url = "http://localhost:3333/search";
    if (query) {
        url += `?q=${encodeURIComponent(query)}`;
    }
    return fetch(url)
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

export const coreService = {
    searchItems,
    getSingleItem,
    getBidHistory,
    getQuestionsForItem
}