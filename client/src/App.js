import React, { useState, useEffect } from 'react'
import './App.css'
import io from 'socket.io-client'

const socket = io()

function App() {
  const [boxType, setBoxType] = useState('text')
  const [message, setMessage] = useState('')

  useEffect(() => {
    socket.on('message', e => {
      console.log(e)
      console.log(socket.id)
    })
  }, [])

  return (
    <div className="App">
      {boxType === 'text' && (
        <div className="box text-box">
          <div className="msg-info"></div>
          <div className="msg-content"></div>
          <footer>
            <input
              value={message}
              onChange={e => {
                setMessage(e.target.value)
              }}
            />
            <button
              onClick={() => {
                socket.emit('message', message)
              }}
            >
              发送
            </button>
            <button
              onClick={() => {
                setBoxType('audio')
              }}
            >
              语音
            </button>
            <button
              onClick={() => {
                setBoxType('video')
              }}
            >
              语音
            </button>
          </footer>
        </div>
      )}
      {boxType === 'video' && <div className="box video-box"></div>}
      {boxType === 'audio' && <div className="box audio-box"></div>}
    </div>
  )
}

export default App
