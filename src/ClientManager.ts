/**
 * Created by Z on 2017-04-14.
 */
import {Server} from './Server';
import * as SocketIO from 'socket.io';
export class ClientManager {

    server: Server;

    clients: Map<string,SocketIO.Socket> = new Map();

    constructor(server: Server) {
        this.server = server;
    }

    addClient(socket: SocketIO.Socket) {
        if (!this.clients.has(socket.id)) {
            this.clients.set(socket.id, socket);
        }

        socket.on('disconnect', () => {

        });
    }

    connect(){

    }

    disconnect(clientId: string) {
        if(this.clients.has(clientId)){

        }
    }


}