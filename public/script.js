const socket = io('/');

const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

var myModal = new bootstrap.Modal(document.getElementById('myModal'), { backdrop: false });
myModal.toggle();
let text2 = $('#name_input');

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

console.log("Started Code");
let myVideoStream;

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    console.log("Added VideoStream");

    peer.on('call', call => {
        console.log('Accepted call');
        call.answer(stream); // Answer the call with an A/V stream.

        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            // Show stream in some video/canvas element.
            console.log("added video stream to canvas");
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        console.log("connecting to new user");
        connectToNewUser(userId, stream);
    });

    let text = $('#chat_message');


    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            let message = { user: text2.val(), content: text.val() };
            socket.emit('message', message);
            text.val('');
        }
    });

    socket.on('createMessage', message => {
        console.log(message);
        $('.messages').append(`<li class="message"><b>${message.user}</b><br>${message.content}</li>`)
        scrollToBottom();
    });
}).catch(err => {
    alert("Audio or Video not available");
});


peer.on('open', id => {
    console.log("Accept and join room with", ROOM_ID, id);
    socket.emit('join-room', ROOM_ID, id);
});

const connectToNewUser = (userId, stream) => {
    console.log(userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
        console.log('Added video stream')
    });
}

const addVideoStream = (video, stream) => {
    console.log("Assignning stream to video and playing it");
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom = () => {
    let d = $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}