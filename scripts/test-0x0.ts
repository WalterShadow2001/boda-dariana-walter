async function test0x0() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  console.log("Buffer size:", pngBuffer.length, "bytes");

  const formData = new FormData();
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("file", blob, "test.png");

  console.log("Sending to 0x0.st...");
  const res = await fetch("https://0x0.st", {
    method: "POST",
    body: formData,
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}

test0x0().catch(console.error);
