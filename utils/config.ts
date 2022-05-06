interface Config {
    port: number;
    algorithm: string;
    iterations: number;
    token: string;
}

export const appSettings: Config = {
    port: 8080,
    algorithm: 'aes-192-cbc',
    iterations: 24,
    token: '@1324fsrllokiuystf123'
}
