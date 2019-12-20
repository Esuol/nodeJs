const axios = require('axios');

const instance = axios.create({
    baseURL: 'https',
    timeout: 20000,
    headers: {'Content-Type':'application/x-www-form-urlencoded'}
});

// 响应拦截器
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
});

instance.interceptors.request.use(function (config) {
    console.log(config.url);
    config.params = config.params || {};
    config.data = config.data || {};
    // Do something before request is sent
    if (config.method === 'get') {
        config.params.ref = 'master';
        config.params.private_token ='7A6eXwHM6q4JvHESZvkY';
        console.log(config.params);
    } else if (config.method === 'post') {
        config.data.ref = 'master';
        config.data.private_token ='7A6eXwHM6q4JvHESZvkY';
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

module.exports = instance;