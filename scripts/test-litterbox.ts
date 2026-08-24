async function testLitterbox() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  console.log("Buffer size:", pngBuffer.length, "bytes");

  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("time", "72h");
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("fileToUpload", blob, "test.png");

  console.log("Sending to litterbox...");
  const res = await fetch("https://litterbox.catbox.moe/resources/international.php", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

testLitterbox().catch(console.error);
