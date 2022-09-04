import {appConfig} from '../config.data';

export const checkToken = (token:string):boolean => {
    if(token === appConfig.token) {
        return true;
    } else {
        return false;
    }
};