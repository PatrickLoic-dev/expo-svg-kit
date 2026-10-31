// Manual mock of expo-file-system for tests. Models just enough of the File/Directory/Paths
// API that RemoteSvg.tsx uses: an in-memory "filesystem" plus a fake HTTP layer for downloads.
let store = new Map();
let remoteContent = new Map();
let downloadCount = 0;

function uriOf(part) {
  return typeof part === 'string' ? part : part.uri;
}

class Directory {
  constructor(...parts) {
    this.uri = parts.map(uriOf).join('/');
  }
  get exists() {
    return store.has(this.uri) && store.get(this.uri) === '__dir__';
  }
  create() {
    store.set(this.uri, '__dir__');
  }
}

class File {
  constructor(...parts) {
    this.uri = parts.map(uriOf).join('/');
  }
  get exists() {
    return store.has(this.uri);
  }
  async text() {
    return store.get(this.uri);
  }
  delete() {
    store.delete(this.uri);
  }
  static async downloadFileAsync(url, destination) {
    downloadCount += 1;
    if (!remoteContent.has(url)) {
      throw new Error(`No mock content registered for ${url}`);
    }
    store.set(destination.uri, remoteContent.get(url));
    return destination;
  }
}

const Paths = { cache: { uri: 'cache' } };

module.exports = {
  Directory,
  File,
  Paths,
  __setRemoteContent: (url, content) => remoteContent.set(url, content),
  __getDownloadCount: () => downloadCount,
  __reset: () => {
    store = new Map();
    remoteContent = new Map();
    downloadCount = 0;
  },
};
