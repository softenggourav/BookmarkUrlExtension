// Add event listeners for buttons
document.getElementById('updateBaseUrl').addEventListener('click', updateBaseUrl);
document.getElementById('swapUrls').addEventListener('click', swapUrls);

// Load last used URLs on popup load
window.addEventListener('DOMContentLoaded', loadLastUsedUrls);

// Function to update base URL in boomarks
async function updateBaseUrl() {
  const prod = document.getElementById('prod').value;
  const spoof = document.getElementById('spoof').value;
  if (!prod || !spoof) {
    alert('Please enter both Prod and Spoof URLs');
    return;
  }

  // Save last used URLs
  chrome.storage.local.set({ lastUsedProd: prod, lastUsedSpoof: spoof});

  const bookmarks = await getBookmarks();
  bookmarks.forEach(async (bookmark) => {
    if (bookmark.url.includes(prod)) {
      const updatedUrl = bookmark.url.replace(prod, spoof);
      await updateBookmark(bookmark.id, updatedUrl);
    }
  });
}

// Function to load last used URLs from storage
function loadLastUsedUrls() {
  chrome.storage.local.get(['lastUsedProd', 'lastUsedSpoof'], (items) => {
      const defaultUrl = 'https://console.zenefits.com/';
      document.getElementById('prod').value = items.lastUsedProd || defaultUrl;
      document.getElementById('spoof').value = items.lastUsedSpoof || defaultUrl;
  })
}

// Function to swap the 'Prod URL' and 'Spoof URL' input fields
function swapUrls() {
  const prodInput = document.getElementById('prod');
  const spoofInput = document.getElementById('spoof');
  const tempUrl = prodInput.value;
  prodInput.value = spoofInput.value;
  spoofInput.value = tempUrl;
}

function getBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = flattenBookmarks(bookmarkTreeNodes);
      resolve(bookmarks);
    });
  });
}
function flattenBookmarks(bookmarkTreeNodes) {
  const bookmarks = [];
  bookmarkTreeNodes.forEach((node) => {
    if (node.children) {
      bookmarks.push(...flattenBookmarks(node.children));
    } else if (node.url) {
      bookmarks.push(node);
    }
  });
  return bookmarks;
}
function updateBookmark(bookmarkId, url) {
  return new Promise((resolve) => {
    chrome.bookmarks.update(bookmarkId, { url }, () => {
      resolve();
    });
  });
}