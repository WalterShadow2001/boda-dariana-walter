async function testStore() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );

  // UPLOADCARE_STORE = "1" significa "store the file upon upload"
  // Pero requiere que el plan de Uploadcare tenga "storage" habilitado
  // En plan gratis SOMETIMES funciona, a veces no
  console.log("Test con STORE=1...");
  const formData = new FormData();
  formData.append("UPLOADCARE_PUB_KEY", "4fe5287500ef2445196a");
  formData.append("UPLOADCARE_STORE", "1");
  const blob = new Blob([pngBuffer], { type: "image/png" });
  formData.append("file", blob, "test.png");

  const upRes = await fetch("https://upload.uploadcare.com/base/", {
    method: "POST",
    body: formData,
  });
  const upData = await upRes.json() as { file: string };
  console.log("Upload result:", upData);

  // Esperar un momento a que se procese
  await new Promise(r => setTimeout(r, 2000));

  // Verificar si ahora es accesible
  console.log("\nVerificando CDN...");
  const cdnRes = await fetch(`https://ucarecdn.com/${upData.file}/`);
  console.log("CDN Status:", cdnRes.status);
  console.log("CDN Content-Type:", cdnRes.headers.get("content-type"));

  // Verificar info
  console.log("\nInfo del archivo...");
  const infoRes = await fetch(`https://upload.uploadcare.com/info/?file_id=${upData.file}&pub_key=4fe5287500ef2445196a`);
  const info = await infoRes.json();
  console.log("is_stored:", info.is_stored);
}

testStore().catch(console.error);
