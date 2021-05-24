import axios from "axios";

export function request(config) {
    return axios.create({
        baseURL: 'https://chatquickly.cn:8090'
    })(config)
}