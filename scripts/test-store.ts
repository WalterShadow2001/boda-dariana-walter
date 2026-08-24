async function uploadAndStore() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  // Step 1: Upload
  console.log("Step 1: Upload...");
  const formData = new FormData();
  formData.append("UPLOADCARE_PUB_KEY", "4fe5287500ef2445196a");
  // NO almacenar automáticamente
  formData.append("UPLOADCARE_STORE", "0");
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("file", blob, "test.png");

  const upRes = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });
  const upData = await upRes.json() as { file: string };
  console.log("Upload result:", upData);

  // Step 2: Store explícitamente con la REST API
  // Esto requiere la SECRET key, no la PUBLIC key
  console.log("\nStep 2: Check status...");
  const statusRes = await fetch(`https://ucarecdn.com/${upData.file}/`, {
    method: "HEAD",
  });
  console.log("Status check:", statusRes.status);

  // Verificar info del archivo
  console.log("\nStep 3: Get file info...");
  const infoRes = await fetch(`https://upload.uploadcare.com/info/?file_id=${upData.file}&pub_key=4fe5287500ef2445196a`);
  console.log("Info status:", infoRes.status);
  const infoText = await infoRes.text();
  console.log("Info:", infoText.substring(0, 500));
}

uploadAndStore().catch(console.error);
