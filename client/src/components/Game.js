import React, { useEffect, useState } from "react";
import  Chess  from "chess.js";
import Chessboard from "chessboardjsx";

const Game = ({socket, roomData}) => {
    const [game, setGame] = useState(null)
    const [gameState, setGameState] = useState({
        fen: "start",
        history: [],
        turn: 'w'
    })

    useEffect(() => {
        setGame(new Chess())
    }, [])

    useEffect(() => {
        if(socket && game){
            socket.on(roomData.roomId, (move) => {
                game.move(move)
                setGameState((prevState) => ({
                    ...prevState,
                    fen: game.fen(),
                    history: game.history({verbose: true}),
                    turn: game.turn()
                }))
            })
        }
    })

    const isPlayerTurn = () => {
        return game.turn() == roomData.color.chartAt(0)
    }

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
        socket.emit('move', {roomId: roomData.roomId, move: move})
      };

    return (
        <div>
            <Chessboard 
                position={gameState.fen} 
                onDrop={onDrop} 
                orientation={roomData.color} 
                draggable={gameState.turn == roomData.color.charAt(0)}
            />
        </div>
    )
}

export default Game
