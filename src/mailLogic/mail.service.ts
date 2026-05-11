import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { OtpPurpose } from "src/auth/otp-purpose.enum";

@Injectable()
export class MailService {
  private resend: Resend;

  private supportEmail: string;

  constructor(private configService: ConfigService) {
    this.supportEmail =
      this.configService.get<string>("SUPPORT_EMAIL") ||
      "mscreation3010@gmail.com";

    this.resend = new Resend(this.configService.get<string>("EMAIL_PASS"));
  }

  async sendOtp(email: string, otp: string, purpose: OtpPurpose) {
    const subjectMap = {
      [OtpPurpose.REGISTER]: "Verify your MS Creations account",

      [OtpPurpose.FORGOT_PASSWORD]: "Reset your MS Creations password",

      [OtpPurpose.COD]: "Confirm your COD order",
    };

    try {
      await this.resend.emails.send({
        from: "onboarding@resend.dev",

        to: email,

        subject: `${subjectMap[purpose]} (OTP: ${otp})`,

        html: this.otpTemplate(otp, purpose),
      });

      console.log("✅ OTP email sent successfully");
    } catch (error: any) {
      console.log("RESEND ERROR:", JSON.stringify(error, null, 2));

      throw new InternalServerErrorException(
        error?.message || "Failed to send OTP",
      );
    }
  }

  private otpTemplate(otp: string, purpose: OtpPurpose): string {
    const purposeTextMap: Record<OtpPurpose, string> = {
      [OtpPurpose.REGISTER]: "to verify your account",

      [OtpPurpose.FORGOT_PASSWORD]: "to reset your password",

      [OtpPurpose.COD]: "to confirm your Cash on Delivery order",
    };

    const titleMap: Record<OtpPurpose, string> = {
      [OtpPurpose.REGISTER]: "Account Verification",

      [OtpPurpose.FORGOT_PASSWORD]: "Password Reset Request",

      [OtpPurpose.COD]: "COD Order Confirmation",
    };

    const text = purposeTextMap[purpose] || "to complete your verification";

    const title = titleMap[purpose] || "OTP Verification";

    return `
  <div style="
    margin:0;
    padding:40px 20px;
    background:#f4f4f5;
    font-family:Arial,Helvetica,sans-serif;
  ">

    <div style="
      max-width:560px;
      margin:auto;
      background:#ffffff;
      border-radius:18px;
      overflow:hidden;
      box-shadow:0 10px 30px rgba(0,0,0,0.08);
    ">

      <div style="
        background:linear-gradient(135deg,#7f1d1d,#991b1b);
        padding:35px 30px;
        text-align:center;
      ">

        <h1 style="
          margin:0;
          color:#ffffff;
          font-size:32px;
          font-weight:700;
          letter-spacing:.5px;
        ">
          MS Creations
        </h1>

        <p style="
          margin-top:10px;
          color:rgba(255,255,255,0.85);
          font-size:14px;
        ">
          Premium Fashion Store
        </p>

      </div>

      <div style="padding:40px 35px;">

        <div style="
          display:inline-block;
          background:#fef2f2;
          color:#991b1b;
          padding:8px 16px;
          border-radius:999px;
          font-size:12px;
          font-weight:700;
          letter-spacing:.5px;
          margin-bottom:18px;
        ">
          SECURE OTP VERIFICATION
        </div>

        <h2 style="
          margin:0 0 18px;
          color:#111827;
          font-size:28px;
          line-height:1.3;
        ">
          ${title}
        </h2>

        <p style="
          margin:0;
          color:#4b5563;
          font-size:15px;
          line-height:1.8;
        ">
          Hello 👋,
        </p>

        <p style="
          color:#4b5563;
          font-size:15px;
          line-height:1.8;
          margin-top:14px;
        ">
          Use the following One-Time Password (OTP) ${text}.
          This OTP is valid for only <strong>1 minute</strong>.
        </p>

        <div style="
          margin:38px 0;
          text-align:center;
        ">

          <div style="
            display:inline-block;
            background:linear-gradient(135deg,#7f1d1d,#991b1b);
            padding:20px 34px;
            border-radius:18px;
            box-shadow:0 10px 25px rgba(127,29,29,.25);
          ">

            <div style="
              color:#ffffff;
              font-size:38px;
              font-weight:800;
              letter-spacing:10px;
            ">
              ${otp}
            </div>

          </div>

          <div style="
            margin-top:14px;
            color:#6b7280;
            font-size:13px;
          ">
            ⏱ OTP expires in 1 minute
          </div>

        </div>

        <div style="
          background:#fff7ed;
          border:1px solid #fed7aa;
          border-radius:14px;
          padding:18px;
          margin-top:20px;
        ">

          <div style="
            color:#9a3412;
            font-size:14px;
            line-height:1.7;
          ">
            🔒 Never share this OTP with anyone.
            MS Creations will never ask for your OTP via call, message, or email.
          </div>

        </div>

      </div>

      <div style="
        background:#fafafa;
        padding:22px;
        text-align:center;
        border-top:1px solid #eeeeee;
      ">

        <p style="
          margin:0;
          color:#9ca3af;
          font-size:12px;
          line-height:1.8;
        ">
          © ${new Date().getFullYear()}
          MS Creations Store.
        </p>

      </div>

    </div>

  </div>
    `;
  }
}
