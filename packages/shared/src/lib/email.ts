
import nodemailer from "nodemailer";

interface TransporterConfigOptions {
    host: string
    port: number
    secure: boolean
    auth: {
        user: string
        pass: string
    }
}

export const createTransporter = (config: TransporterConfigOptions) => {
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.auth.user,
            pass: config.auth.pass,
        },
    });
    
}