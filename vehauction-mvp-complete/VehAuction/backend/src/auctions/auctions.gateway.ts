import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionService } from './auctions.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class AuctionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private auctionRooms = new Map<string, Set<string>>();

  constructor(private auctionService: AuctionService) {}

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Client disconnected: ${client.id}`);
    
    // Remove client from all auction rooms
    for (const [auctionId, clients] of this.auctionRooms.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.auctionRooms.delete(auctionId);
      }
    }
  }

  @SubscribeMessage('join_auction')
  async handleJoinAuction(client: Socket, payload: { auctionId: string }) {
    const { auctionId } = payload;

    // Add client to auction room
    if (!this.auctionRooms.has(auctionId)) {
      this.auctionRooms.set(auctionId, new Set());
    }
    this.auctionRooms.get(auctionId).add(client.id);

    // Join socket.io room
    client.join(`auction_${auctionId}`);

    // Send current auction state
    try {
      const auction = await this.auctionService.getAuction(auctionId);
      const bids = await this.auctionService.getBids(auctionId);

      client.emit('auction_state', {
        auction,
        bids: bids.slice(0, 10), // Send last 10 bids
        roomSize: this.auctionRooms.get(auctionId).size,
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to load auction' });
    }
  }

  @SubscribeMessage('leave_auction')
  handleLeaveAuction(client: Socket, payload: { auctionId: string }) {
    const { auctionId } = payload;
    client.leave(`auction_${auctionId}`);

    if (this.auctionRooms.has(auctionId)) {
      this.auctionRooms.get(auctionId).delete(client.id);
      if (this.auctionRooms.get(auctionId).size === 0) {
        this.auctionRooms.delete(auctionId);
      }
    }
  }

  @SubscribeMessage('place_bid')
  async handlePlaceBid(
    client: Socket,
    payload: {
      auctionId: string;
      bidderId: string;
      amount: number;
    },
  ) {
    try {
      const { auctionId, bidderId, amount } = payload;
      const amountBigInt = BigInt(amount);

      const bid = await this.auctionService.validateAndPlaceBid(
        auctionId,
        bidderId,
        amountBigInt,
      );

      // Broadcast bid to all users watching this auction
      this.server.to(`auction_${auctionId}`).emit('new_bid', {
        bidId: bid.id,
        bidderId: bid.bidderId,
        amount: bid.amount.toString(),
        timestamp: bid.createdAt,
        status: 'ACTIVE',
      });

      client.emit('bid_success', {
        bidId: bid.id,
        message: 'Bid placed successfully',
      });
    } catch (error) {
      client.emit('bid_error', {
        message: error.message || 'Failed to place bid',
      });
    }
  }

  @SubscribeMessage('get_auction_updates')
  async handleGetUpdates(
    client: Socket,
    payload: { auctionId: string },
  ) {
    try {
      const { auctionId } = payload;
      const bids = await this.auctionService.getBids(auctionId);

      client.emit('auction_updates', {
        bids: bids.slice(0, 20),
        timestamp: new Date(),
      });
    } catch (error) {
      client.emit('error', { message: 'Failed to get updates' });
    }
  }

  // Method to broadcast auction ended event
  broadcastAuctionEnded(auctionId: string, winnerId: string, winningBid: string) {
    this.server.to(`auction_${auctionId}`).emit('auction_ended', {
      auctionId,
      winnerId,
      winningBid,
      timestamp: new Date(),
    });
  }

  // Method to broadcast auction cancelled
  broadcastAuctionCancelled(auctionId: string) {
    this.server.to(`auction_${auctionId}`).emit('auction_cancelled', {
      auctionId,
      timestamp: new Date(),
    });
  }
}
