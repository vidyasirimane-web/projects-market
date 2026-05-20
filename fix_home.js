const fs = require('fs');
const path = 'c:\\Users\\USER\\Downloads\\PROJECT MEGHANA.zip\\PROJECT MEGHANA\\src\\pages\\Home.jsx';
let content = fs.readFileSync(path, 'utf8');
console.log('File length:', content.length);

// Find the bad search button pattern and replace it
// Bad:  onClick={() => navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}"`)}>
// Good: onClick={() => navigate('/marketplace?search=' + encodeURIComponent(searchQuery))}>
const badPattern = 'onClick={() => navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}"`)}>Search</button>';
const goodPattern = "onClick={() => navigate('/marketplace?search=' + encodeURIComponent(searchQuery))}>Search</button>";

console.log('Contains bad:', content.includes(badPattern));
// Try alternate patterns
const alt1 = 'encodeURIComponent(searchQuery)"`)}>Search';
console.log('Contains alt1:', content.includes(alt1));

if (content.includes(alt1)) {
  const fixed = content.replace(alt1, "encodeURIComponent(searchQuery))}>Search");
  fs.writeFileSync(path, fixed, 'utf8');
  console.log('Fixed!');
} else {
  // Show context
  const idx = content.indexOf('encodeURIComponent(searchQuery)');
  const idx2 = content.indexOf('encodeURIComponent(searchQuery)', idx + 1);
  console.log('Second at:', idx2);
  console.log('Context:', JSON.stringify(content.substring(idx2 - 10, idx2 + 60)));
}
