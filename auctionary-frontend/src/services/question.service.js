const submitQuestion = (itemId, questionText) => {
    const token = localStorage.getItem('session_token');
    return fetch(`http://localhost:3333/item/${itemId}/question`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `${token}`
            },
            body: JSON.stringify({
                "question_text": questionText
            })
        }
    )
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

const submitAnswer = (questionId, answerText) => {
    const token = localStorage.getItem('session_token');
    return fetch(`http://localhost:3333/question/${questionId}`, 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Authorization': `${token}`
            },
            body: JSON.stringify({
                "answer_text": answerText
            })
        }
    )
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


export const questionService = {
    submitQuestion,
    submitAnswer
};