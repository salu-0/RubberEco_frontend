/**
 * Certificate Generator Utility
 * Generates and downloads PDF certificates for completed training modules
 */

// Check if dependencies are available, otherwise provide fallback
let jsPDF = null;
let html2canvas = null;

try {
  const jsPDFModule = require('jspdf');
  jsPDF = jsPDFModule.jsPDF || jsPDFModule;
} catch (e) {
  console.warn('jsPDF not available, will use fallback method');
}

try {
  html2canvas = require('html2canvas');
} catch (e) {
  console.warn('html2canvas not available, will use fallback method');
}

/**
 * Format enrollment data for certificate generation
 */
export const formatCertificateData = (enrollment, certificate) => {
  return {
    userName: enrollment.studentName || enrollment.farmerName || 'Student',
    email: enrollment.email,
    moduleName: enrollment.moduleTitle || 'Training Module',
    completionDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    certificateId: certificate?.id || `CERT-${Date.now()}`,
    instructorName: 'RubberEco Training Academy',
    score: enrollment.completionPercentage || 100
  };
};

/**
 * Check if certificate can be generated
 */
export const canGenerateCertificate = (enrollment, progress) => {
  return enrollment && progress >= 100 && !enrollment.certificateIssued;
};

/**
 * Generate certificate PDF and trigger download
 * Uses jsPDF and html2canvas if available, otherwise creates a simple PDF
 */
export const generateCertificatePDF = async (certificateData) => {
  try {
    // If we have jsPDF, use it to create a professional certificate
    if (jsPDF && html2canvas) {
      await generateAdvancedCertificate(certificateData);
    } else {
      // Fallback: create a simple downloadable certificate using Canvas
      await generateSimpleCertificate(certificateData);
    }
  } catch (error) {
    console.error('Error generating certificate:', error);
    // Final fallback: create a text-based certificate
    generateBasicCertificate(certificateData);
  }
};

/**
 * Generate an advanced HTML-based certificate and convert to PDF
 */
const generateAdvancedCertificate = async (data) => {
  // Create certificate HTML element
  const certificateHTML = document.createElement('div');
  certificateHTML.id = 'certificate-content';
  certificateHTML.style.cssText = `
    position: absolute;
    left: -9999px;
    width: 1200px;
    height: 800px;
    padding: 40px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    font-family: 'Georgia', serif;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    border: 8px solid #2c5f2d;
    box-sizing: border-box;
  `;

  certificateHTML.innerHTML = `
    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <h1 style="font-size: 48px; color: #2c5f2d; margin: 0; font-weight: bold;">Certificate of Completion</h1>
      
      <div style="margin: 30px 0; border-bottom: 2px solid #2c5f2d; width: 80%; padding-bottom: 20px;">
        <p style="font-size: 14px; color: #666; margin: 0;">This is to certify that</p>
      </div>
      
      <h2 style="font-size: 36px; color: #1a1a1a; margin: 20px 0; font-weight: bold;">
        ${data.userName}
      </h2>
      
      <p style="font-size: 16px; color: #333; margin: 10px 0; max-width: 800px;">
        has successfully completed the
      </p>
      
      <h3 style="font-size: 28px; color: #2c5f2d; margin: 15px 0; font-weight: bold;">
        ${data.moduleName}
      </h3>
      
      <p style="font-size: 14px; color: #666; margin: 20px 0; max-width: 800px;">
        Completion Date: <strong>${data.completionDate}</strong>
      </p>
      
      <p style="font-size: 14px; color: #666; margin: 10px 0;">
        Certificate ID: <strong>${data.certificateId}</strong>
      </p>
      
      <div style="margin-top: 40px; width: 100%; display: flex; justify-content: space-around;">
        <div style="text-align: center;">
          <div style="height: 60px; display: flex; align-items: flex-end;">
            <div style="width: 150px; border-top: 2px solid #333;"></div>
          </div>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            ${data.instructorName}
          </p>
        </div>
        <div style="text-align: center;">
          <div style="height: 60px; display: flex; align-items: flex-end;">
            <div style="width: 150px; border-top: 2px solid #333;"></div>
          </div>
          <p style="margin-top: 10px; font-size: 12px; color: #666;">
            Date
          </p>
        </div>
      </div>
    </div>
    
    <div style="margin-top: 30px; font-size: 12px; color: #999;">
      <p style="margin: 0;">RubberEco Training Academy | Certificate of Achievement</p>
    </div>
  `;

  document.body.appendChild(certificateHTML);

  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(certificateHTML, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    // Create PDF from canvas
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    // Download PDF
    pdf.save(`${data.userName}_Certificate_${data.certificateId}.pdf`);
  } finally {
    // Remove temporary element
    document.body.removeChild(certificateHTML);
  }
};

/**
 * Generate a simple canvas-based certificate (fallback if html2canvas unavailable)
 */
const generateSimpleCertificate = (data) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  
  const ctx = canvas.getContext('2d');

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f5f7fa');
  gradient.addColorStop(1, '#c3cfe2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#2c5f2d';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Title
  ctx.font = 'bold 48px Georgia';
  ctx.fillStyle = '#2c5f2d';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', canvas.width / 2, 120);

  // Divider
  ctx.strokeStyle = '#2c5f2d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(200, 170);
  ctx.lineTo(canvas.width - 200, 170);
  ctx.stroke();

  // Student name
  ctx.font = 'bold 36px Georgia';
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText(data.userName, canvas.width / 2, 280);

  // Completion text
  ctx.font = '16px Georgia';
  ctx.fillStyle = '#333';
  ctx.fillText('has successfully completed the', canvas.width / 2, 340);

  // Module name
  ctx.font = 'bold 28px Georgia';
  ctx.fillStyle = '#2c5f2d';
  ctx.fillText(data.moduleName, canvas.width / 2, 390);

  // Completion date
  ctx.font = '14px Georgia';
  ctx.fillStyle = '#666';
  ctx.fillText(`Completion Date: ${data.completionDate}`, canvas.width / 2, 460);

  // Certificate ID
  ctx.fillText(`Certificate ID: ${data.certificateId}`, canvas.width / 2, 490);

  // Signature lines
  const signatureY = 600;
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#333';
  ctx.beginPath();
  ctx.moveTo(200, signatureY);
  ctx.lineTo(350, signatureY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(850, signatureY);
  ctx.lineTo(1000, signatureY);
  ctx.stroke();

  // Signature labels
  ctx.font = '12px Georgia';
  ctx.fillStyle = '#666';
  ctx.textAlign = 'center';
  ctx.fillText(data.instructorName, 275, signatureY + 30);
  ctx.fillText('Date', 925, signatureY + 30);

  // Footer
  ctx.font = '12px Georgia';
  ctx.fillStyle = '#999';
  ctx.fillText('RubberEco Training Academy | Certificate of Achievement', canvas.width / 2, 750);

  // Download canvas as image
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.userName}_Certificate_${data.certificateId}.png`;
    link.click();
    URL.revokeObjectURL(url);
  });
};

/**
 * Generate a basic text certificate (final fallback)
 */
const generateBasicCertificate = (data) => {
  const certificateText = `
╔════════════════════════════════════════════════════════════════════╗
║                   CERTIFICATE OF COMPLETION                        ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  This is to certify that                                          ║
║                                                                    ║
║  ${data.userName.padEnd(60)}
║                                                                    ║
║  has successfully completed the                                   ║
║                                                                    ║
║  ${data.moduleName.padEnd(60)}
║                                                                    ║
║  Completion Date: ${data.completionDate}
║                                                                    ║
║  Certificate ID: ${data.certificateId}
║                                                                    ║
║  Issued by: ${data.instructorName}
║                                                                    ║
║  Score: ${data.score}%
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║           RubberEco Training Academy                               ║
║        Certificate of Achievement                                  ║
╚════════════════════════════════════════════════════════════════════╝
  `;

  // Create a downloadable text file
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(certificateText));
  element.setAttribute('download', `${data.userName}_Certificate_${data.certificateId}.txt`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

export default {
  formatCertificateData,
  canGenerateCertificate,
  generateCertificatePDF
};
