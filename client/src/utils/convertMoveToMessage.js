const pieces = {
	p: 'pawn',
	n: 'knight',
	b: 'bishop',
	r: 'rook',
	q: 'queen',
	k: 'king'
}

const colors = {
	w: 'white',
	b: 'black'
}

const convertMoveToMessage = (move) => {
	const color = colors[move.color]
	const oppColor = move.color === 'w' ? 'black' : 'white'
	const piece = pieces[move.piece]

	switch (move.flags) {
		// normal moves
		case 'n':
		case 'b':
			return `${color} ${piece} from ${move.from} to ${move.to}`.toUpperCase()
		// capture moves
		case 'c':
		case 'e':
			return `${color} ${piece} from ${move.from} to ${move.to}, capturing ${oppColor} ${pieces[
				move.captured
			]}`.toUpperCase()
		// queen side castling
		case 'q':
			return `${color} performed a queen side castling, from ${move.from} to ${move.to}`.toUpperCase()
		// king side castling
		case 'k':
			return `${color} performed a king side castling, from ${move.from} to ${move.to}`.toUpperCase()
		// promotion
		case 'np':
			return `${color} ${piece} from ${move.from} to ${move.to}, promoting to a queen`.toUpperCase()
		default:
			return 'UNKNOWN MOVE'
	}
}

export default convertMoveToMessage
