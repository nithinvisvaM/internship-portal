const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const readline = require("readline");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Document, Packer, Paragraph, TextRun } = require("docx");

// 🔑 Add your Gemini API key
const genAI = new GoogleGenerativeAI("AIzaSyD_wQb5aTPnvR6AlyreABAkx_R_HJ-EXFw");

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// DOMAIN SKILLS
const domainSkills = {
  fullstack: "React, Node.js, REST API, MongoDB, Express, HTML, CSS, JavaScript",
  networking: "Cisco, Routing, Switching, Packet Tracer, Firewall, Load Balancing",
  iot: "Sensors, Embedded Systems, Arduino, STM32, IoT Monitoring",
  datasci: "Python, Machine Learning, Pandas, Data Analysis, Deep Learning"
};

// REPORT GENERATOR (SHORT FORMAT)
async function generateReport(filename, analysis) {

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: "Domain Resume Screening Report",
              bold: true,
              size: 32
            })
          ]
        }),
        new Paragraph(" "),
        new Paragraph(analysis)
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const reportName = `Domain_Report_${filename}.docx`;

  fs.writeFileSync(reportName, buffer);
}

// RESUME ANALYSIS
async function analyzeResume(filePath, fileName, domain) {

  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  const resumeText = data.text;

  console.log(`\n🔄 Screening ${fileName} for ${domain} domain...`);

  const prompt = `
You are an HR Resume Screening System.

Screen the resume for ${domain} domain.

Required Skills for ${domain}:
${domainSkills[domain]}

Return ONLY this short format:

Match Score: XX/100

Selected: YES or NO

Key Strengths:
- ...

Missing Skills:
- ...

Resume:
${resumeText}
`;

  const result = await model.generateContent(prompt);
  const response = await result.response.text();

  console.log(`✅ Completed: ${fileName}`);

  await generateReport(fileName.replace(".pdf", ""), response);
}

// BULK DOMAIN SCREENING
async function runDomainScreening() {

  rl.question("\n🧑‍💻 Enter Domain (fullstack/networking/iot/datasci):\n>> ", async (domain) => {

    if (!domainSkills[domain]) {
      console.log("❌ Invalid domain!");
      rl.close();
      return;
    }

    rl.question("\n📂 Enter Resume Folder Path:\n>> ", async (folderPath) => {

      try {

        const files = fs.readdirSync(folderPath);
        const pdfFiles = files.filter(file => file.endsWith(".pdf"));

        if (pdfFiles.length === 0) {
          console.log("❌ No PDF files found!");
          rl.close();
          return;
        }

        console.log(`\n📊 Found ${pdfFiles.length} resumes...\n`);

        for (let file of pdfFiles) {

          const filePath = path.join(folderPath, file);
          await analyzeResume(filePath, file, domain);

        }

        console.log("\n🎉 Domain Screening Completed!");
        rl.close();

      } catch (error) {
        console.log("\n❌ Error:", error.message);
        rl.close();
      }

    });

  });

}

runDomainScreening();