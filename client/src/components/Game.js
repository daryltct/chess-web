import React, { useEffect, useState } from "react";
import  Chess  from "chess.js";
import Chessboard from "chessboardjsx";

const Game = ({socket, roomData}) => {
    const [game, setGame] = useState(null)
    const [gameState, setGameState] = useState({
        fen: "start",
        history: [],
        turn: 'w',
        winner: null
    })

    useEffect(() => {
        setGame(new Chess())
    }, [])

    useEffect(() => {
        const moveHandler = (move) => {
            game.move(move)
            setGameState((prevState) => ({
                ...prevState,
                fen: game.fen(),
                history: game.history({verbose: true}),
                turn: game.turn()
            }))
        }

        const gameEndHandler = (data) => {
            game.move(data.move)
            setGameState((prevState) => ({
                ...prevState,
                fen: game.fen(),
                turn: 'z',
                winner: data.winner,
                reason: data.reason
            }))
        }

        if (socket && game) {
            socket.on('move', moveHandler)
            socket.on('gameEnd', gameEndHandler)

            return () => {
                socket.off('move', moveHandler)
                socket.off('gameEnd', gameEndHandler)
            }
        }
    }, [socket, game])

    const onDrop = ({ sourceSquare, targetSquare }) => {
        // check if the move is legal
        let move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q"
        });

        // if illegal move
        if (move === null) return;
        // else alter game state
        setGameState((prevState) => ({
            ...prevState,
            fen: game.fen(),
            history: game.history({ verbose: true }),
            turn: game.turn()
        }));
        // check winning conditions
        if (game.in_checkmate()) {
            socket.emit('gameEnd', {roomId: roomData.roomId, move:move, winner: roomData.color, reason: 'checkmate'})
            setGameState((prevState) => ({
                ...prevState,
                winner: roomData.color,
                reason: 'checkmate'
            }))
        } else if (game.in_stalemate()) {
            socket.emit('gameEnd', {roomId: roomData.roomId, move:move, winner: roomData.color, reason: 'stalemate'})
            setGameState((prevState) => ({
                ...prevState,
                winner: roomData.color,
                reason: 'stalemate'
            }))
        } else {
            socket.emit('move', {roomId: roomData.roomId, move: move})
        }
        
      };

    return (
        <div>
            <Chessboard 
                position={gameState.fen} 
                onDrop={onDrop} 
                orientation={roomData.color} 
                draggable={gameState.turn == roomData.color.charAt(0)}
            />
            {gameState.winner && <h1>{`${gameState.winner} won by ${gameState.reason}`}</h1>}
        </div>
    )
}

export default Game
