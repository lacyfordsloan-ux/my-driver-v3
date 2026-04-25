import { Server } from 'socket.io';
import { createServer } from 'http';

const server = createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_chat', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`Socket ${socket.id} joined room ride_${rideId}`);
  });

  socket.on('send_message', (data) => {
    // data: { rideId, text, senderId }
    io.to(`ride_${data.rideId}`).emit('new_message', {
      text: data.text,
      senderId: data.senderId,
      createdAt: new Date().toISOString(),
    });
    console.log(`Message in ride_${data.rideId}: ${data.text}`);
  });

  socket.on('driver_offer', (data) => {
    // data: { rideId, driverId, price, driverInfo }
    io.to(`ride_${data.rideId}`).emit('new_offer', data);
    console.log(`Offer for ride_${data.rideId} from ${data.driverId}: ${data.price} ₽`);
  });

  socket.on('offer_declined', (data) => {
    io.to(`ride_${data.rideId}`).emit('offer_declined', data);
    console.log(`Offer declined for ride_${data.rideId}`);
  });

  socket.on('ride_started', (data) => {
    // data: { rideId }
    io.to(`ride_${data.rideId}`).emit('ride_started', data);
    console.log(`Ride started: ${data.rideId}`);
  });

  socket.on('ride_finished', (data) => {
    // data: { rideId }
    io.to(`ride_${data.rideId}`).emit('ride_finished', data);
    console.log(`Ride finished: ${data.rideId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`);
});
