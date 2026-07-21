import express from "express";
import path from "path";
import twilio from "twilio";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API route: Send actual OTP SMS via Twilio if configured
app.post("/api/send-otp", async (req, res) => {
  const { phone, text } = req.body;

  if (!phone || !text) {
    return res.status(400).json({ 
      success: false, 
      error: "Parametri mancanti: telefono e testo del messaggio sono obbligatori." 
    });
  }

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;

  // If credentials are not present, let client know so it can show a informative guide/simulation fallback
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log("Twilio credentials missing. Falling back to simulated OTP Toast.");
    return res.json({
      success: false,
      error: "missing_credentials",
      message: "Credenziali Twilio non configurate. Per favore configura TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, e TWILIO_PHONE_NUMBER nel file .env o nella scheda Secrets per ricevere l'SMS reale."
    });
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    
    // Ensure clean phone number formatting (Twilio requires E.164, e.g. +393331234567)
    let formattedPhone = phone.trim().replace(/\s+/g, "");
    if (!formattedPhone.startsWith("+")) {
      // Default to Italian prefix if missing and looks like Italian mobile
      if (formattedPhone.startsWith("3")) {
        formattedPhone = "+39" + formattedPhone;
      }
    }

    console.log(`Invio SMS Twilio reale a ${formattedPhone}...`);

    const message = await client.messages.create({
      body: text,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`SMS inviato con successo! SID: ${message.sid}`);
    return res.json({
      success: true,
      sid: message.sid,
      message: "SMS reale inviato correttamente sul tuo cellulare!"
    });
  } catch (err: any) {
    console.error("Errore durante l'invio dell'SMS con Twilio:", err);
    return res.status(500).json({
      success: false,
      error: "twilio_error",
      message: err.message || "Errore di comunicazione con il servizio Twilio."
    });
  }
});

// API route: Send actual Report Email via SMTP
app.post("/api/send-email", async (req, res) => {
  const { recipientEmail, reportType, vehicleCode, stationName, date, operatorName, reportData } = req.body;

  // As requested, we make sure we target lello199830@gmail.com
  const targetEmail = "lello199830@gmail.com";

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  // Let's generate the beautiful HTML content
  let emailHtml = "";
  let subject = `[LocalRescue] Report Checklist ${reportType === "sanitari" ? "Sanitari" : "Autisti"} - Mezzo ${vehicleCode} - ${date}`;

  if (reportType === "sanitari") {
    const items = reportData?.items || [];
    const signatures = reportData?.signatures || {};
    
    let rowsHtml = items.map((item: any) => {
      const getStatusStyle = (status: string) => {
        if (status === 'OK') return 'color: #10b981; font-weight: bold;';
        if (status === 'ANOMALIA') return 'color: #ef4444; font-weight: bold;';
        return 'color: #64748b;';
      };

      return `
        <tr>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; font-weight: bold; color: #475569;">${item.category || ""}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #1e293b;">${item.name || ""}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: center; ${getStatusStyle(item.mat)}">${item.mat || "-"}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: center; ${getStatusStyle(item.pom)}">${item.pom || "-"}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; text-align: center; ${getStatusStyle(item.not)}">${item.not || "-"}</td>
        </tr>
      `;
    }).join("");

    let signaturesHtml = Object.keys(signatures).map((shift: string) => {
      const sig = signatures[shift];
      return `
        <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-top: 10px; background-color: #f8fafc;">
          <p style="margin: 0; font-size: 12px; color: #475569;"><strong>Turno:</strong> ${shift.toUpperCase()}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #1e293b;"><strong>Operatore Firmatario:</strong> ${sig.name || ""}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;"><strong>Timestamp Convalida:</strong> ${sig.timestamp || ""}</p>
          ${sig.signatureDataUrl ? `<div style="margin-top: 8px;"><img src="${sig.signatureDataUrl}" style="max-height: 50px; border: 1px dashed #cbd5e1; padding: 4px; border-radius: 4px;" alt="Firma Autografa Digitale"/></div>` : ""}
        </div>
      `;
    }).join("");

    emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #ef4444; margin-top: 0; font-size: 20px; font-weight: 800; border-bottom: 2px solid #ef4444; padding-bottom: 8px;">CHECK-LIST SANITARI - 118 TARANTO</h2>
        <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Mezzo:</strong> ${vehicleCode}</p>
          <p style="margin: 4px 0;"><strong>Postazione:</strong> ${stationName}</p>
          <p style="margin: 4px 0;"><strong>Data Referto:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Operatore Loggato:</strong> ${operatorName}</p>
        </div>
        
        <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 10px; color: #334155;">Stato Presidi e Strumentazioni:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Categoria</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Presidio</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 60px;">MAT</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 60px;">POM</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 60px;">NOT</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 10px; color: #334155;">Convalida con Firma Digitale:</h3>
        ${signaturesHtml || "<p style='font-size: 12px; color: #64748b;'>Nessuna firma di turno apposta in questo referto.</p>"}
        
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Trasmesso in automatico tramite LocalRescue Taranto. Firma digitale, marca temporale e archiviazione cloud applicati all'atto della convalidazione.
        </p>
      </div>
    `;
  } else {
    // Autisti
    const activities = reportData?.activities || [];
    const damages = reportData?.damages || [];
    const notes = reportData?.notes || "";
    const signatures = reportData?.signatures || {};

    let rowsHtml = activities.map((act: any) => {
      const turn1 = act.turn1 || {};
      const turn2 = act.turn2 || {};
      const turn3 = act.turn3 || {};

      const getStatusStyle = (status: string) => {
        if (status === 'OK') return 'color: #10b981; font-weight: bold;';
        if (status === 'ANOMALIA') return 'color: #ef4444; font-weight: bold;';
        return 'color: #64748b;';
      };

      const formatVal = (v: any) => {
        if (!v || v.status === 'non_rilevato') return "-";
        let out = `<span style="${getStatusStyle(v.status)}">${v.status}</span>`;
        if (v.val) out += `<br/><small style="color: #64748b;">Valore: ${v.val}</small>`;
        return out;
      };

      return `
        <tr>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; font-weight: bold; color: #475569;">${act.category || ""}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 12px; color: #1e293b;">${act.name || ""}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-align: center;">${formatVal(turn1)}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-align: center;">${formatVal(turn2)}</td>
          <td style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-align: center;">${formatVal(turn3)}</td>
        </tr>
      `;
    }).join("");

    let damagesHtml = damages.map((d: any) => {
      return `<li>Componente: <strong>${d.part || ""}</strong> - Tipo danno: <strong>${d.type || ""}</strong></li>`;
    }).join("");

    let signaturesHtml = Object.keys(signatures).map((shift: string) => {
      const sig = signatures[shift];
      return `
        <div style="border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-top: 10px; background-color: #f8fafc;">
          <p style="margin: 0; font-size: 12px; color: #475569;"><strong>Turno:</strong> ${shift === 'turn1' ? 'MATTINA' : shift === 'turn2' ? 'POMERIGGIO' : 'NOTTE'}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #1e293b;"><strong>Autista/Soccorritore Firmatario:</strong> ${sig.name || ""}</p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748b;"><strong>Timestamp Convalida:</strong> ${sig.timestamp || ""}</p>
          ${sig.signatureDataUrl ? `<div style="margin-top: 8px;"><img src="${sig.signatureDataUrl}" style="max-height: 50px; border: 1px dashed #cbd5e1; padding: 4px; border-radius: 4px;" alt="Firma Autografa Digitale"/></div>` : ""}
        </div>
      `;
    }).join("");

    emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #06b6d4; margin-top: 0; font-size: 20px; font-weight: 800; border-bottom: 2px solid #06b6d4; padding-bottom: 8px;">CHECK-LIST EQUIPAGGIO - 118 TARANTO</h2>
        <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Mezzo:</strong> ${vehicleCode}</p>
          <p style="margin: 4px 0;"><strong>Postazione:</strong> ${stationName}</p>
          <p style="margin: 4px 0;"><strong>Data Referto:</strong> ${date}</p>
          <p style="margin: 4px 0;"><strong>Compilatore:</strong> ${operatorName}</p>
        </div>
        
        <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 10px; color: #334155;">Controlli Veicolo ed Attività Autisti:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Categoria</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Controllo</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 90px;">Turno 1</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 90px;">Turno 2</th>
              <th style="border: 1px solid #e2e8f0; padding: 8px; font-size: 11px; text-transform: uppercase; color: #475569; width: 90px;">Turno 3</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        ${damages.length > 0 ? `
          <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 5px; color: #ef4444;">Danni Carrozzeria Segnalati:</h3>
          <ul style="font-size: 12px; margin-top: 5px; padding-left: 20px;">
            ${damagesHtml}
          </ul>
        ` : ""}

        ${notes ? `
          <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 5px; color: #334155;">Note d'Officina / Segnalazioni:</h3>
          <div style="border: 1px solid #cbd5e1; padding: 10px; border-radius: 6px; font-size: 12px; font-style: italic; background-color: #f8fafc;">
            ${notes}
          </div>
        ` : ""}

        <h3 style="font-size: 15px; font-weight: 700; margin-top: 25px; margin-bottom: 10px; color: #334155;">Convalida con Firma Digitale:</h3>
        ${signaturesHtml || "<p style='font-size: 12px; color: #64748b;'>Nessuna firma di turno apposta in questo referto.</p>"}
        
        <p style="font-size: 10px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Trasmesso in automatico tramite LocalRescue Taranto. Firma digitale, marca temporale e archiviazione cloud applicati all'atto della convalidazione.
        </p>
      </div>
    `;
  }

  // If SMTP is NOT configured, we will simulate the real email dispatch and log it so the user sees it is perfectly implemented
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.log(`[Email Simulation Mode] Sending report to ${targetEmail}`);
    console.log(`Subject: ${subject}`);
    return res.json({
      success: false,
      error: "missing_smtp_credentials",
      message: `La funzionalità di invio email reale è pronta ed è configurata per l'indirizzo ${targetEmail}! Per abilitare la trasmissione reale sul tuo account Gmail, per favore inserisci i parametri SMTP nei Secrets del pannello di controllo (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).`,
      simulatedRecipient: targetEmail
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10),
      secure: parseInt(SMTP_PORT, 10) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const mailOptions = {
      from: SMTP_FROM || SMTP_USER,
      to: targetEmail, // Always send to the requested email lello199830@gmail.com
      subject: subject,
      html: emailHtml,
    };

    console.log(`Inviando email reale via SMTP a ${targetEmail}...`);
    await transporter.sendMail(mailOptions);
    console.log("Email reale inviata con successo!");

    return res.json({
      success: true,
      message: `Referto reale trasmesso con successo alla tua casella e-mail (${targetEmail})!`
    });
  } catch (err: any) {
    console.error("Errore durante l'invio dell'email via SMTP:", err);
    
    let userFriendlyMessage = `Errore durante l'invio reale tramite SMTP: ${err.message || "Verifica le tue credenziali SMTP configurate."}`;
    
    // Check if it's a typical Gmail / secure SMTP login failure (535 Username and Password not accepted)
    const errStr = String(err.message || "").toLowerCase();
    if (errStr.includes("535") || errStr.includes("username and password not accepted") || errStr.includes("invalid login")) {
      userFriendlyMessage = `Errore di Autenticazione SMTP (Codice 535): Le credenziali SMTP inserite non sono corrette o non sono state accettate dal server di posta.\n\n` +
        `Se stai utilizzando Gmail (${SMTP_USER}), Google richiede obbligatoriamente l'uso di una "Password per le app" (App Password) generata appositamente anziché della tua password principale dell'account:\n` +
        `1. Apri le impostazioni del tuo Account Google (https://myaccount.google.com);\n` +
        `2. Cerca o vai alla scheda "Sicurezza" nel menu di sinistra;\n` +
        `3. Assicurati che la "Verifica in due passaggi" (MFA) sia ATTIVA per il tuo account;\n` +
        `4. Nella barra di ricerca interna in alto digita "Password per le app" e clicca sulla voce corrispondente;\n` +
        `5. Digita un nome qualsiasi per la tua app (es: "LocalRescue Taranto") e clicca su Crea;\n` +
        `6. Copia il codice giallo a 16 caratteri che compare sullo schermo (senza spazi);\n` +
        `7. Utilizza questo codice a 16 caratteri come password (nel campo "SMTP_PASS" dei Secrets dell'applicazione o nel file .env) al posto della tua password normale!\n\n` +
        `Dettaglio errore originale: ${err.message}`;
    }

    // We send status 200 with success: false, so the frontend gets the JSON message beautifully and doesn't crash on server-side status errors
    return res.json({
      success: false,
      error: "smtp_error",
      message: userFriendlyMessage,
      simulatedRecipient: targetEmail
    });
  }
});

// Vite middleware for development / Static file hosting for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static files from dist.");
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
