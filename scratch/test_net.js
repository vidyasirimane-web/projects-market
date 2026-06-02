async function checkNet() {
  try {
    const res = await fetch('https://httpbin.org/get');
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Success connecting to internet.");
  } catch (e) {
    console.error("Net error:", e.message);
  }
}
checkNet();
