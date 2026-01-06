import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FaFolder, FaFilePdf, FaArrowLeft, FaArrowRight, FaArrowUp,
    FaPlus, FaCloudUploadAlt, FaFolderPlus, FaTrash, FaPen,
    FaCut, FaPaste, FaHome, FaCopy, FaArrowRight as FaMoveIcon
} from 'react-icons/fa';
import './DriveExplorer.css';
import FolderPicker from './FolderPicker';

const DriveExplorer = ({ userInfo, onPdfClick }) => {
    const [items, setItems] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null); // ID of current folder
    const [currentFolderData, setCurrentFolderData] = useState(null); // Full object of current folder
    const [storageUsed, setStorageUsed] = useState(null);
    const [loading, setLoading] = useState(false);

    // Navigation History
    // Stack of folder IDs
    const [history, setHistory] = useState([null]); // Start with root (null)
    const [historyIndex, setHistoryIndex] = useState(0);

    // Selection
    const [selectedItem, setSelectedItem] = useState(null);

    // Context Menu & clipboard
    const [contextMenu, setContextMenu] = useState(null);
    const [clipboard, setClipboard] = useState(null);

    // Modals & Inputs
    const [modal, setModal] = useState({ type: null, item: null });
    const [picker, setPicker] = useState({ open: false, mode: null, item: null }); // mode: 'move' | 'copy'
    const [inputVal, setInputVal] = useState('');

    // Refs for file inputs
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // Initial Fetch handling
    useEffect(() => {
        // When history changes, fetch the folder at current index
        const folderId = history[historyIndex];
        fetchItems(folderId);
        setSelectedItem(null); // Clear selection on nav
    }, [historyIndex, userInfo.id]);

    const fetchItems = async (folderId) => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5001/drive/items', {
                params: {
                    userId: userInfo.id,
                    folderId: folderId || 'null'
                }
            });
            setItems(response.data.items);
            setCurrentFolderData(response.data.folder);
            setStorageUsed(response.data.storageUsed);
            setCurrentFolder(folderId);
        } catch (error) {
            console.error("Error fetching drive items", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Navigation ---
    const navigateTo = (folderId) => {
        // Remove forward history if capturing new path
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(folderId);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleBack = () => {
        if (historyIndex > 0) setHistoryIndex(historyIndex - 1);
    };

    const handleForward = () => {
        if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
    };

    const handleUp = () => {
        // Go to parent of current folder
        // If current is root, do nothing
        if (!currentFolder) return;

        // If we have folder data, use parent. Otherwise (fallback), try null (root)
        const parentId = currentFolderData ? currentFolderData.parent : null;
        navigateTo(parentId);
    };

    const handleHome = () => {
        if (currentFolder !== null) navigateTo(null);
    }

    // --- Selection ---
    const handleItemClick = (e, item) => {
        e.stopPropagation();
        // If clicking same item, toggle? No, standard is select.
        setSelectedItem(item);
    };

    const handleBoxClick = () => {
        setSelectedItem(null);
        setContextMenu(null);
    };

    // --- Actions ---

    // 1. Create Folder
    const handleCreateFolder = async () => {
        if (!inputVal.trim()) return;
        try {
            await axios.post('http://localhost:5001/drive/create-folder', {
                name: inputVal,
                parentId: currentFolder,
                userId: userInfo.id
            });
            setModal({ type: null });
            setInputVal('');
            fetchItems(currentFolder);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Failed to create folder');
            }
        }
    };

    // 2. Upload Files
    const handleUploadFiles = async (e) => {
        const files = e.target.files;
        if (!files.length) return;
        await uploadFilesBatch(files, currentFolder);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadFilesBatch = async (files, targetFolderId) => {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('file', file));
        formData.append('user', JSON.stringify(userInfo));
        formData.append('parentId', targetFolderId || 'null');

        try {
            setLoading(true);
            await axios.post('http://localhost:5001/drive/upload', formData);
            fetchItems(currentFolder);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Upload failed');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    // 3. Upload Folder (Recursive)
    const handleUploadFolder = async (e) => {
        const files = e.target.files;
        if (!files.length) return;

        // Process files to build structure
        // structure: { 'folderName': { 'subFile': file, 'subFolder': {...} } } - too complex
        // Better: Group files by distinct folder paths, create folders iteratively.

        setLoading(true);
        try {
            // We need to create folders in order of depth
            // Map: "path/to/folder" -> "databaseId"
            const folderMap = new Map();
            folderMap.set('', currentFolder); // Root map

            // Helper to get or create folder
            const getOrCreateFolder = async (path) => {
                if (folderMap.has(path)) return folderMap.get(path);

                // Split path: "A/B" -> parent "A", name "B"
                const parts = path.split('/');
                const name = parts.pop();
                const parentPath = parts.join('/');

                const parentId = await getOrCreateFolder(parentPath);

                // Create this folder
                try {
                    const res = await axios.post('http://localhost:5001/drive/create-folder', {
                        name: name,
                        parentId: parentId,
                        userId: userInfo.id
                    });
                    const newId = res.data.folder._id;
                    folderMap.set(path, newId);
                    return newId;
                } catch (err) {
                    console.error("Error creating folder", path, err);
                    return null;
                }
            };

            // Iterate files
            // Array.from(files).forEach is sync, we need async loop or Promise.all
            // IMPORTANT: webkitRelativePath example: "Docs/Images/pic.jpg"

            // 1. Create all necessary folders first
            // Get unique folder paths
            const uniquePaths = new Set();
            for (let file of files) {
                const parts = file.webkitRelativePath.split('/');
                parts.pop(); // remove filename
                if (parts.length > 0) {
                    // We need to add every level: "A", "A/B", "A/B/C"
                    let currentPath = "";
                    parts.forEach(part => {
                        currentPath = currentPath ? `${currentPath}/${part}` : part;
                        uniquePaths.add(currentPath);
                    });
                }
            }

            // Create folders sorted by length (depth) to ensure parents exist
            const sortedPaths = Array.from(uniquePaths).sort((a, b) => a.split('/').length - b.split('/').length);
            for (let path of sortedPaths) {
                await getOrCreateFolder(path);
            }

            // 2. Upload files in batches grouped by folder to save requests?
            // Existing endpoint takes multiple files for ONE parentId. 
            // So we group by folder ID.
            const filesByFolder = new Map(); // folderId -> [files]

            for (let file of files) {
                const parts = file.webkitRelativePath.split('/');
                parts.pop();
                const path = parts.join('/');
                const targetId = folderMap.get(path);

                if (targetId !== undefined) {
                    if (!filesByFolder.has(targetId)) filesByFolder.set(targetId, []);
                    filesByFolder.get(targetId).push(file);
                }
            }

            // Execute uploads
            for (let [fId, fFiles] of filesByFolder.entries()) {
                await uploadFilesBatch(fFiles, fId);
            }

        } catch (error) {
            console.error("Folder upload error", error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert("Folder upload partial or failed");
            }
        } finally {
            setLoading(false);
            if (folderInputRef.current) folderInputRef.current.value = '';
            fetchItems(currentFolder);
        }
    };

    // 4. Rename
    const handleRename = async () => {
        if (!inputVal.trim()) return;
        try {
            await axios.put(`http://localhost:5001/drive/rename/${modal.item._id}`, {
                newName: inputVal
            });
            setModal({ type: null });
            setInputVal('');
            fetchItems(currentFolder);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Rename failed');
            }
        }
    };

    // 5. Delete
    const handleDelete = async (item) => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        try {
            await axios.delete(`http://localhost:5001/drive/delete/${item._id}`);
            setSelectedItem(null);
            fetchItems(currentFolder);
        } catch (error) {
            alert('Delete failed');
        }
    };

    // 6. Cut/Paste
    const handleCut = (item) => {
        setClipboard({ item, action: 'move' });
    };

    const handlePaste = async () => {
        if (!clipboard) return;
        try {
            await axios.put(`http://localhost:5001/drive/move/${clipboard.item._id}`, {
                newParentId: currentFolder
            });
            setClipboard(null);
            fetchItems(currentFolder);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Move failed');
            }
        }
    };

    // 7. Picker Actions
    const handlePickerSelect = async (targetFolderId) => {
        if (!picker.item) return;

        try {
            if (picker.mode === 'move') {
                await axios.put(`http://localhost:5001/drive/move/${picker.item._id}`, {
                    newParentId: targetFolderId
                });
            } else if (picker.mode === 'copy') {
                await axios.post('http://localhost:5001/drive/copy', {
                    itemId: picker.item._id,
                    targetParentId: targetFolderId,
                    userId: userInfo.id
                });
            }
            setPicker({ open: false, mode: null, item: null });
            fetchItems(currentFolder);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert(`${picker.mode === 'move' ? 'Move' : 'Copy'} failed`);
            }
        }
    };

    // --- Render Helpers ---
    const getBreadcrumbString = () => {
        // Since we only store history stack, constructing full breadcrumb from root is hard without recursive details.
        // But users asked for "Back/Up" buttons, so maybe just showing "Current Folder Name" is enough or
        // we display simple path if available?
        // Let's rely on buttons for nav, and show Current Folder Name.
        if (!currentFolder) return "My Data (Root)";
        return currentFolderData ? currentFolderData.name : "Loading...";
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="drive-container" onClick={handleBoxClick}>
            {/* Header / Navigation */}
            <div className="drive-header">
                <div className="nav-row">
                    <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} disabled={historyIndex === 0} title="Back">
                        <FaArrowLeft />
                    </button>
                    <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleForward(); }} disabled={historyIndex === history.length - 1} title="Forward">
                        <FaArrowRight />
                    </button>
                    <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleUp(); }} disabled={!currentFolder} title="Up One Level">
                        <FaArrowUp />
                    </button>
                    <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleHome(); }} disabled={!currentFolder} title="Home">
                        <FaHome />
                    </button>

                    <div className="breadcrumbs">
                        <span style={{ fontWeight: 'bold' }}>{getBreadcrumbString()}</span>
                    </div>
                </div>

                <div className="toolbar-row">
                    <div className="toolbar-group">
                        <button
                            className="drive-btn btn-new-folder"
                            onClick={(e) => {
                                e.stopPropagation();
                                setInputVal('');
                                setModal({ type: 'create_folder' });
                            }}
                        >
                            <FaFolderPlus /> New Folder
                        </button>

                        <button className="drive-btn btn-upload" onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}>
                            <FaCloudUploadAlt /> Upload Files
                        </button>
                        <input type="file" multiple hidden ref={fileInputRef} onChange={handleUploadFiles} />

                        <button className="drive-btn btn-upload-folder" onClick={(e) => { e.stopPropagation(); folderInputRef.current.click(); }}>
                            <FaFolder /> Upload Folder
                        </button>
                        <input
                            type="file"
                            multiple
                            webkitdirectory=""
                            directory=""
                            hidden
                            ref={folderInputRef}
                            onChange={handleUploadFolder}
                        />
                    </div>

                    <div className="toolbar-group">
                        <button
                            className="drive-btn btn-rename"
                            disabled={!selectedItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                setInputVal(selectedItem.name);
                                setModal({ type: 'rename', item: selectedItem });
                            }}
                        >
                            <FaPen /> Rename
                        </button>
                        <button
                            className="drive-btn btn-delete"
                            disabled={!selectedItem}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(selectedItem);
                            }}
                        >
                            <FaTrash /> Delete
                        </button>
                        {clipboard && (
                            <button className="drive-btn" style={{ background: '#e0e7ff', color: '#4338ca' }} onClick={(e) => { e.stopPropagation(); handlePaste(); }}>
                                <FaPaste /> Paste Item
                            </button>
                        )}
                        <button
                            className="drive-btn"
                            disabled={!selectedItem}
                            onClick={(e) => { e.stopPropagation(); setPicker({ open: true, mode: 'copy', item: selectedItem }); }}
                        >
                            <FaCopy /> Copy To
                        </button>
                        <button
                            className="drive-btn"
                            disabled={!selectedItem}
                            onClick={(e) => { e.stopPropagation(); setPicker({ open: true, mode: 'move', item: selectedItem }); }}
                        >
                            <FaMoveIcon /> Move To
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div
                className="drive-grid"
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu(null);
                    // Could show background context menu (Paste, New Folder) here
                }}
            >
                {loading && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 20 }}>Loading...</div>}

                {!loading && items.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: 40 }}>
                        This folder is empty.
                    </div>
                )}

                {!loading && items.map(item => (
                    <div
                        key={item._id}
                        className={`drive-item ${selectedItem?._id === item._id ? 'selected' : ''}`}
                        onClick={(e) => handleItemClick(e, item)}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (item.type === 'folder') navigateTo(item._id);
                            else if (item.type === 'file' && item.fileId) onPdfClick(item.fileId.filePath);
                        }}
                        onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedItem(item);
                            setContextMenu({ x: e.pageX, y: e.pageY, item });
                        }}
                    >
                        <div className={`item-icon ${item.type === 'folder' ? 'folder-icon' : 'file-icon'}`}>
                            {item.type === 'folder' ? <FaFolder /> : <FaFilePdf />}
                        </div>
                        <div className="item-name">{item.name}</div>
                    </div>
                ))}
            </div>

            {/* Storage Indicator */}
            {storageUsed !== null && (
                <div className="storage-indicator">
                    Storage Used: <strong>{formatBytes(storageUsed)}</strong>
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="context-menu"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="context-menu-item" onClick={(e) => {
                        e.stopPropagation();
                        setInputVal(contextMenu.item.name);
                        setModal({ type: 'rename', item: contextMenu.item });
                        setContextMenu(null);
                    }}>
                        <FaPen /> Rename
                    </div>
                    <div className="context-menu-item" onClick={(e) => {
                        e.stopPropagation();
                        setPicker({ open: true, mode: 'copy', item: contextMenu.item });
                        setContextMenu(null);
                    }}>
                        <FaCopy /> Copy To
                    </div>
                    <div className="context-menu-item" onClick={(e) => {
                        e.stopPropagation();
                        setPicker({ open: true, mode: 'move', item: contextMenu.item });
                        setContextMenu(null);
                    }}>
                        <FaMoveIcon /> Move To
                    </div>
                    <div className="context-menu-item" onClick={(e) => {
                        e.stopPropagation();
                        handleCut(contextMenu.item);
                        setContextMenu(null);
                    }}>
                        <FaCut /> Cut
                    </div>
                    <div className="context-menu-item delete" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(contextMenu.item);
                        setContextMenu(null);
                    }}>
                        <FaTrash /> Delete
                    </div>
                </div>
            )}

            {/* Modal */}
            {modal.type && (
                <div className="modal-overlay" onClick={() => setModal({ type: null })}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-title">
                            {modal.type === 'create_folder' ? 'Create New Folder' : 'Rename Item'}
                        </div>
                        <input
                            className="modal-input"
                            autoFocus
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    modal.type === 'create_folder' ? handleCreateFolder() : handleRename();
                                }
                            }}
                        />
                        <div className="modal-buttons">
                            <button className="btn-cancel" onClick={() => setModal({ type: null })}>Cancel</button>
                            <button
                                className="btn-confirm"
                                onClick={modal.type === 'create_folder' ? handleCreateFolder : handleRename}
                            >
                                {modal.type === 'create_folder' ? 'Create' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Folder Picker */}
            {picker.open && (
                <FolderPicker
                    userInfo={userInfo}
                    actionTitle={picker.mode === 'move' ? "Move to..." : "Copy to..."}
                    onCancel={() => setPicker({ open: false, mode: null, item: null })}
                    onSelect={handlePickerSelect}
                />
            )}
        </div>
    );
};

export default DriveExplorer;
