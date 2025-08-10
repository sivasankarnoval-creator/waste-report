// ==== ELEMENT REFERENCES ====
const reportForm = document.getElementById('reportForm');
const reportContainer = document.getElementById('report');
const unlockSection = document.getElementById('unlockSection');
const unlockForm = document.getElementById('unlockForm');
const downloadBtn = document.getElementById('downloadPdfBtn');

// ==== LOADING SPINNER HTML ====
const spinnerHTML = `<div class="spinner" style="text-align:center; margin-top:15px;">
    <div style="border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; width: 36px; height: 36px; animation: spin 1s linear infinite; margin: auto;"></div>
</div>`;

// ==== AUTOCOMPLETE (Load Apartments from JSON) ====
fetch('apartments.json')
  .then(res => res.json())
  .then(data => {
    const apartmentList = document.getElementById('apartmentList');
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.name;
      apartmentList.appendChild(option);
    });
  })
  .catch(err => console.error('Error loading apartments.json', err));

// ==== FORM SUBMIT: GENERATE REPORT ====
reportForm.addEventListener('submit', e => {
    e.preventDefault();

    // Show loading spinner
    reportContainer.style.display = 'block';
    reportContainer.innerHTML = spinnerHTML;

    // Disable button while loading
    const submitBtn = reportForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = "Generating...";

    setTimeout(() => {
        // Simulate calculation
        const aptName = document.getElementById('apartment').value;
        const units = parseInt(document.getElementById('units').value, 10);
        const occupancy = parseInt(document.getElementById('occupancy').value, 10);

        // Example calculations
        const occupiedUnits = Math.round(units * (occupancy / 100));
        const wastePerMonth = occupiedUnits * 2; // arbitrary example: 2kg per occupied unit
        const savingsEstimate = occupiedUnits * 50; // arbitrary: ₹50 savings per unit

        reportContainer.innerHTML = `
            <h3>Report Summary</h3>
            <p><strong>Apartment:</strong> ${aptName}</p>
            <p><strong>Units:</strong> ${units}</p>
            <p><strong>Occupied Units:</strong> ${occupiedUnits}</p>
            <p><strong>Estimated Waste Generated:</strong> ${wastePerMonth} kg/month</p>
            <p><strong>Estimated Savings:</strong> ₹${savingsEstimate.toLocaleString()}</p>
        `;

        // Show unlock section
        unlockSection.style.display = 'block';
        unlockSection.style.opacity = 0;
        setTimeout(() => unlockSection.style.opacity = 1, 150);

        // Reset generate button
        submitBtn.disabled = false;
        submitBtn.textContent = "Generate Report";
    }, 1200); // delay for UX
});

// ==== UNLOCK FORM ====
unlockForm.addEventListener('submit', e => {
    e.preventDefault();

    const unlockBtn = unlockForm.querySelector('button');
    unlockBtn.disabled = true;
    unlockBtn.textContent = "Saving...";

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };

    // Replace with your actual Google Apps Script Web App URL
    const scriptURL = "https://script.google.com/macros/s/AKfycbyW3wXjWU2hxvXMryL9xzyk_aOLPILQ2QCokU61jOP9rrApAP1Pu0gxEHBRavgRBZv_/exec";

    fetch(scriptURL, {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(res => res.text())
    .then(() => {
        unlockBtn.textContent = "Unlocked ✓";
        downloadBtn.style.display = 'block';
    })
    .catch(err => {
        console.error('Error!', err);
        unlockBtn.disabled = false;
        unlockBtn.textContent = "Unlock & Save to Google Sheets";
    });
});

// ==== DOWNLOAD PDF ====
downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Waste Management Report", 10, 10);
    doc.fromHTML(reportContainer.innerHTML, 10, 20);
    doc.save("waste-report.pdf");
});

// ==== SMALL CSS ANIMATION FOR SPINNER ====
const style = document.createElement('style');
style.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
