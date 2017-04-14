/**
 * Created by Z on 2017-04-13.
 */
import * as SocketIO from 'socket.io';

import {Service} from './Service';

import {ServiceManager} from './ServiceManager';
import {ClientManager} from './ClientManager';

export class Server {

    /**
     * 端口号
     */
    private port: number;
    /**
     * Socket.IO Server
     */
    io: SocketIO.Server;

    serviceManager: ServiceManager = null;

    clientManager: ClientManager = null;

    /**
     * 构造方法
     */
    constructor() {
        this.io = SocketIO();
        this.serviceManager = new ServiceManager(this);
        this.clientManager = new ClientManager(this);
    }

    /**
     * 监听端口号
     * @param port
     */
    listen(port: number = 9027) {
        this.port = port;
        this.io.listen(port);
        this.io.on('connect', (socket: SocketIO.Socket) => {
            socket.on('service-regist', (serviceName: string, cb: Function) => {
                this.serviceManager.addService(serviceName, socket, cb);
            });

        });
    }
}