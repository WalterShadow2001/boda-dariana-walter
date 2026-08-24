async function testImgbbPublic() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  // Subir a imgbb sin API key usando su endpoint público
  // Imgbb tiene un endpoint público de carga via web

  const formData = new FormData();
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("source", blob, "test.png");
  formData.append("type", "file");
  formData.append("action", "upload");

  console.log("Sending to imgbb...");
  const res = await fetch("https://imgbb.com/json", {
    method: "POST",
    body: formData,
    headers: {
      "Referer": "https://imgbb.com/upload",
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) WeddingsApp/1.0",
    },
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
}

testImgbbPublic().catch(console.error);
