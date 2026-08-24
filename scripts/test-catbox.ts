import fs from "fs";

async function testCatbox() {
  // Crear un PNG pequeño de prueba (1x1 pixel rojo)
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

  console.log("Sending to catbox...");
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

testCatbox().catch(console.error);
