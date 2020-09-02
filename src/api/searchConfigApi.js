import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/search_config',
    method: 'get',
    params: query
  })
}

export function createSearchConfig(data) {
  data.startTime = data.startTime.getTime()
  data.endTime = data.endTime.getTime()
  console.log(data)
  return request({
    url: '/admin/search_config',
    method: 'post',
    headers:
    {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  })
}

export function updateSearchConfig(data) {
  return request({
    url: '/admin/search_config/' + data.id,
    headers:
    {
      'Content-Type': 'application/json'
    },
    method: 'post',
    data: JSON.stringify(data)
  })
}

export function deleteSearchConfig(id) {
  return request({
    url: '/admin/search_config/' + id,
    method: 'delete'
  })
}
