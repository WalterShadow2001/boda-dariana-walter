async function testFreeimage() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );
  const base64 = pngBuffer.toString("base64");

  // freeimage.host usa una API con key pública
  const formData = new URLSearchParams();
  formData.append("source", base64);
  formData.append("type", "base64");
  formData.append("key", "6d207e02198a847aa98d0a2a901485a5"); // key pública demo de su sitio

  console.log("Sending to freeimage.host...");
  const res = await fetch("https://freeimage.host/api/1/upload", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 800));
}

testFreeimage().catch(console.error);
