async function testCatbox() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  console.log("Buffer size:", pngBuffer.length, "bytes");

  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("userhash", "");
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("fileToUpload", blob, "test.png");

  console.log("Sending to catbox with browser-like User-Agent...");
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://catbox.moe/",
      "Origin": "https://catbox.moe",
    },
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

testCatbox().catch(console.error);
