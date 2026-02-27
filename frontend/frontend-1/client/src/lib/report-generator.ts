import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function downloadReport(data: any) {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.backgroundColor = "white";
  container.style.padding = "0";
  container.style.fontFamily = "'Inter', sans-serif";
  container.style.color = "#333";

  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  container.innerHTML = `
    <!-- HEADER -->
    <div style="background-color: #1e4d3a; color: white; padding: 40px; margin-bottom: 30px;">
      <h1 style="font-size: 32px; font-weight: 800; margin: 0; margin-bottom: 10px; letter-spacing: -0.02em;">FARM SYSTEM COMPREHENSIVE REPORT</h1>
      <div style="display: flex; justify-content: space-between; font-size: 14px; opacity: 0.9; font-weight: 600;">
        <span>Report ID: ${data.batchId || "FS-928374"}</span>
        <span>Generated: ${date}</span>
      </div>
    </div>

    <div style="padding: 0 40px 40px 40px;">
      
      <!-- PAGE 1: DASHBOARD SUMMARY -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 20px 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #1e4d3a;">1. Dashboard Overview</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="height: 35px;"><td style="color: #666; font-weight: 600;">Overall Grade:</td><td style="color: #1e4d3a; font-weight: 800;">${data.grade || "A"}</td></tr>
              <tr style="height: 35px;"><td style="color: #666; font-weight: 600;">Yield Efficiency:</td><td style="color: #1e4d3a; font-weight: 800;">${data.efficiency || "94"}%</td></tr>
              <tr style="height: 35px;"><td style="color: #666; font-weight: 600;">Days to Dryness:</td><td style="color: #1e4d3a; font-weight: 800;">${data.dryness || "0.5"} days</td></tr>
              <tr style="height: 35px;"><td style="color: #666; font-weight: 600;">Irrigation Mode:</td><td style="color: #1e4d3a; font-weight: 800;">${data.pumpAuto ? "Automated" : "Manual"}</td></tr>
            </table>
          </div>
          <div style="width: 180px; padding: 15px; background-color: #f7f9f7; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid #eef2ee;">
            <span style="font-size: 10px; font-weight: 800; color: #666; margin-bottom: 5px; text-transform: uppercase;">Health Index</span>
            <span style="font-size: 48px; font-weight: 900; color: #1e4d3a;">82</span>
            <span style="font-size: 10px; font-weight: 700; color: #22c55e;">GOOD CONDITION</span>
          </div>
        </div>
        
        <div style="display: flex; gap: 15px;">
          <div style="flex: 1; background-color: #f7f9f7; padding: 15px; border-radius: 8px;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin: 0 0 5px 0; text-transform: uppercase;">Temperature</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1a1a1a;">${data.temperature || "28.6"}°C</p>
          </div>
          <div style="flex: 1; background-color: #f7f9f7; padding: 15px; border-radius: 8px;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin: 0 0 5px 0; text-transform: uppercase;">Soil Moisture</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1a1a1a;">${data.moisture || "13.0"}%</p>
          </div>
          <div style="flex: 1; background-color: #f7f9f7; padding: 15px; border-radius: 8px;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin: 0 0 5px 0; text-transform: uppercase;">Humidity</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1a1a1a;">${data.humidity || "62.0"}%</p>
          </div>
        </div>
      </div>

      <!-- PAGE 2: CROP INTELLIGENCE -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 20px 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #1e4d3a;">2. Crop Intelligence & Lifecycle</h2>
        <div style="background-color: #f7f9f7; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #eef2ee;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <p style="font-size: 11px; font-weight: 700; color: #666; margin: 0; text-transform: uppercase;">Current Growth Stage</p>
              <p style="font-size: 24px; font-weight: 800; margin: 5px 0 0 0; color: #1e4d3a;">Vegetative Phase</p>
            </div>
            <div style="text-align: right;">
              <p style="font-size: 11px; font-weight: 700; color: #666; margin: 0; text-transform: uppercase;">Day Count</p>
              <p style="font-size: 24px; font-weight: 800; margin: 5px 0 0 0; color: #1e4d3a;">Day 32 of 90</p>
            </div>
          </div>
        </div>

        <h3 style="font-size: 14px; font-weight: 800; color: #666; margin-bottom: 12px; text-transform: uppercase;">Recent Activity log</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr style="border-bottom: 1px solid #f0f0f0; height: 35px;">
            <td style="padding: 10px; font-weight: 700; color: #1e4d3a;">Today, 14:30</td>
            <td style="padding: 10px; color: #333;">AI irrigation advisory issued</td>
            <td style="padding: 10px; text-align: right;"><span style="color: #f59e0b; font-weight: 700;">WARNING</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0; height: 35px;">
            <td style="padding: 10px; font-weight: 700; color: #1e4d3a;">Today, 11:00</td>
            <td style="padding: 10px; color: #333;">Soil moisture sensor calibrated</td>
            <td style="padding: 10px; text-align: right;"><span style="color: #22c55e; font-weight: 700;">SUCCESS</span></td>
          </tr>
          <tr style="border-bottom: 1px solid #f0f0f0; height: 35px;">
            <td style="padding: 10px; font-weight: 700; color: #1e4d3a;">Today, 08:45</td>
            <td style="padding: 10px; color: #333;">Temperature threshold exceeded 30°C</td>
            <td style="padding: 10px; text-align: right;"><span style="color: #ef4444; font-weight: 700;">CRITICAL</span></td>
          </tr>
        </table>
      </div>

      <!-- PAGE 3: ANOMALY & VISION MONITORING -->
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 20px 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #1e4d3a;">3. Vision & Anomaly Detection</h2>
        <div style="display: flex; gap: 20px;">
          <div style="flex: 2;">
            <h3 style="font-size: 14px; font-weight: 800; color: #666; margin-bottom: 12px; text-transform: uppercase;">Active Alerts</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr style="background-color: #fdf2f2; border-radius: 6px; height: 45px;">
                <td style="padding: 10px; font-weight: 700;">Pest Detection</td>
                <td style="padding: 10px; color: #666;">Sector 4A</td>
                <td style="padding: 10px; text-align: right;"><span style="background-color: #ef4444; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800;">HIGH</span></td>
              </tr>
              <tr style="height: 10px;"><td></td></tr>
              <tr style="background-color: #fffbeb; border-radius: 6px; height: 45px;">
                <td style="padding: 10px; font-weight: 700;">Leaf Discoloration</td>
                <td style="padding: 10px; color: #666;">Sector 2B</td>
                <td style="padding: 10px; text-align: right;"><span style="background-color: #f59e0b; color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800;">MEDIUM</span></td>
              </tr>
            </table>
          </div>
          <div style="flex: 1; background-color: #f7f9f7; padding: 20px; border-radius: 12px; border: 1px solid #eef2ee; text-align: center;">
            <p style="font-size: 11px; font-weight: 800; color: #666; margin-bottom: 15px; text-transform: uppercase;">Confidence Score</p>
            <div style="width: 100px; height: 100px; border: 8px solid #1e4d3a; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto;">
              <span style="font-size: 24px; font-weight: 900; color: #1e4d3a;">94%</span>
            </div>
            <p style="font-size: 10px; font-weight: 700; color: #1e4d3a; margin-top: 15px;">VISION ENGINE PRO v2</p>
          </div>
        </div>
      </div>

      <!-- PAGE 4: AI INTELLIGENCE HUB -->
      <div>
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 20px 0; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; color: #1e4d3a;">4. AI Intelligence Hub Insights</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
          <div style="background-color: #f7f9f7; padding: 15px; border-radius: 8px; border: 1px solid #eef2ee;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin-bottom: 5px; text-transform: uppercase;">Yield Confidence</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1e4d3a;">84%</p>
            <p style="font-size: 9px; font-weight: 700; color: #22c55e; margin: 2px 0 0 0;">▲ +2.1% trend</p>
          </div>
          <div style="background-color: #f7f9f7; padding: 15px; border-radius: 8px; border: 1px solid #eef2ee;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin-bottom: 5px; text-transform: uppercase;">Disease Probability</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1e4d3a;">LOW</p>
            <p style="font-size: 9px; font-weight: 700; color: #22c55e; margin: 2px 0 0 0;">Stable condition</p>
          </div>
          <div style="background-color: #f7f9f7; padding: 15px; border-radius: 8px; border: 1px solid #eef2ee;">
            <p style="font-size: 9px; font-weight: 700; color: #666; margin-bottom: 5px; text-transform: uppercase;">Resource Efficiency</p>
            <p style="font-size: 20px; font-weight: 800; margin: 0; color: #1e4d3a;">92%</p>
            <p style="font-size: 9px; font-weight: 700; color: #22c55e; margin: 2px 0 0 0;">▲ +5.4% improvement</p>
          </div>
        </div>
        <div style="margin-top: 25px; background-color: #f7f9f7; padding: 15px; border-radius: 8px; font-size: 11px; line-height: 1.5; color: #444; border-left: 4px solid #1e4d3a;">
          <strong>AI ADVISORY SUMMARY:</strong> Immediate irrigation is recommended in Sector 4A (Moisture: 32%) to maintain optimal nutrient uptake and heat stress resilience over the forecasted 32°C peak period.
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdfHeight = (canvas.height / 2);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [800, pdfHeight],
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const finalPdfHeight = (pdf.getImageProperties(imgData).height * pdfWidth) / pdf.getImageProperties(imgData).width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, finalPdfHeight);
    pdf.save(`farm-comprehensive-report-${date.replace(/\//g, "-")}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
