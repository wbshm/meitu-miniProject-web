import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/hotkey',
    method: 'get',
    params: query
  })
}

export function createHotkey(data) {
  data.startTime = data.startTime.getTime()
  data.endTime = data.endTime.getTime()
  return request({
    url: '/admin/hotkey',
    method: 'post',
    headers:
    {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(data)
  })
}

export function updateHotkey(data) {
  return request({
    url: '/admin/hotkey/' + data.id,
    headers:
    {
      'Content-Type': 'application/json'
    },
    method: 'post',
    data: JSON.stringify(data)
  })
}

export function deleteHotkey(id) {
  return request({
    url: '/admin/hotkey/' + id,
    method: 'delete'
  })
}
