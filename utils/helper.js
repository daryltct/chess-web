const closeRoom = (roomId, roomsArr) => {
	const idx = roomsArr.findIndex((room) => room.roomId == roomId)
	roomsArr.splice(idx, 1)
}

module.exports = { closeRoom }
