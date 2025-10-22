import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    this.socket = io(serverUrl);
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  joinPoll(pollId) {
    if (this.socket) {
      this.socket.emit('joinPoll', pollId);
    }
  }

  leavePoll(pollId) {
    if (this.socket) {
      this.socket.emit('leavePoll', pollId);
    }
  }

  onVoteUpdate(callback) {
    if (this.socket) {
      this.socket.on('voteUpdate', callback);
    }
  }

  onPollUpdate(callback) {
    if (this.socket) {
      this.socket.on('pollUpdate', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();