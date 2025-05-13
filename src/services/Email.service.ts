import nodeMailer, { TransportOptions } from "nodemailer";
import { InternalServerError } from "routing-controllers";

export class EmailService {
    private readonly transporter: nodeMailer.Transporter;

    constructor() {
        const transportOptions: { port: number; auth: { pass: any; user: any }; host: any; secure: boolean } = {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD
            }
        };

        this.transporter = nodeMailer.createTransport(transportOptions);
    }

    async sendEmail(mailOptions: any): Promise<boolean> {
        try {
            const sentEmailInfo = await this.transporter.sendMail(mailOptions);

            if (sentEmailInfo?.rejected.length === 0 && sentEmailInfo?.accepted.length > 0) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error sending email:', error);
            throw new InternalServerError("Failed to send email!");
        }
    }
}
