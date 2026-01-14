//导入request.js请求工具
import request from '@/utils/request.js'

//上传图片
export const uploadImageService = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

//批量上传图片
export const uploadMultipleImagesService = (files) => {
    const formData = new FormData()
    files.forEach((file, index) => {
        formData.append(`files`, file)
    })
    return request.post('/upload/batch', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}