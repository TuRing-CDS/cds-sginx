/**
 * Created by Z on 2017-04-13.
 */

import {Service} from './Service';

/**
 * Client
 */
export class Client {

    clientId: string;

    service: Service;

    constructor(clientId: string, service: Service) {
        this.clientId = clientId;
        this.service = service;
    }

    /**
     * 发送
     * @param event
     * @param params
     */
    emit(event: string, ...params: any[]) {
        this.service.socket.emit.call(this.service.socket, ['invoke-result-emit', this.clientId, event].concat(params));
    }

    /**
     * 发送
     * @param params
     */
    send(...params: any[]) {
        this.service.socket.send.call(this.service.socket, ['invoke-result-send', this.clientId].concat(params));
    }

}