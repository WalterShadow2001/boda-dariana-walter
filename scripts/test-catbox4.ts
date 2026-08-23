async function testCatbox() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  console.log("Buffer size:", pngBuffer.length, "bytes");

  // El bug de catbox: el "fileToUpload" debe ser un File object real con nombre
  // cuando se usa FormData desde Bun/Node, hay que usar File en vez de Blob
  const file = new File([pngBuffer], "test.png", { type: "image/png" });

  const formData = new FormData();
  formData.append("reqtype", "fileupload");
  formData.append("userhash", "");
  formData.append("fileToUpload", file);

  console.log("Sending to catbox...");
  const res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

testCatbox().catch(console.error);
