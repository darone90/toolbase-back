interface Config {
    port: number;
    algorithm: string;
    iterations: number;
}

export const appSettings: Config = {
    port: 8080,
    algorithm: 'aes-192-cbc',
    iterations: 24,
}
