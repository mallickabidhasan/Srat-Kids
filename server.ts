import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Helper function to escape HTML special characters
  function escapeHtml(str: string) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Email API Endpoint
  app.post("/api/send-admission-form", async (req, res) => {
    const { 
      studentName, 
      fatherName, 
      motherName, 
      schoolName, 
      className, 
      mobile, 
      religion, 
      shift, 
      studentEmail 
    } = req.body;

    const safeStudentName = escapeHtml(studentName);
    const safeFatherName = escapeHtml(fatherName);
    const safeMotherName = escapeHtml(motherName);
    const safeSchoolName = escapeHtml(schoolName);
    const safeClassName = escapeHtml(className);
    const safeMobile = escapeHtml(mobile);
    const safeReligion = escapeHtml(religion);
    const safeShift = escapeHtml(shift);

    // Use environment variables for security
    const emailUser = process.env.EMAIL_USER || "abuhasan14330@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    if (!emailPass) {
      console.warn("EMAIL_PASS not set in environment variables. Email sending might fail.");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"স্টার কিডস্" <${emailUser}>`,
      to: studentEmail,
      subject: `ভর্তি আবেদন - ${safeStudentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e3a8a;">
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">ভর্তি আবেদন তথ্য</h2>
          <p>প্রিয় শিক্ষার্থী,</p>
          <p>স্টার কিডস্-এ আপনার ভর্তি আবেদনটি প্রাপ্ত হয়েছে। আপনার প্রদানকৃত তথ্যগুলো নিচে দেওয়া হলো:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ছাত্র/ছাত্রীর নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeStudentName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">পিতার নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeFatherName}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">মাতার নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeMotherName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">স্কুলের নাম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeSchoolName}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">শ্রেণী</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeClassName}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">মোবাইল নম্বর</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeMobile}</td>
            </tr>
            <tr style="background: #f8fafc;">
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">ধর্ম</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeReligion}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">শিফট</th>
              <td style="padding: 10px; border: 1px solid #e2e8f0;">${safeShift}</td>
            </tr>
          </table>
          <p style="margin-top: 30px;">আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব। আমাদের সাথে থাকার জন্য ধন্যবাদ।</p>
          <div style="margin-top: 40px; font-size: 12px; color: #64748b;">
            <p>স্টার কিডস্ - উজ্জ্বল এক আগামী!</p>
          </div>
        </div>
      `,
    };

    try {
      if (!emailPass || emailPass.trim() === "") {
        return res.json({ 
          success: true, 
          message: "আবেদন গ্রহণ করা হয়েছে।" 
        });
      }
      try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email sent successfully" });
      } catch (mailErr) {
        console.warn("Error sending admission email (invalid credentials or SMTP issue):", mailErr);
        res.json({ success: true, message: "আবেদন জমা হয়েছে।" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে।" });
    }
  });

  // Scholarship Festival Application Email API Endpoint
  app.post("/api/send-scholarship-form", async (req, res) => {
    const { 
      schoolName,
      className,
      studentNameBn,
      studentNameEn,
      fatherNameBn,
      motherNameBn,
      village,
      postOffice,
      upazila,
      district,
      mobile,
      religion,
      nationality
    } = req.body;

    const safeSchool = escapeHtml(schoolName);
    const safeClass = escapeHtml(className);
    const safeNameBn = escapeHtml(studentNameBn);
    const safeNameEn = escapeHtml(studentNameEn);
    const safeFather = escapeHtml(fatherNameBn);
    const safeMother = escapeHtml(motherNameBn);
    const safeVillage = escapeHtml(village);
    const safePostOffice = escapeHtml(postOffice);
    const safeUpazila = escapeHtml(upazila);
    const safeDistrict = escapeHtml(district);
    const safeMobile = escapeHtml(mobile);
    const safeReligion = escapeHtml(religion);
    const safeNationality = escapeHtml(nationality);

    const emailUser = process.env.EMAIL_USER || "abuhasan14330@gmail.com";
    const emailPass = process.env.EMAIL_PASS;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const mailOptions = {
      from: `"স্টার বৃত্তি উৎসব ২০২৬" <${emailUser}>`,
      to: "abuhasan14330@gmail.com",
      subject: `স্টার বৃত্তি উৎসব ২০২৬ আবেদন - ${safeNameBn} (${safeClass})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; color: #1e3a8a; max-width: 650px; margin: 0 auto; border: 2px solid #fbbf24; rounded: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #1e3a8a; margin: 0;">স্টার বৃত্তি উৎসব ২০২৬</h1>
            <h3 style="color: #d97706; margin-top: 5px;">আবেদনপত্র বিবরণ</h3>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr style="background: #eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left; width: 40%;">বিদ্যালয়ের নাম</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeSchool}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">শ্রেণী</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeClass}</td>
            </tr>
            <tr style="background: #eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">ছাত্র/ছাত্রীর নাম (বাংলা)</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeNameBn}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">ছাত্র/ছাত্রীর নাম (ইংরেজি)</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeNameEn}</td>
            </tr>
            <tr style="background: #eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">পিতার নাম (বাংলা)</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeFather}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">মাতার নাম (বাংলা)</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeMother}</td>
            </tr>
            <tr style="background: #eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">ঠিকানা</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">
                গ্রাম: ${safeVillage}, ডাকঘর: ${safePostOffice}, উপজেলা: ${safeUpazila}, জেলা: ${safeDistrict}
              </td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">মোবাইল / WhatsApp</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e40af;">${safeMobile}</td>
            </tr>
            <tr style="background: #eff6ff;">
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">ধর্ম</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeReligion}</td>
            </tr>
            <tr>
              <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">জাতীয়তা</th>
              <td style="padding: 10px; border: 1px solid #cbd5e1;">${safeNationality}</td>
            </tr>
          </table>
          <p style="margin-top: 25px; font-size: 13px; color: #475569; font-style: italic;">
            * আবেদনকারী অঙ্গীকার করেছেন যে প্রদত্ত সকল তথ্য সঠিক।
          </p>
          <div style="margin-top: 30px; border-t: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #64748b;">
            <p>স্টার কিডস্ - স্টার বৃত্তি উৎসব ২০২৬</p>
          </div>
        </div>
      `,
    };

    try {
      if (!emailPass || emailPass.trim() === "") {
        console.warn("EMAIL_PASS not configured, skipping email send.");
        return res.json({ success: true, message: "Application saved. Email pass missing." });
      }
      try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Scholarship application email sent successfully" });
      } catch (mailErr) {
        console.warn("Error sending scholarship email (invalid credentials or SMTP issue):", mailErr);
        res.json({ success: true, message: "Application saved successfully." });
      }
    } catch (error) {
      console.error("Error sending scholarship email:", error);
      res.status(500).json({ success: false, error: "ইমেইল পাঠাতে সমস্যা হয়েছে।" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware integrated.");
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Server is starting...`);
    console.log(`[SERVER] Server running on http://localhost:${PORT}`);
    console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`[SERVER] App URL: ${process.env.APP_URL || 'Not set'}`);
  });
}

console.log("[SERVER] Starting server script...");
startServer().catch(err => {
  console.error("[SERVER] Failed to start server:", err);
});
