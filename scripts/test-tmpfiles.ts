async function testTmpfiles() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  console.log("Buffer size:", pngBuffer.length, "bytes");

  const formData = new FormData();
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("file", blob, "test.png");

  console.log("Sending to tmpfiles.org...");
  const res = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) WeddingsApp/1.0",
    },
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
}

testTmpfiles().catch(console.error);
