/**
 * Created by Z on 2017-04-22.
 */

import * as SocketIOClient from 'socket.io-client';
import {EventEmitter} from 'events';

export class Service extends EventEmitter {
    uri: string;
    serviceName: string;
    client: SocketIOClient.Socket;
    clients: Set<string> = new Set();

    constructor(uri: string, serviceName: string) {
        super();
        this.uri = uri;
        this.serviceName = serviceName;
        this.client = SocketIOClient.connect(this.uri);
        let self = this;
        this.client.on('connect', () => {
            console.log('connect');
            this.client.emit('regist-service', this.serviceName);
        });
        this.client.on('invoke', (clientId: string, event: string, ...args: any[]) => {
            self.emit(event, this.createClient(clientId), ...args);
        });
        this.client.on('client-disconnect', (clientId: string) => {
            this.clients.delete(clientId);
        });
        this.client.on('client-connect', (clientId: string) => {
            this.clients.add(clientId);
        });
    }

    createClient(clientId: string) {
        let self = this;
        return {
            emit(...args: any[]){
                // self.client.emit.call(self.client, ['invoker-result', clientId].concat(args));
                let event = args.shift();
                console.log('invoke-result', event, ...args);
                self.client.emit('invoke-result', clientId, event, ...args);
            }
        }
    }
}