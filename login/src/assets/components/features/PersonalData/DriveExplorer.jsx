import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FaFolder, FaFilePdf, FaArrowLeft, FaArrowRight, FaArrowUp,
    FaPlus, FaCloudUploadAlt, FaFolderPlus, FaTrash, FaPen,
    FaCut, FaPaste, FaHome, FaCopy, FaArrowRight as FaMoveIcon, FaSearch,
    FaImage, FaFileAlt, FaVideo, FaInfoCircle,
    FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileArchive, FaFileCode, FaFileAudio,
    FaSortAmountDown, FaList, FaThLarge
} from 'react-icons/fa';
import './DriveExplorer.css';
import FolderPicker from './FolderPicker';

const DriveExplorer = ({ userInfo, onPdfClick }) => {
    const [items, setItems] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null); // ID of current folder
    const [currentFolderData, setCurrentFolderData] = useState(null); // Full object of current folder
    const [path, setPath] = useState([]); // Breadcrumb path
    const [storageUsed, setStorageUsed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const [showNewMenu, setShowNewMenu] = useState(false);

    // Sort
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
    const [showSortMenu, setShowSortMenu] = useState(false);

    // View Mode
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [showViewMenu, setShowViewMenu] = useState(false);

    // Derived sorted items
    const sortedItems = [...items].sort((a, b) => {
        if (sortConfig.key === 'name') {
            return sortConfig.direction === 'asc'
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        }
        if (sortConfig.key === 'date') {
            return sortConfig.direction === 'asc'
                ? new Date(a.createdAt) - new Date(b.createdAt)
                : new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
    });

    // Refs for file inputs
    const fileInputRef = useRef(null);
    const folderInputRef = useRef(null);

    // Debugging
    useEffect(() => {
        console.log("Current Drive Items:", items);
    }, [items]);

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
            if (folderId === 'virtual-shared-folder') {
                const params = { id: userInfo.id, role: userInfo.role, subRole: userInfo.subRole };
                const res = await axios.get('http://localhost:5001/get-materials', { params });

                const sharedDocs = res.data.materials
                    .filter(m => m.uploadedBy?.id !== userInfo.id)
                    .map(m => ({
                        _id: m._id,
                        name: m.title,
                        type: 'file',
                        isShared: true,
                        size: m.fileId?.fileSize,
                        updatedAt: m.uploadedAt,
                        fileId: m.fileId
                    }));

                setItems(sharedDocs);
                setCurrentFolderData({ _id: 'virtual-shared-folder', name: 'Shared Files', parent: null });
                setPath([]);
                setCurrentFolder(folderId);
            } else {
                const response = await axios.get('http://localhost:5001/drive/items', {
                    params: {
                        userId: userInfo.id,
                        folderId: folderId || 'null'
                    }
                });

                let list = response.data.items;
                if (!folderId) {
                    list.unshift({
                        _id: 'virtual-shared-folder',
                        name: 'Shared Files',
                        type: 'folder',
                        isSystem: true,
                        itemCount: 'Auto'
                    });
                }
                setItems(list);
                setCurrentFolderData(response.data.folder);
                setPath(response.data.path || []);
                setStorageUsed(response.data.storageUsed);
                setCurrentFolder(folderId);
            }
        } catch (error) {
            console.error("Error fetching drive items", error);
        } finally {
            setLoading(false);
        }
    };

    // Recursive Search
    useEffect(() => {
        const performSearch = async () => {
            if (!searchQuery.trim()) {
                if (currentFolder !== undefined) fetchItems(currentFolder);
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5001/drive/search', {
                    params: {
                        userId: userInfo.id,
                        query: searchQuery
                    }
                });
                setItems(response.data.items);
                // We don't change currentFolderData during search, so breadcrumbs stay
            } catch (error) {
                console.error("Search error", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            performSearch();
        }, 300); // Debounce search

        return () => clearTimeout(debounce);
    }, [searchQuery]);

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

    // --- Helpers ---
    const getFileMeta = (name) => {
        const lower = name.toLowerCase();
        // PDF
        if (lower.endsWith('.pdf')) return { icon: <FaFilePdf style={{ color: '#ef4444' }} />, label: 'PDF Document' };
        // Word
        if (lower.match(/\.(doc|docx)$/)) return { icon: <FaFileWord style={{ color: '#2563eb' }} />, label: 'Word Document' };
        // Excel
        if (lower.match(/\.(xls|xlsx|csv)$/)) return { icon: <FaFileExcel style={{ color: '#16a34a' }} />, label: 'Excel Spreadsheet' };
        // PowerPoint
        if (lower.match(/\.(ppt|pptx)$/)) return { icon: <FaFilePowerpoint style={{ color: '#ea580c' }} />, label: 'PowerPoint Presentation' };
        // Images
        if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return { icon: <FaImage style={{ color: '#3b82f6' }} />, label: 'Image File' };
        // Video
        if (lower.match(/\.(mp4|mov|avi|mkv|webm)$/)) return { icon: <FaVideo style={{ color: '#8b5cf6' }} />, label: 'Video File' };
        // Audio
        if (lower.match(/\.(mp3|wav|ogg|m4a)$/)) return { icon: <FaFileAudio style={{ color: '#ec4899' }} />, label: 'Audio File' };
        // Code
        if (lower.match(/\.(js|jsx|html|css|json|java|py|c|cpp|ts|tsx)$/)) return { icon: <FaFileCode style={{ color: '#6366f1' }} />, label: 'Source Code' };
        // Archive
        if (lower.match(/\.(zip|rar|7z|tar|gz)$/)) return { icon: <FaFileArchive style={{ color: '#f59e0b' }} />, label: 'Archive File' };
        // Text
        if (lower.match(/\.(txt|md|log)$/)) return { icon: <FaFileAlt style={{ color: '#9ca3af' }} />, label: 'Text Document' };

        return { icon: <FaFileAlt style={{ color: '#9ca3af' }} />, label: `${name.split('.').pop().toUpperCase()} File` };
    };

    const getFileIcon = (name) => getFileMeta(name).icon;

    // --- Selection ---
    const handleItemClick = (e, item) => {
        e.stopPropagation();
        // If clicking same item, toggle? No, standard is select.
        setSelectedItem(item);
    };

    const handleBoxClick = () => {
        setSelectedItem(null);
        setContextMenu(null);
        setShowNewMenu(false);
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

        let newName = inputVal.trim();
        const oldName = modal.item.name;

        // Preserve extension for files if user didn't type it
        if (modal.item.type === 'file' && oldName.includes('.')) {
            const ext = oldName.split('.').pop();
            // If new name has no dot, append original extension
            if (!newName.includes('.')) {
                newName = `${newName}.${ext}`;
            }
        }

        try {
            await axios.put(`http://localhost:5001/drive/rename/${modal.item._id}`, {
                newName: newName
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
        if (item.isSystem) {
            alert("Cannot delete system folder.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        try {
            if (item.isShared) {
                await axios.post('http://localhost:5001/hide-shared-material', {
                    materialId: item._id,
                    userId: userInfo.id
                });
            } else {
                await axios.delete(`http://localhost:5001/drive/delete/${item._id}`);
            }
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
            if (clipboard.item.isShared) {
                await axios.post('http://localhost:5001/copy-shared-to-drive', {
                    materialId: clipboard.item._id,
                    targetFolderId: currentFolder || 'root',
                    userId: userInfo.id
                });
                if (clipboard.action === 'move') {
                    await axios.post('http://localhost:5001/hide-shared-material', {
                        materialId: clipboard.item._id,
                        userId: userInfo.id
                    });
                }
            } else {
                await axios.put(`http://localhost:5001/drive/move/${clipboard.item._id}`, {
                    newParentId: currentFolder
                });
            }
            setClipboard(null);
            fetchItems(currentFolder);
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            } else {
                alert('Action failed');
            }
        }
    };

    // 7. Picker Actions
    const handlePickerSelect = async (targetFolderId) => {
        if (!picker.item) return;

        try {
            if (picker.item.isShared) {
                await axios.post('http://localhost:5001/copy-shared-to-drive', {
                    materialId: picker.item._id,
                    targetFolderId,
                    userId: userInfo.id
                });
                if (picker.mode === 'move') {
                    await axios.post('http://localhost:5001/hide-shared-material', {
                        materialId: picker.item._id,
                        userId: userInfo.id
                    });
                }
            } else {
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

    // View All State
    const [showAllFolders, setShowAllFolders] = useState(false);

    // --- Render Helpers ---
    const renderBreadcrumbs = () => {
        if (searchQuery.trim()) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                        onClick={() => { setSearchQuery(''); navigateTo(null); }}
                        style={{ cursor: 'pointer', color: '#6b7280', fontWeight: '500' }}
                    >
                        My Data
                    </span>
                    <span style={{ color: '#9ca3af' }}>{'>'}</span>
                    <span style={{ fontWeight: '600', color: '#111827' }}>Search Results: "{searchQuery}"</span>
                </div>
            );
        }

        // If at root
        if (!currentFolder) {
            return <div style={{ fontWeight: '700', color: '#111827' }}>My Data</div>;
        }

        // Use path
        const items = [];
        // Root node
        items.push(
            <span
                key="root"
                onClick={() => navigateTo(null)}
                style={{ cursor: 'pointer', color: '#6b7280', fontWeight: '500' }}
            >
                My Data
            </span>
        );

        if (path && path.length > 0) {
            // Filter out any path item that is "My Data" to prevent duplication with root
            const cleanPath = path.filter(p => p.name.toLowerCase() !== 'my data');

            cleanPath.forEach((folder, index) => {
                items.push(<span key={`sep-${index}`} style={{ color: '#9ca3af' }}>{'>'}</span>);
                const isLast = index === cleanPath.length - 1;
                items.push(
                    <span
                        key={folder._id}
                        onClick={() => !isLast && navigateTo(folder._id)}
                        style={{
                            cursor: isLast ? 'default' : 'pointer',
                            color: isLast ? '#111827' : '#6b7280',
                            fontWeight: isLast ? '700' : '500'
                        }}
                    >
                        {folder.name}
                    </span>
                );
            });
        } else if (currentFolderData && currentFolderData.name.toLowerCase() !== 'my data') {
            // Fallback if path empty but we have folder data
            items.push(<span key="sep-fallback" style={{ color: '#9ca3af' }}>{'>'}</span>);
            items.push(<span key="fallback" style={{ fontWeight: '700', color: '#111827' }}>{currentFolderData.name}</span>);
        }

        return <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>{items}</div>;
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getBreadcrumbString = () => {
        if (!path || path.length === 0) return 'My Data';
        const names = path.map(p => p.name);
        return names.join(' > ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="std-page-container" onClick={handleBoxClick}>
            {/* Header / Navigation */}
            <div className="drive-header-remastered">
                <div className="nav-controls">
                    <div className="nav-row">
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleBack(); }} disabled={historyIndex === 0} title="Back">
                            <FaArrowLeft />
                        </button>
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleForward(); }} disabled={historyIndex === history.length - 1} title="Forward">
                            <FaArrowRight />
                        </button>
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleUp(); }} disabled={!currentFolder || searchQuery} title="Up One Level">
                            <FaArrowUp />
                        </button>
                        <button className="nav-btn" onClick={(e) => { e.stopPropagation(); handleHome(); }} disabled={!currentFolder || searchQuery} title="Home">
                            <FaHome />
                        </button>
                    </div>

                    <div className="breadcrumbs-modern">
                        <span className="crumb-icon"><FaFolder /></span>
                        {renderBreadcrumbs()}
                    </div>
                </div>

                <div className="drive-search-modern">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search My Data"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                    )}
                </div>
            </div>

            <div className="toolbar-row" style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '10px', marginBottom: '10px' }}>
                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <button
                        className="drive-btn new-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowNewMenu(!showNewMenu);
                            setContextMenu(null);
                        }}
                    >
                        <FaPlus /> New
                    </button>

                    {showNewMenu && (
                        <div className="new-dropdown-menu">
                            <div className="new-menu-item" onClick={(e) => {
                                e.stopPropagation();
                                setInputVal('');
                                setModal({ type: 'create_folder' });
                                setShowNewMenu(false);
                            }}>
                                <FaFolderPlus /> New Folder
                            </div>
                            <div className="new-menu-divider"></div>
                            <div className="new-menu-item" onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current.click();
                                setShowNewMenu(false);
                            }}>
                                <FaCloudUploadAlt /> File Upload
                            </div>
                            <div className="new-menu-item" onClick={(e) => {
                                e.stopPropagation();
                                folderInputRef.current.click();
                                setShowNewMenu(false);
                            }}>
                                <FaFolder /> Folder Upload
                            </div>
                        </div>
                    )}

                    {/* Hidden Inputs */}
                    <input type="file" multiple hidden ref={fileInputRef} onChange={handleUploadFiles} />
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

                {/* Sort Button */}
                <div className="toolbar-group" style={{ position: 'relative' }}>
                    <button
                        className="drive-btn"
                        onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); setShowViewMenu(false); }}
                    >
                        <FaSortAmountDown /> Sort by
                    </button>

                    {showSortMenu && (
                        <div className="new-dropdown-menu" style={{ width: '180px', right: 0, left: 'auto' }}>
                            <div className="new-menu-item" onClick={() => { setSortConfig({ key: 'name', direction: 'asc' }); setShowSortMenu(false); }}>
                                Name (A-Z) {sortConfig.key === 'name' && sortConfig.direction === 'asc' && '✓'}
                            </div>
                            <div className="new-menu-item" onClick={() => { setSortConfig({ key: 'name', direction: 'desc' }); setShowSortMenu(false); }}>
                                Name (Z-A) {sortConfig.key === 'name' && sortConfig.direction === 'desc' && '✓'}
                            </div>
                            <div className="new-menu-divider"></div>
                            <div className="new-menu-item" onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }); setShowSortMenu(false); }}>
                                Date (Newest) {sortConfig.key === 'date' && sortConfig.direction === 'desc' && '✓'}
                            </div>
                            <div className="new-menu-item" onClick={() => { setSortConfig({ key: 'date', direction: 'asc' }); setShowSortMenu(false); }}>
                                Date (Oldest) {sortConfig.key === 'date' && sortConfig.direction === 'asc' && '✓'}
                            </div>
                        </div>
                    )}
                </div>

                {/* View Toggle Button */}
                <div className="toolbar-group" style={{ position: 'relative', borderRight: 'none' }}>
                    <button
                        className="drive-btn"
                        onClick={(e) => { e.stopPropagation(); setShowViewMenu(!showViewMenu); setShowSortMenu(false); }}
                    >
                        {viewMode === 'grid' ? <FaThLarge /> : <FaList />} View
                    </button>

                    {showViewMenu && (
                        <div className="new-dropdown-menu" style={{ width: '150px', right: 0, left: 'auto' }}>
                            <div className="new-menu-item" onClick={() => { setViewMode('grid'); setShowViewMenu(false); }}>
                                <FaThLarge /> Grid {viewMode === 'grid' && '✓'}
                            </div>
                            <div className="new-menu-item" onClick={() => { setViewMode('list'); setShowViewMenu(false); }}>
                                <FaList /> List {viewMode === 'list' && '✓'}
                            </div>
                        </div>
                    )}
                </div>
            </div>


            {/* Grid */}
            {/* Main Content Area */}
            <div className="drive-content-scroll" onClick={handleBoxClick} onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
            }}>
                {loading && <div className="loading-state">Loading...</div>}

                {!loading && items.length === 0 && (
                    <div className="empty-state">
                        {searchQuery ? "No results found." : "This folder is empty."}
                    </div>
                )}

                {!loading && items.length > 0 && (
                    (() => {
                        const folders = items.filter(i => i.type === 'folder');
                        const files = items.filter(i => i.type === 'file');
                        const isRoot = !currentFolder && !searchQuery; // Treat search results like a flat list or folder view

                        // Unified View for ALL folders (Root or Sub)
                        return (
                            <>
                                {/* Item count removed from here, moved to toolbar */}
                                {viewMode === 'grid' ? (
                                    <div className="folders-grid" style={{ marginTop: '20px' }}>
                                        {sortedItems.map(item => (
                                            <div
                                                key={item._id}
                                                className={`folder-card ${selectedItem?._id === item._id ? 'selected' : ''}`}
                                                onClick={(e) => handleItemClick(e, item)}
                                                onDoubleClick={(e) => {
                                                    e.stopPropagation();
                                                    if (item.type === 'folder') navigateTo(item._id);
                                                    else if (item.type === 'file' && item.fileId) onPdfClick(item.fileId.filePath, item.fileId.fileType, item.name);
                                                }}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedItem(item);
                                                    setContextMenu({ x: e.pageX, y: e.pageY, item });
                                                }}
                                            >
                                                <div className="folder-card-icon">
                                                    {item.type === 'folder' ? <FaFolder /> : getFileMeta(item.name).icon}
                                                </div>
                                                <div className="folder-card-name" title={item.name}>{item.name}</div>
                                                <div className="folder-card-details">
                                                    {item.type === 'folder'
                                                        ? `${item.itemCount || '0'} items`
                                                        : formatBytes(item.size || (item.fileId && item.fileId.fileSize) || 0)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // List View
                                    <div className="files-list-container" style={{ marginTop: '20px' }}>
                                        <div className="files-list-header">
                                            <div className="fl-col fl-name">Name</div>
                                            <div className="fl-col fl-date">Date Modified</div>
                                            <div className="fl-col fl-size">Size</div>
                                        </div>
                                        <div className="files-list-body">
                                            {sortedItems.map(item => (
                                                <div
                                                    key={item._id}
                                                    className={`file-row ${selectedItem?._id === item._id ? 'selected' : ''}`}
                                                    onClick={(e) => handleItemClick(e, item)}
                                                    onDoubleClick={(e) => {
                                                        e.stopPropagation();
                                                        if (item.type === 'folder') navigateTo(item._id);
                                                        else if (item.type === 'file' && item.fileId) onPdfClick(item.fileId.filePath, item.fileId.fileType, item.name);
                                                    }}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedItem(item);
                                                        setContextMenu({ x: e.pageX, y: e.pageY, item });
                                                    }}
                                                >
                                                    <div className="fl-col fl-name">
                                                        <div className="file-icon-small">
                                                            {item.type === 'folder' ? <FaFolder style={{ color: '#fbbf24', fontSize: '18px' }} /> : getFileMeta(item.name).icon}
                                                        </div>
                                                        <span>{item.name}</span>
                                                    </div>
                                                    <div className="fl-col fl-date">{formatDate(item.updatedAt || item.createdAt)}</div>
                                                    <div className="fl-col fl-size">
                                                        {item.type === 'folder' ? `${item.itemCount || '0'} items` : formatBytes(item.size || (item.fileId && item.fileId.fileSize) || 0)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()
                )}
            </div >

            {/* Storage Indicator */}
            {
                storageUsed !== null && (
                    <div className="storage-footer">
                        <div className="storage-bar">
                            <div className="storage-fill" style={{ width: `${Math.min((storageUsed / (1024 * 1024 * 100)) * 100, 100)}%` }}></div>
                        </div>
                        <span>{formatBytes(storageUsed)} used</span>
                    </div>
                )
            }

            {/* Context Menu */}
            {
                contextMenu && (
                    <div
                        className="context-menu"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        {/* Properties - Only for Files */}
                        {contextMenu.item.type === 'file' && (
                            <div className="context-menu-item" onClick={(e) => {
                                e.stopPropagation();
                                setModal({ type: 'properties', item: contextMenu.item });
                                setContextMenu(null);
                            }}>
                                <FaInfoCircle /> Properties
                            </div>
                        )}
                        {contextMenu.item.type === 'file' && <div className="new-menu-divider"></div>}

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
                )
            }

            {/* Modal: Create/Rename */
                (modal.type === 'create_folder' || modal.type === 'rename') && (
                    <div className="std-modal-overlay" onClick={() => setModal({ type: null })}>
                        <div className="std-modal" onClick={e => e.stopPropagation()}>
                            <div className="std-modal-header">
                                <h3 className="std-modal-title">
                                    {modal.type === 'create_folder' ? 'Create New Folder' : 'Rename Item'}
                                </h3>
                                <button className="std-close-btn" onClick={() => setModal({ type: null })}>×</button>
                            </div>
                            <div className="std-modal-body">
                                <input
                                    className="std-input"
                                    autoFocus
                                    value={inputVal}
                                    onChange={(e) => setInputVal(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            modal.type === 'create_folder' ? handleCreateFolder() : handleRename();
                                        }
                                    }}
                                    placeholder={modal.type === 'create_folder' ? "Folder name" : "New name"}
                                />
                            </div>
                            <div className="std-modal-footer">
                                <button className="std-btn-secondary" onClick={() => setModal({ type: null })}>Cancel</button>
                                <button
                                    className="std-btn"
                                    onClick={modal.type === 'create_folder' ? handleCreateFolder : handleRename}
                                >
                                    {modal.type === 'create_folder' ? 'Create' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Modal: Properties */
                modal.type === 'properties' && modal.item && (
                    <div className="std-modal-overlay" onClick={() => setModal({ type: null })}>
                        <div className="std-modal" onClick={e => e.stopPropagation()}>
                            <div className="std-modal-header">
                                <h3 className="std-modal-title">File Properties</h3>
                                <button className="std-close-btn" onClick={() => setModal({ type: null })}>×</button>
                            </div>

                            <div className="std-modal-body">
                                <div className="props-icon-preview">
                                    {getFileIcon(modal.item.name)}
                                </div>
                                <div className="props-name">{modal.item.name}</div>

                                <div className="props-details-grid">
                                    <div className="props-label">Type:</div>
                                    <div className="props-value">{getFileMeta(modal.item.name).label}</div>

                                    <div className="props-label">Size:</div>
                                    <div className="props-value">{formatBytes(modal.item.size || (modal.item.fileId && modal.item.fileId.fileSize) || 0)}</div>

                                    <div className="props-label">Location:</div>
                                    <div className="props-value">{getBreadcrumbString()}</div>

                                    <div className="props-label">Created:</div>
                                    <div className="props-value">{formatDate(modal.item.createdAt)}</div>

                                    <div className="props-label">Modified:</div>
                                    <div className="props-value">{formatDate(modal.item.updatedAt || modal.item.createdAt)}</div>
                                </div>
                            </div>

                            <div className="std-modal-footer">
                                <button className="std-btn-secondary" onClick={() => setModal({ type: null })}>Close</button>
                            </div>
                        </div>
                    </div>
                )}
            {/* Folder Picker */}
            {
                picker.open && (
                    <FolderPicker
                        userInfo={userInfo}
                        actionTitle={picker.mode === 'move' ? "Move to..." : "Copy to..."}
                        onCancel={() => setPicker({ open: false, mode: null, item: null })}
                        onSelect={handlePickerSelect}
                    />
                )
            }
        </div >
    );
};

export default DriveExplorer;
