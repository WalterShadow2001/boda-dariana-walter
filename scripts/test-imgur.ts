async function testImgur() {
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    "base64"
  );
  const base64 = pngBuffer.toString("base64");

  // Client-ID público de Imgur (demo - cualquier persona puede crear uno gratis)
  const clientId = "Client-ID fbf0ccdd6ad1c9a";

  console.log("Sending to Imgur...");
  const res = await fetch("https://api.imgur.com/3/image", {
    method: "POST",
    headers: {
      "Authorization": clientId,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      image: base64,
      type: "base64",
      name: "test.png",
      description: "Test de boda",
    }),
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 800));
}

testImgur().catch(console.error);
