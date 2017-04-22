/**
 * Created by Z on 2017-04-22.
 */

import * as SocketIO from 'socket.io';

/**
 * 服务端
 */
export class Sginx {
    io: SocketIO.Server = SocketIO();
    port: number;
    clients: Map<string,SocketIO.Socket> = new Map();
    clientServicesMap: Map<string,string[]> = new Map();
    services: Map<string,SocketIO.Socket> = new Map();

    constructor() {
        /**
         * 连接成功
         */
        this.io.on('connect', (socket: SocketIO.Socket) => {
            this.clients.set(socket.id, socket);
            /**
             * 断开连接
             */
            socket.on('disconnect', () => {
                /**
                 * 从客户端列表中移除
                 */
                this.clients.has(socket.id) && this.clients.delete(socket.id);
                /**
                 * 是否为service端
                 */
                if (this.clientServicesMap.has(socket.id)) {
                    /**
                     * 移除service端连接的客户端
                     */
                    this.clientServicesMap.get(socket.id).forEach((client: string) => {
                        this.clients.has(client) && this.clients.get(client).emit('service-close');
                    });
                    let item: any[] = null;
                    let entries = this.services.entries();
                    while (!!(item = entries.next().value)) {
                        if (item[1] === socket) {
                            this.services.delete(item[0]);
                            break;
                        }
                    }
                }

                /**
                 * 是否为已经连上 service 的客户端
                 * @type {IterableIterator<string[]>}
                 */
                let values = this.clientServicesMap.values();
                let cs: string[] = null;
                while (!!(cs = values.next().value)) {
                    if (!cs.length)break;
                    if (-1 !== cs[1].indexOf(socket.id)) {
                        this.clients.has(cs[0]) && this.clients.get(cs[0]).emit('client-disconnect', socket.id);
                    }
                }
            });
            /**
             * 注册服务
             */
            socket.on('regist-service', (serviceName: string) => {
                this.clientServicesMap.set(socket.id, []);
                this.services.set(serviceName, socket);
            });
            /**
             * 连接 service
             */
            socket.on('connect-service', (serviceName: string, cb: Function) => {
                if (this.services.has(serviceName)) {
                    this.services.get(serviceName).emit('client-connect', socket.id, cb);
                } else {
                    cb(`service : [ ${serviceName} ] not found!`);
                }
            });
            /**
             * 远程调用
             */
            socket.on('invoke-service', (serviceName: string, ...args: any[]) => {
                let cb = args[args.length - 1];
                if (this.services.has(serviceName)) {
                    let service = this.services.get(serviceName);
                    console.log(['invoke'].concat(args))
                    // service.emit.call(service, ['invoke'].concat(args));
                    service.emit('invoke', socket.id, ...args);
                } else {
                    cb(`service : [ ${serviceName} ] not found!`);
                }
            });

            /**
             * 远程回馈
             */
            socket.on('invoke-result', (clientId: string, ...args: any[]) => {
                if (this.clients.has(clientId)) {
                    let client = this.clients.get(clientId);
                    let event = args.shift();
                    console.log(event, ...args);
                    client.emit(event, ...args);
                }
            });
        });
    }

    /**
     * 监听
     * @param port
     */
    listen(port: number) {
        this.port = port;
        this.io.listen(this.port);
    }
}