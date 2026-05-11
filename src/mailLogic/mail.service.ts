import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { OtpPurpose } from "src/auth/otp-purpose.enum";

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
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
        from: "MS Creations <mscreation3010@gmail.com>",
        to: email,
        subject: `${subjectMap[purpose]} | OTP ${otp}`,

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

      [OtpPurpose.FORGOT_PASSWORD]: "Password Reset",

      [OtpPurpose.COD]: "COD Order Confirmation",
    };

    const text = purposeTextMap[purpose] || "to complete verification";

    const title = titleMap[purpose] || "OTP Verification";

    return `


<div style="
  background:#f4f4f5;
  padding:40px 15px;
  font-family:Arial,sans-serif;
">

  <div style="
    max-width:520px;
    margin:auto;
    background:#ffffff;
    border-radius:14px;
    overflow:hidden;
    border:1px solid #e5e7eb;
  ">


<div style="
  background:#991b1b;
  padding:30px;
  text-align:center;
">

  <h1 style="
    margin:0;
    color:#ffffff;
    font-size:30px;
    font-weight:bold;
  ">
    MS Creations
  </h1>

  <p style="
    margin-top:8px;
    color:#f3f4f6;
    font-size:14px;
  ">
    Secure OTP Verification
  </p>

</div>

<div style="padding:35px;">

  <h2 style="
    margin-top:0;
    color:#111827;
    font-size:24px;
  ">
    ${title}
  </h2>

  <p style="
    color:#4b5563;
    font-size:15px;
    line-height:1.8;
  ">
    Hello,
  </p>

  <p style="
    color:#4b5563;
    font-size:15px;
    line-height:1.8;
  ">
    Please use the following OTP ${text}.
  </p>

  <div style="
    text-align:center;
    margin:35px 0;
  ">

    <div style="
      display:inline-block;
      background:#991b1b;
      color:#ffffff;
      padding:18px 40px;
      border-radius:12px;
      font-size:38px;
      font-weight:bold;
      letter-spacing:8px;
    ">
      ${otp}
    </div>

  </div>

  <p style="
    text-align:center;
    color:#6b7280;
    font-size:13px;
    margin-top:-10px;
  ">
    OTP valid for 1 minute
  </p>

  <div style="
    margin-top:30px;
    background:#fff7ed;
    border:1px solid #fed7aa;
    border-radius:10px;
    padding:16px;
  ">

    <p style="
      margin:0;
      color:#9a3412;
      font-size:14px;
      line-height:1.7;
    ">
      Never share this OTP with anyone.
      MS Creations will never ask for your OTP.
    </p>

  </div>

  <div style="
    margin-top:30px;
    padding-top:20px;
    border-top:1px solid #e5e7eb;
  ">

    <p style="
      margin:0;
      color:#6b7280;
      font-size:14px;
      line-height:1.8;
    ">
      If you did not request this email,
      you can safely ignore it.
    </p>

  </div>

</div>

<div style="
  background:#fafafa;
  border-top:1px solid #eeeeee;
  padding:18px;
  text-align:center;
">

  <p style="
    margin:0;
    color:#9ca3af;
    font-size:12px;
  ">
    © ${new Date().getFullYear()} MS Creations Store
  </p>

</div>

  </div>

</div>
    `;
  }
}
