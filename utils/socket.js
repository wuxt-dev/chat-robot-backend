const users = []

exports.joinRoom = (id, username, room) => {
  const user = { id, username, room }
  users.push({ ...user })
  return user
}

exports.leaveRoom = id => {
  const userIndex = users.findIndex(user => user.id === id)
  if (userIndex !== -1) return users.splice(userIndex, 1)
}

exports.getCurrentUserByName = username => {
  return users.find(user => user.username === username)
}

exports.getCurrentUserById = id => {
  return users.find(user => user.id === id)
}
