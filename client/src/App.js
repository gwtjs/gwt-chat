import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import io from 'socket.io-client'
let urls = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302',
  'stun:stun01.sipphone.com',
  'stun:stun.ekiga.net',
  'stun:stun.fwdnet.net',
  'stun:stun.ideasip.com',
  'stun:stun.iptel.org',
  'stun:stun.rixtelecom.se',
  'stun:stun.schlund.de',
  'stun:stunserver.org',
  'stun:stun.softjoys.com',
  'stun:stun.voiparound.com',
  'stun:stun.voipbuster.com',
  'stun:stun.voipstunt.com',
  'stun:stun.voxgratia.org',
  'stun:stun.xten.com'
]
const socket = io('http://localhost:4000')
let pc = new RTCPeerConnection()
let user, target
function App() {
  const [boxType, setBoxType] = useState('text')
  const [message, setMessage] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [calling, setCalling] = useState(false)
  const videoRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    let name = localStorage.getItem('name')
    if (!name || name !== '001') {
      socket.emit('login', '001')
      localStorage.setItem('name', '001')
      user = '001'
      target = '002'
    } else {
      socket.emit('login', '002')
      localStorage.setItem('name', '002')
      user = '002'
      target = '001'
    }

    pc.onnegotiationneeded = () => {
      console.log('onnegotiationneeded')
      pc.createOffer()
        .then(function(offer) {
          return pc.setLocalDescription(offer)
        })
        .then(function() {
          socket.emit('ice-sign', {
            name: user,
            target,
            type: 'video-offer',
            sdp: pc.localDescription
          })
        })
    }
    pc.onicecandidate = e => {
      console.log('onicecandidate', e.candidate)
      socket.emit('ice-candidate', {
        type: 'new-ice-candidate',
        target,
        candidate: e.candidate
      })
    }
    pc.onaddstream = e => {
      console.log('onaddstream')
      audioRef.current.srcObject = e.stream
    }
  }, [])
  useEffect(() => {
    socket.on('ice-sign', data => {
      console.log('ice-sign')
      if (data.type === 'offer' && data.target === user) {
        setBoxType('audio')
        !calling && setCalling(true)
      }
      if (speaking) {
        data.target === user && setCalling(true)
        pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
          .then(() => {
            return navigator.mediaDevices.getUserMedia({
              video: false,
              audio: true
            })
          })
          .then(stream => {
            stream.getTracks().forEach(track => pc.addTrack(track, stream))
            // pc.addStream(stream)
            pc.createAnswer()
              .then(function(answer) {
                return pc.setLocalDescription(answer)
              })
              .then(function() {
                console.log(pc.localDescription)
                socket.emit('ice-sign', {
                  name: data.target,
                  target: data.name,
                  type: 'video-answer',
                  sdp: pc.localDescription
                })
              })
          })
      }
    })
    socket.on('ice-candidate', data => {
      console.log('ice-candidate', data.candidate)
      try {
        if (pc && pc.remoteDescription) {
          data.candidate && pc.addIceCandidate(new RTCIceCandidate(data.candidate))
        }
      } catch (e) {
        console.log(e)
      }
    })
  }, [calling, speaking])

  useEffect(() => {
    boxType === 'video' &&
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'user' },
          audio: true
        })
        .then(stream => {
          videoRef.current.srcObject = stream
        })
        .catch(err => console.log(err.name))
    // boxType === 'audio' &&
  }, [boxType])

  const callAudio = () => {
    console.log('call')
    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: true
      })
      .then(stream => {
        console.log(stream)
        pc.addStream(stream)
      })

      .catch(err => console.log(err.name, err))
  }

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
                setSpeaking(true)
                callAudio()
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
      {boxType === 'audio' && (
        <div className="box audio-box">
          <audio ref={audioRef} style={{ width: '100%', height: '100%' }} autoPlay></audio>
          <div className="controls">
            {speaking && <div className="time">00:05</div>}
            {calling && (
              <div
                className="speak"
                onClick={() => {
                  setSpeaking(true)
                  setCalling(false)
                }}
              >
                接通
              </div>
            )}
            <div
              className="cut"
              onClick={() => {
                setSpeaking(false)
                setCalling(false)
                setBoxType('text')
              }}
            >
              挂断
            </div>
          </div>
        </div>
      )}
      {boxType === 'video' && (
        <div className="box video-box">
          <video ref={videoRef} style={{ width: '100%', height: '100%' }} autoPlay></video>
        </div>
      )}
    </div>
  )
}

export default App
