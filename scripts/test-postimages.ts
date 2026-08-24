async function testPostimages() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  const formData = new FormData();
  const file = new File([pngBuffer], "test.png", { type: "image/png" });
  formData.append("upload", file);
  formData.append("session", "");
  formData.append("upload_type", "file");
  formData.append("adult", "0");

  console.log("Sending to postimages.org...");
  const res = await fetch("https://postimages.org/action.php?session=0", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) WeddingsApp/1.0",
      "Referer": "https://postimages.org/",
    },
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response (first 500 chars):", text.substring(0, 500));
}

testPostimages().catch(console.error);
