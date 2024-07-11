const { PeerServer } = require('peer');

const peerServer = PeerServer({
  port: 9000,
  path: '/peerjs',
});

console.log('PeerServer running on port 9000');
