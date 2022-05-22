import { appConfig } from '../config.data';

interface Config {
    port: number;
    algorithm: string;
    iterations: number;
    token: string;
}

export const appSettings: Config = {
    port: appConfig.port,
    algorithm: appConfig.algorithm,
    iterations: appConfig.iterations,
    token: appConfig.token
}
