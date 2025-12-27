import speakeasy from "speakeasy";
import qrcode from "qrcode";
import User from "../model/User.js";

// Generate TOTP secret
export const generate2FASecret = async (req, res) => {
  const secret = speakeasy.generateSecret({ length: 20 });
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  res.json({ secret: secret.base32, qrCodeUrl });
};

// Verify TOTP
export const verify2FA = async (req, res) => {
  const { token, secret } = req.body;
  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });

  res.json({ verified });
};
