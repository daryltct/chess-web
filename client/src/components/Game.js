import React, { useEffect, useState } from "react";
import  Chess  from "chess.js";
import Chessboard from "chessboardjsx";

const Game = ({socket}) => {
    const [game, setGame] = useState(null)
    const [gameState, setGameState] = useState({
        fen: "start",
        history: []
    })

    useEffect(() => {
        setGame(new Chess())
    }, [])

    useEffect(() => {
        if(socket){
            socket.on('move', (move) => {
                game.move(move)
                setGameState((prevState) => ({
                    ...prevState,
                    fen: game.fen(),
                    history: game.history({verbose: true})
                }))
            })
        }
    })

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
            history: game.history({ verbose: true })
          }));
        socket.emit('move', move)
      };

    return (
        <div>
            <Chessboard position={gameState.fen} onDrop={onDrop}/>
        </div>
    )
}

export default Game
