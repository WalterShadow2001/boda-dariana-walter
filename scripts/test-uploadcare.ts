async function testUploadcare() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  const formData = new FormData();
  const file = new File([pngBuffer], "test.png", { type: "image/png" });
  formData.append("UPLOADCARE_PUB_KEY", "demopublickey"); // Clave pública demo de Uploadcare
  formData.append("UPLOADCARE_STORE", "1");
  formData.append("file", file);

  console.log("Sending to Uploadcare...");
  const res = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 800));
}

testUploadcare().catch(console.error);
