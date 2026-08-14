const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ninePatch', {
  openImage: () => ipcRenderer.invoke('open-image'),
  readDroppedFile: (filePath) => ipcRenderer.invoke('read-dropped-file', filePath),
  saveSource: (payload) => ipcRenderer.invoke('save-source', payload),
  saveCompiled: (payload) => ipcRenderer.invoke('save-compiled', payload)
});
