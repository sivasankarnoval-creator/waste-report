// 1. Load apartment names into <datalist> for autocomplete
fetch("apartments.json")
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById("apartmentList");
        list.innerHTML = "";
        data.forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            list.appendChild(option);
        });
    })
    .catch(err => console.error("Error loading apartments.json:", err));

// 2. Dynamic report template with live calculations
function reportTemplate(apartmentName, units, location) {
    const numUnits = Number(units);

    // Configurable constants
    const wastePerUnitKg = 0.9; // kg/unit/day
    const costPerUnit = 169;    // INR/unit/month

    // Calculations
    const totalWasteKg = (numUnits * wastePerUnitKg).toFixed(1);
    const totalCost = (numUnits * costPerUnit).toFixed(0);
    const securityDeposit = (totalCost * 3).toFixed(0);

    return `
        <h2>Waste Management Proposal – ${apartmentName}</h2>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>No. of Units:</strong> ${numUnits}</p>

        <h3>Estimated Waste Generation</h3>
        <p>Estimated total waste: <strong>${totalWasteKg} kg/day</strong>.</p>

        <h3>Proposed Solution: Greenlease Subscription</h3>
        <ul>
            <li>On-site composting machine with maintenance</li>
            <li>Garden waste shredder & sanitary waste destroyer</li>
            <li>Daily trained operators & supervisor</li>
            <li>Segregation table, PPEs & compliance reports</li>
        </ul>

        <h3>Financial Summary</h3>
        <p>Cost per unit: ₹${costPerUnit}/month</p>
        <p><strong>Total Monthly Cost:</strong> ₹${totalCost}</p>
        <p><strong>Refundable Security Deposit (3 months):</strong> ₹${securityDeposit}</p>

        <h3>Implementation Timeline</h3>
        <ol>
            <li>Audit & evaluation: 5 days</li>
            <li>Installation & commissioning: 10 days</li>
            <li>Ongoing daily operations</li>
        </ol>
        <p><em>For a detailed, society-specific strategy, please provide your contact details below.</em></p>
    `;
}

// 3. Handle form submission
document.getElementById("reportForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const apt = document.getElementById("apartment").value.trim();
    const units = document.getElementById("units").value.trim();
    const location = document.getElementById("location").value.trim();

    if (!apt || !units || !location) {
        alert("Please fill in all fields before generating the report.");
        return;
    }

    // Render the report with unlock and download buttons
    document.getElementById("report").innerHTML =
        reportTemplate(apt, units, location) +
        `<div class="unlock-section">
            <hr>
            <p><strong>Want a detailed, society-specific strategy?</strong></p>
            <button id="unlockBtn" type="button">Unlock Full Report</button>
         </div>` +
        `<button id="downloadPdfBtn" type="button" style="margin-top: 10px;">Download as PDF</button>`;

    // Bind unlock button event
    document.getElementById("unlockBtn").addEventListener("click", unlockForm, { once: true });

    // Setup PDF download button functionality
    setupDownloadPdf();
});

// 4. Unlock form logic with Google Sheets integration
function unlockForm() {
    document.getElementById("report").innerHTML += `
        <form id="unlockForm" style="margin-top:15px;">
            <label>Phone Number</label>
            <input type="tel" name="phone" pattern="[0-9]{10}" placeholder="10-digit number" required>
            <label>Email</label>
            <input type="email" name="email" placeholder="you@example.com" required>
            <button type="submit">Get Detailed Report</button>
        </form>
    `;

    document.getElementById("unlockForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const phone = this.phone.value.trim();
        const email = this.email.value.trim();

        const leadData = {
            apartment: document.getElementById("apartment").value.trim(),
            units: document.getElementById("units").value.trim(),
            location: document.getElementById("location").value.trim(),
            phone,
            email
        };

        // Send data to Google Sheets Web App
        fetch("YOUR_GOOGLE_SCRIPT_WEB_APP_URL", {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(leadData)
        }).catch(err => console.error("Lead send error:", err));

        alert("Thanks! Our team will send you a detailed strategy soon.");
    }, { once: true });
}

// 5. Setup download PDF button logic
function setupDownloadPdf() {
    const downloadBtn = document.getElementById("downloadPdfBtn");
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", () => {
        const reportElement = document.getElementById("report");

        // Use html2canvas to capture the report div as an image
        html2canvas(reportElement, { scale: 2 }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate image size to fit PDF width
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

            let position = 10;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            pdf.save(`Waste_Management_Report_${Date.now()}.pdf`);
        });
    });
}
