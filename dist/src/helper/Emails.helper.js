"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportUserEmail = exports.VerifyEmail = exports.SendInvitationEmail = exports.ActivateOrganization = exports.PasswordResetEmail = exports.CreatePassword = void 0;
const CreatePassword = (name, email, token, type, role) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear ${email},</p>
            <p>Thank you for your patience</p>
            <p>Please click the button below to create a password for your account to login</p>
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/create-password?token=${token}&type=${type}&email=${email}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Create Password</a></button>
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas Free</p>
        </div>
    </div>
</body>
</html>
`;
exports.CreatePassword = CreatePassword;
const PasswordResetEmail = (email, token, type, role) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear ${email},</p>
            <p>Forgot your password? It happens to the best of us. To reset your password, click the button below. The link
            will self-destruct after 24 hours.</p>
            <p>Please click the button below to reset your password</p>
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/reset-password?token=${token}&type=${type}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Reset Password</a></button>
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas free</p>
        </div>
    </div>
</body>
</html>
`;
exports.PasswordResetEmail = PasswordResetEmail;
const ActivateOrganization = (name, email, token, type) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your patience</p>
            <p>Your organization was successfully verified!</p>
           
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas free</p>
        </div>
    </div>
</body>
</html>
`;
exports.ActivateOrganization = ActivateOrganization;
const SendInvitationEmail = (email, token, type, role, organization_name) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear ${email},</p>
            <p>You have received an invitation from ${organization_name}</p>
            <p>Please click the button below to set up your account</p>
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/create-password?token=${token}&type=${type}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Create Password</a></button>
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas free</p>
        </div>
    </div>
</body>
</html>
`;
exports.SendInvitationEmail = SendInvitationEmail;
const VerifyEmail = (username, user_id, token, type, role) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear ${username},</p>
            
            <p>Please click the button below to verify your email</p>
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/verify-email?token=${token}&user_id=${user_id}&type=${type}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Verify email</a></button>
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas free</p>
        </div>
    </div>
</body>
</html>
`;
exports.VerifyEmail = VerifyEmail;
const ReportUserEmail = (username, reason, type) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: "Google Sans", sans-serif;
            line-height: 1.6;
            color: #333333;
        }
        .container {
            width: 80%;
            margin: 0 auto;
            background-color: #f7f7f7;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            color: #4CAF50;
        }
        .content {
            margin-top: 20px;
            font-family: "Google Sans", sans-serif;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: grey;
            font-family: "Google Sans", sans-serif;
        }
        .button {
            border: none;
            padding: 15px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="100" height="100">
        </div>
        <div class="content">
            <p>Dear Admin,</p>
            
            <p>Someone reported ${type} ${username}</p>
            <p>Reason: ${reason}</p>
            
        </div>
        <div class="footer">
            <p>Best Regards,</p>
            <p>Team Atlas free</p>
        </div>
    </div>
</body>
</html>
`;
exports.ReportUserEmail = ReportUserEmail;
