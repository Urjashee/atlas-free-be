import {Constants} from "./Constants.helper";

export const CreatePassword = (name: string, email: string, token: string, type: number, role?: number) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            
            <p>Thank you for your patience as we verify your organization in Wayplace. ${name} is now verified. 
            Use this <a href='${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">link</a> to complete the set up for ${name}:
                    <br/>
            <a href='${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                ${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}</a></p>
            For any questions about your account or how to use Wayplace, please reach out to us at <br/>
            wayplace@atlasfree.org.<br/>
            <p>Wayplace Team</p>
            
        </div>
        <div class="content">
            <p>
            If the above button or link doesn't work you can copy the link below and paste it in your web browser
            </p>
            <p>
            ${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}
            </p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const RejectOrganization = (name: string, organization_name: string, email: string, token: string, type: number, role?: number) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Thank you for your patience as we verify your organization in Wayplace. 
            ${organization_name} was unable to be verified. 
            If you are unsure why your organization was not verified, reach out to us at wayplace@atlasfree.org. 
            A member of the Wayplace team will then respond with additional details.</p>
            
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const PendingOrganization = (name: string, organization_name: string, email: string, token: string, type: number, role?: number) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
           
            <p>We received your update to the profile for ${organization_name} but were unable to accept the changes. 
            A member of the Wayplace team will reach out soon with additional details. </p>
            
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const SendServiceRequest = (name: string, line_1: string, line_2: string, line_3: string, contact_email: string, contact_phone: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>${line_1}</p>
            <p>${contact_email} ${contact_phone}</p>
            <p>${line_2}</p>
            <p>${line_3}</p>
            <p>Wayplace</p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const SendServiceRequestClient = (name: string, line_1: string, line_2: string, line_3: string, contact_email: string, contact_phone: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>${line_1}</p>
            <p>${line_2}</p>
            <p>${contact_email} ${contact_phone}</p>
            <p>Wayplace</p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const PasswordResetEmail = (email: string, token: string, type: number, role: number) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>We received a request to reset the password for your account.</p>
            <p>To create a new password, please click the button below.</p>
            <p>For security reasons, this link will expire in 24 hours.  If you did not request a password reset, you can safely ignore this email — your account will remain secure.</p>
            <p>If you need assistance, please contact us at wayplace@atlasfree.org</p>
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/reset-password?token=${token}&type=${type}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Reset Password</a></button>
        </div>
        <div class="content">
            <p>
            If the above button or link doesn't work you can copy the link below and paste it in your web browser
            </p>
            <p>
            ${process.env.SITE_NAME}/reset-password?token=${token}&type=${type}&role=${role}
            </p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const ActivateOrganization = (name: string, email: string, token: string, type: any) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for your patience</p>
            <p>Your organization was successfully verified!</p>
           
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const SendInvitationEmail = (email: string, token: string, type: number, role: number, organization_name: string, role_name: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Hi ${email},</p>
            <p>
                    ${ role === Constants.ROLE_ORGANIZATION_ADMIN
                ? `You are invited to join Wayplace as a ${role_name} for ${organization_name}.`
                : `You are invited by ${organization_name} to join Wayplace as a ${role_name}.`
                }
                    To confirm your email address and set up your account, click the button below.
            </p>
            
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Set Up User Account</a></button>
        </div>
        <div class="content">
            <p>
            If the above button or link doesn't work you can copy the link below and paste it in your web browser
            </p>
            <p>
            ${process.env.SITE_NAME}/signup?token=${token}&type=${type}&email=${email}&role=${role}
            </p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const VerifyEmail = (username: string, user_id: number, token: string, type: number, role: number) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Welcome to Wayplace! </p>
            
            <button type="button" class="button">
            <a href='${process.env.SITE_NAME}/verify-email?token=${token}&user_id=${user_id}&type=${type}&role=${role}' 
                    style="text-decoration:none;color: #2954FF;">
                Click here to verify your email address</a></button>
        </div>
        <div class="content">
            <p>
            If the above button or link doesn't work you can copy the link below and paste it in your web browser
            </p>
            <p>
            ${process.env.SITE_NAME}/verify-email?token=${token}&user_id=${user_id}&type=${type}&role=${role}
            </p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const ReportUserEmail = (username: string, reason: string, type: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Dear Admin,</p>
            
            <p>Someone reported ${type} ${username}</p>
            <p>Reason: ${reason}</p>
            
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const SurvivorReportReceipt = (username: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Dear ${username},</p>
            
            <p>Thank you for taking the time to report a service in Wayplace. We want to affirm that your report has been received and documented.</p>
            <p>The Wayplace team does not conduct independent investigations. Our role is to support transparency and accountability across the system while upholding your safety and dignity.</p>
            <p>We will review the details and thoughtfully consider how to handle the situation.</p>
            <p>Thank you again for using your strength to bring this forward.</p>
            
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const ReportedUser = () => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            
            <p>This is a confirmation that you have reported a user in Wayplace and the Wayplace team has received your report.</p>
            <p>The Wayplace team does not conduct independent investigations. Our role is to support transparency and accountability across the system while upholding your safety and dignity.</p>
            <p>We will review the details and thoughtfully consider how to handle the situation. Thank you for being diligent and protecting the Wayplace community. </p>
            <p>Wayplace Team</p>
            
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

export const ServiceSettingReminder = (email: string, service_name: string) => `
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
            margin-top: 90px;
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
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/wayplace_logo_gray.png" alt="logo" width="110" height="100">
        </div>
        <div class="content">
            <p>Hi ${email},</p>
            <p>It’s time to review and update ${service_name}’s availability in Wayplace. 
            Log in <a href=${process.env.SITE_NAME}>here</a> and go to the Service Settings page for ${service_name}.</p>
            <p>Ensuring your availability information is accurate and current is critical so survivors can see, in real time, what services are truly accessible. 
            This will impact how your service shows up in search results, whether that be ‘Full,’ ‘Waitlist Only,’ or ‘Open.’</p>
            <p>If you need assistance, please contact us at wayplace@atlasfree.org</p>
       
            <p>Wayplace</p>
            
            <a href='${process.env.SITE_NAME}' 
                    style="text-decoration:none;color: #2954FF;">
                ${process.env.SITE_NAME}</a>
            
        </div>
        <div class="content">
            <p>
            If the above button or link doesn't work you can copy the link below and paste it in your web browser
            </p>
            <p>
            ${process.env.SITE_NAME}
            </p>
        </div>
        <div class="footer">
            <img src="https://atlas-free.s3.us-east-1.amazonaws.com/logo-main-blue.png" alt="logo" width="30" height="30">
            <p style="margin: 0">Copyright © 2026 Atlas Free, all rights reserved.</p>
            <p style="margin: 0">PO Box 77, Kirkland, WA 98083</p>
        </div>
    </div>
</body>
</html>
`;

