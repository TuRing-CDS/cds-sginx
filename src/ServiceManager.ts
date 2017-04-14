/**
 * Created by Z on 2017-04-14.
 */
import * as SocketIO from 'socket.io';
import * as debug from 'debug';
import { Server } from './Server';
const info = debug('engine-s:info');
const error = debug('engine-s:error');

export class ServiceManager {

    services: Map<string,SocketIO.Socket> = new Map();

    serviceClientMap: Map<string,string[]> = new Map();

    server:Server;

    constructor(server:Server){
        this.server = server;
    }

    /**
     * 添加服务
     * @param serviceName
     * @param socket
     * @param cb
     * @returns {any}
     */
    addService(serviceName: string, socket: SocketIO.Socket, cb: Function) {
        if (this.services.has(serviceName)) {
            return cb(`service: [ ${serviceName} ] is already exists!`);
        } else {
            this.services.set(serviceName, socket);
        }
        socket.on('disconnect', () => {
            if (this.services.has(serviceName)) {
                this.services.delete(serviceName);
            }
            if(this.serviceClientMap.has(serviceName)){
                this.serviceClientMap.get(serviceName).forEach((item:string)=>{
                    this.server.clientManager.disconnect(item);
                });
            }
        });
        return cb();
    }

    /**
     * 连接某个service
     * @param serviceName
     * @param clientId
     * @param params
     */
    connect(serviceName: string, clientId: string, ...params: any[]) {
        let inputCb = typeof params[params.length - 1] === 'function' ? params[params.length - 1] : null;
        let cb = (err: any, value?: any) => {
            if (!err) {
                if (!this.serviceClientMap.has(serviceName)) {
                    this.serviceClientMap.set(serviceName, []);
                }
                this.serviceClientMap.get(serviceName).push(clientId);
            }
            inputCb(err, value)
        }
        if (inputCb) {
            params[params.length - 1] = cb;
        }
        this.emit(serviceName, 'client-connect', clientId, params);
    }

    /**
     * 远程调用
     * @param serviceName
     * @param clientId
     * @param params
     */
    invoke(serviceName: string, clientId: string, ...params: any[]) {
        this.emit(serviceName, 'client-invoke', clientId, params);
    }

    /**
     * 发送命令
     * @param serviceName
     * @param event
     * @param clientId
     * @param params
     */
    emit(serviceName: string, event: string, clientId: string, ...params: any[]) {
        let cb = (err: any, value?: any) => {
            if (err) error(err);
            if (value) info(value);
        };
        if (typeof params[params.length - 1] !== 'function') {
            params.push(cb);
        }
        if (this.services.has(serviceName)) {
            let socket: SocketIO.Socket = this.services.get(serviceName);
            socket.emit.call(socket, [event, clientId].concat(params));
        } else {
            cb(`service: [ ${serviceName} ] not found!`);
        }
    }
}