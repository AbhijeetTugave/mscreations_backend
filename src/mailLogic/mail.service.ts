import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from 'src/auth/otp-purpose.enum';

@Injectable()
export class MailService {
  private transporter;
  private fromEmail: string;
  private supportEmail: string;

  constructor(private configService: ConfigService) {

    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL') || 'support@mscreation.com';

    this.fromEmail = `"MS Creation Store (No-Reply)" <${user}>`;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  async sendOtp(email: string, otp: string, purpose: OtpPurpose) {
    try {
      const subjectMap = {
        [OtpPurpose.REGISTER]: 'Verify your MS Creation account',
        [OtpPurpose.FORGOT_PASSWORD]: 'Reset your MS Creation password',
        [OtpPurpose.COD]: 'Confirm your COD order',
      };

      await this.transporter.sendMail({
        from: this.fromEmail,
        replyTo: this.supportEmail,
        to: email,
        subject: subjectMap[purpose],
        html: this.otpTemplate(otp, purpose),
      });
    } catch (error) {
      console.error('MAIL ERROR:', error);
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  // 🔥 Premium No-Reply OTP Template
  private otpTemplate(otp: string, purpose: OtpPurpose): string {
    const purposeTextMap: Record<OtpPurpose, string> = {
      [OtpPurpose.REGISTER]: 'to verify your account',
      [OtpPurpose.FORGOT_PASSWORD]: 'to reset your password',
      [OtpPurpose.COD]: 'to confirm your Cash on Delivery order',
    };
    const text =
      purposeTextMap[purpose] ?? 'to complete your verification';
    return `
    <div style="background:#f4f6f8;padding:30px;font-family:"Poppins", sans-serif">
      <div style="max-width:520px;margin:auto;background:#fff;
        padding:30px;border-radius:12px;
        box-shadow:0 8px 24px rgba(0,0,0,.1)">

        <h2 style="text-align:center;margin:0;color:#111">
          MS Creation Store
        </h2>

        <p style="text-align:center;color:#6b7280;font-size:13px">
          Secure Email Verification
        </p>

        <hr style="margin:22px 0;border:none;border-top:1px solid #e5e7eb">

        <p>Hello 👋,</p>

       <p>
      Use the following One-Time Password (OTP) ${text}:
    </p>

        <div style="text-align:center;margin:28px 0">
          <div style="
            display:inline-block;
            padding:16px 26px;
            font-size:30px;
            font-weight:700;
            letter-spacing:8px;
            color:#1d4ed8;
            border:2px dashed #1d4ed8;
            border-radius:10px;
          ">
            ${otp}
          </div>
          <div style="margin-top:10px;font-size:12px;color:#6b7280">
            ⏱ Valid for 5 minutes
          </div>
        </div>

        <p style="font-size:13px;color:#6b7280">
          🔒 Never share this OTP with anyone.
        </p>

        <hr style="margin:22px 0;border:none;border-top:1px solid #e5e7eb">

        <p style="font-size:12px;color:#9ca3af;text-align:center">
          This is an automated message. Please do not reply to this email.
        </p>

        <p style="font-size:12px;color:#9ca3af;text-align:center">
          Need help? Contact us at
          <a href="mailto:${this.supportEmail}">
            ${this.supportEmail}
          </a>
        </p>

        <p style="font-size:12px;color:#9ca3af;text-align:center">
          © ${new Date().getFullYear()} MS Creation Store
        </p>
      </div>
    </div>
    `;
  }
}
