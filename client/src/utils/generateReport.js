import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "chart.js/auto";

export const generateMentalHealthReport = async ({
  user,
  moods,
  streak,
  badges,
}) => {
  if (!moods || moods.length === 0) {
    alert("No mood data available.");
    return;
  }

  const doc = new jsPDF();

  /* =====================================================
     📘 COVER PAGE
  ===================================================== */

  doc.setFontSize(30);
  doc.text("AuraTrack", 105, 80, { align: "center" });

  doc.setFontSize(18);
  doc.text("Mental Health Analysis Report", 105, 100, { align: "center" });

  doc.setFontSize(14);
  doc.text(`Prepared For: ${user?.displayName || "User"}`, 105, 130, {
    align: "center",
  });

  doc.text(
    `Generated On: ${new Date().toLocaleDateString()}`,
    105,
    145,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.text(
    "Your personal mental wellness companion",
    105,
    165,
    { align: "center" }
  );

  /* Watermark */
 /* Professional Subtle Watermark */

doc.setTextColor(230);
doc.setFontSize(40);
doc.text("AuraTrack", 105, 180, {
  align: "center",
});

doc.setTextColor(0);

  doc.addPage();

  /* =====================================================
     📊 SUMMARY PAGE
  ===================================================== */

  const avgMood =
    moods.reduce((sum, m) => sum + (m.mood || 0), 0) / moods.length;

  doc.setFontSize(18);
  doc.text("Mental Health Summary", 20, 20);

  doc.setFontSize(12);
  doc.text(`Total Entries: ${moods.length}`, 20, 35);
  doc.text(`Current Streak: ${streak} days`, 20, 45);
  doc.text(`Average Mood Score: ${avgMood.toFixed(2)}`, 20, 55);

  /* ================= BADGES ================= */

  doc.setFontSize(14);
  doc.text("Earned Badges:", 20, 75);

  if (badges.length === 0) {
    doc.text("No badges earned yet.", 20, 85);
  } else {
    badges.forEach((badge, index) => {
      doc.text(`• ${badge}`, 20, 85 + index * 8);
    });
  }

  /* =====================================================
     🤖 AI GENERATED SUMMARY
  ===================================================== */

  doc.setFontSize(14);
  doc.text("AI Wellness Insight:", 20, 120);

  let aiSummary = "";

  if (avgMood >= 4) {
    aiSummary =
      "Your recent mood trends indicate positive emotional stability. You are maintaining healthy mental patterns and consistency.";
  } else if (avgMood >= 3) {
    aiSummary =
      "Your mood levels appear moderate with occasional fluctuations. Practicing mindfulness and self-care may help maintain balance.";
  } else {
    aiSummary =
      "Your recent mood entries show signs of emotional stress. Consider engaging in relaxation exercises and supportive activities.";
  }

  doc.setFontSize(12);
  doc.text(doc.splitTextToSize(aiSummary, 170), 20, 130);

  /* =====================================================
     📊 MOOD BAR CHART
  ===================================================== */

  const barCanvas = document.createElement("canvas");
  barCanvas.width = 600;
  barCanvas.height = 300;
  const barCtx = barCanvas.getContext("2d");

  new Chart(barCtx, {
    type: "bar",
    data: {
      labels: moods.map((m) =>
        m.timestamp?.toLocaleDateString()
      ),
      datasets: [
        {
          label: "Mood Score (1-5)",
          data: moods.map((m) => m.mood),
          backgroundColor: "#6a5acd",
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
      scales: {
        y: {
          min: 1,
          max: 5,
          ticks: { stepSize: 1 },
        },
      },
    },
  });

  const barImage = barCanvas.toDataURL("image/png");

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Mood Trend (Bar Chart)", 20, 20);
  doc.addImage(barImage, "PNG", 15, 30, 180, 90);

  /* =====================================================
     🥧 EMOTION DISTRIBUTION PIE CHART
  ===================================================== */

  const emotionCount = {};
  moods.forEach((m) => {
    const e = m.emotion || "Manual";
    emotionCount[e] = (emotionCount[e] || 0) + 1;
  });

  const pieCanvas = document.createElement("canvas");
  pieCanvas.width = 400;
  pieCanvas.height = 400;
  const pieCtx = pieCanvas.getContext("2d");

  new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(emotionCount),
      datasets: [
        {
          data: Object.values(emotionCount),
          backgroundColor: [
            "#6a5acd",
            "#ff6b6b",
            "#4ecdc4",
            "#ffe66d",
            "#1a535c",
          ],
        },
      ],
    },
    options: {
      responsive: false,
      animation: false,
    },
  });

  const pieImage = pieCanvas.toDataURL("image/png");

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Emotion Distribution", 20, 20);
  doc.addImage(pieImage, "PNG", 40, 40, 130, 130);

  /* =====================================================
     📋 MOOD TABLE
  ===================================================== */

  const tableData = moods.map((m) => [
    m.timestamp?.toLocaleDateString(),
    m.mood,
    m.emotion || "Manual",
  ]);

  doc.addPage();
  doc.setFontSize(16);
  doc.text("Mood History Table", 20, 20);

  autoTable(doc, {
    startY: 30,
    head: [["Date", "Mood Score", "Emotion"]],
    body: tableData,
  });

  /* =====================================================
     FOOTER
  ===================================================== */

  doc.setFontSize(10);
  doc.text(
    "Generated by AuraTrack - Empowering Mental Wellness Through AI",
    20,
    290
  );

  doc.save("AuraTrack_Mental_Health_Report.pdf");
};