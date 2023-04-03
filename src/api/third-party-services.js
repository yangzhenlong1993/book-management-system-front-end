import request from '@/utils/request'

export default {
  getOssPolicy() {
    return request({
      url: '/oss/policy',
      method: 'get',
    });
  },
}