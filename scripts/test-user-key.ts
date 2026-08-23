async function testUserKey() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  const formData = new FormData();
  formData.append("UPLOADCARE_PUB_KEY", "4fe5287500ef2445196a");
  formData.append("UPLOADCARE_STORE", "1");
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("file", blob, "test.png");

  console.log("Sending to Uploadcare with user key...");
  const res = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);

  // Si devuelve un file_id, verificar que la imagen sea accesible
  try {
    const data = JSON.parse(text);
    if (data.file) {
      console.log("\nVerificando imagen en CDN...");
      const cdnRes = await fetch(`https://ucarecdn.com/${data.file}/`);
      console.log("CDN Status:", cdnRes.status);
      console.log("CDN Content-Type:", cdnRes.headers.get("content-type"));
    }
  } catch {}
}

testUserKey().catch(console.error);
