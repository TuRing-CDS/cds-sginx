/**
 * Created by Z on 2017-04-14.
 */
import * as SocketIOClient from 'socket.io-client';
import {EventEmitter} from 'events';
import {Client} from './Client';
import * as debug from 'debug';
const info = debug('engine-s:info');
const error = debug('engine-s:error');

export class Service extends EventEmitter {

    /**
     * Socket Client
     */
    socket: SocketIOClient.Socket;

    /**
     * Clients
     */
    private clients: Client[];

    /**
     * ServiceName
     */
    private serviceName: string;

    /**
     * Connect uri
     */
    private uri: string;

    private authFn: Function = (token: string, next: Function) => {
        next()
    };

    /**
     * Constructor
     * @param serviceName
     * @param uri
     */
    constructor(serviceName: string, uri: string) {
        super();
        this.serviceName = serviceName;
        this.uri = uri;
        this.socket = SocketIOClient.connect(uri);
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('client-invoke', this.onClientInvoke.bind(this));
        this.socket.on('client-connect', this.onClientConnect.bind(this));
        this.socket.on('client-disconnect', this.onClientDisconnect.bind(this));
        /**
         * 授权模块
         */
        this.on('auth', (client: Client, token: string) => {
            this.authFn(token, (err: any) => {
                if (err) {
                    client.emit('auth', err);
                } else {
                    client.emit('auth');
                }
            });
        })
    }

    /**
     * 连接成功
     */
    private onConnect() {
        this.socket.emit('service-regist', this.serviceName, (err: string) => {
            if (err) {
                error(`service:[${this.serviceName}] regist fail`);
                throw err;
            } else {
                info(`service:[${this.serviceName}] regist success`);
            }
        });
    }

    /**
     * 客户端Invoke
     * @param event
     * @param params
     */
    private onClientInvoke(event: string, clientId: string, ...params: any[]) {
        info(`begin invoke :: ${event} : ${clientId} : ${params}`);
        let cb = (error: string, value?: any) => {
            if (error) return new Client(clientId, this).emit('invoke-error', error, value);
            new Client(clientId, this).emit('invoke-result', event, value);
        };
        if (typeof params[params.length - 1] === 'function') {
            cb = params[params.length - 1];
        } else {
            params.push(cb);
        }
        let index = this.clients.map(x => x.clientId).indexOf(clientId);
        if (-1 == index) {
            return cb(`401`);
        }
        info(`invoking :: ${event} : ${clientId} -> ${this.clients[index].service.socket.id } : ${JSON.stringify(params)}`)
        this.emit.call(this, [event, this.clients[index]].concat(params));
    }

    /**
     * 客户端连接
     * @param clientId
     */
    private onClientConnect(clientId: string) {
        info(`client connect: ${clientId}`);
        if (-1 == this.clients.map(x => x.clientId).indexOf(clientId)) {
            this.clients.push(new Client(clientId, this));
        }
    }

    /**
     * 断开连接
     * @param clientId
     */
    private onClientDisconnect(clientId: string) {
        info(`client disconnect: ${clientId}`);
        const index = this.clients.map(x => x.clientId).indexOf(clientId);
        if (-1 != index) {
            this.clients.splice(index, 1);
        }
    }

    /**
     * 对外暴露的授权方法
     * @param fn
     */
    public onAuth(fn: Function) {
        this.authFn = fn;
    }

}