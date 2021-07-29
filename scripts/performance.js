const WebSocket = require('ws');

const url = 'ws://localhost:8888/';
const channels = [];
const channelsNum = 100;
const token = ''; // get from your local storage
const sessionId = ''; // get from window.taiga.sessionId
const confirmedOpen = [];
const confirmedClose = [];

function openChannel() {
  const ws = new WebSocket(url)

  // ws.on('message', () => {
  //   console.log('message');
  // });

  ws.on('open', () => {
    // console.log('open');
    confirmedOpen.push(ws);

    ws.send(JSON.stringify({
      cmd: 'auth',
      data: {
        token,
        sessionId,
      }
    }));

    setTimeout(() => {
      ws.send(JSON.stringify({
        'cmd': 'subscribe',
        'routing_key': 'changes.project.3.userstories'
      }));
    }, 1000);
  });

  ws.on('error', () => {
    console.log('error');
  });

  ws.on('close', () => {
    confirmedClose.push(ws);
  });

  channels.push(ws);
}

function openChannels() {
  console.log('openChannels');

  for(let i = 0; i < channelsNum; i++) {
    openChannel();
  }
}

function closeChannels() {
  console.log('closeChannels');

  for(let channel of channels) {
    channel.close();
  }
}

openChannels();

setTimeout(() => {
  closeChannels();

  setTimeout(() => {
    console.log('confirmedOpen', confirmedOpen.length);
    console.log('confirmedClose', confirmedClose.length);
  }, 20000)
}, 20000)
