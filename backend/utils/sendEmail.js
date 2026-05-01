const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendDoctorCredentials = async (doctorEmail, doctorName, tempPassword) => {
  try {
    await transporter.sendMail({
      from: `"Secure EHR System" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: 'Your Secure EHR Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2d6b70; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Secure EHR</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0;">Smart Healthcare Record System</p>
          </div>

          <div style="padding: 32px; background-color: #f9f9f9;">
            <h2 style="color: #222;">Welcome, Dr. ${doctorName}</h2>
            <p style="color: #555; line-height: 1.6;">
              Your doctor account has been created on the Secure EHR system by the Ministry of Health IT Department.
              Please use the credentials below to log in for the first time.
            </p>

            <div style="background-color: white; border-radius: 10px; padding: 20px; margin: 24px 0; border: 1px solid #ddd;">
              <p style="margin: 0 0 10px; color: #888; font-size: 13px; font-weight: bold;">YOUR LOGIN CREDENTIALS</p>
              <p style="margin: 0 0 8px; color: #333;"><strong>Email:</strong> ${doctorEmail}</p>
              <p style="margin: 0 0 8px; color: #333;"><strong>Temporary Password:</strong>
                <span style="background: #e8f8fb; padding: 4px 10px; border-radius: 5px; font-family: monospace; font-size: 15px; color: #0f6b7d;">
                  ${tempPassword}
                </span>
              </p>
            </div>

            <div style="background-color: #fff8e1; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 5px; margin-bottom: 24px;">
              <p style="margin: 0; color: #92400e; font-size: 13px;">
                ⚠️ For security reasons, please change your password immediately after your first login.
              </p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              You can log in at: <a href="http://localhost:3000" style="color: #17a8c4;">Secure EHR Portal</a>
            </p>
          </div>

          <div style="background-color: #2d6b70; padding: 16px; text-align: center;">
            <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px;">
              🔒 This is an automated message from Secure EHR. Do not reply to this email.
            </p>
          </div>
        </div>
      `
    });
    console.log(`Credentials email sent to ${doctorEmail}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = sendDoctorCredentials;