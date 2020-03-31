import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import io from 'socket.io-client'

const socket = io()

function App() {
  const [boxType, setBoxType] = useState('text')
  const [message, setMessage] = useState('')
  const videoRef = useRef(null)

  useEffect(() => {
    socket.on('message', e => {
      console.log(e)
      console.log(socket.id)
    })
  }, [])

  useEffect(() => {
    boxType === 'video' &&
      navigator.mediaDevices
        .getUserMedia({
          // video: { facingMode: 'user' },
          video: false,
          audio: true
        })
        .then(stream => {
          console.log(stream.getTracks())

          let recorder = new MediaRecorder(stream)
          recorder.start()
          console.log(recorder)

          recorder.onstart = e => {
            console.log('start')
          }

          recorder.onstop = e => {
            console.log('stop')
          }
          recorder.ondataavailable = event => {
            console.log(event)
            let blob = new Blob([event.data], {
              type: 'video/mp4'
            })
            console.log(blob)
          }
          videoRef.current.srcObject = stream
        })
        .catch(err => console.log(err.name))
  }, [boxType])

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
              视频
            </button>
          </footer>
        </div>
      )}
      {boxType === 'audio' && <div className="box audio-box"></div>}
      {boxType === 'video' && (
        <div className="box video-box">
          <audio ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay></audio>
        </div>
      )}
    </div>
  )
}

export default App
