import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';
import './FolderPicker.css';

const FolderPicker = ({ userInfo, onCancel, onSelect, actionTitle }) => {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null); // null means Root
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    const fetchFolders = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/drive/folders`, {
                params: { userId: userInfo.id }
            });
            setFolders(response.data.folders);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Build tree
    const buildTree = (parentId) => {
        return folders
            .filter(f => (f.parent || null) === parentId)
            .map(f => ({
                ...f,
                children: buildTree(f._id)
            }));
    };

    const rootChildren = buildTree(null);

    const renderTree = (nodes, depth = 0) => {
        return nodes.map(node => (
            <React.Fragment key={node._id}>
                <div
                    className={`picker-folder-item ${selectedFolderId === node._id ? 'selected' : ''}`}
                    style={{ paddingLeft: `${depth * 20 + 10}px` }}
                    onClick={() => setSelectedFolderId(node._id)}
                >
                    {selectedFolderId === node._id ? <FaFolderOpen /> : <FaFolder />}
                    <span>{node.name}</span>
                </div>
                {renderTree(node.children, depth + 1)}
            </React.Fragment>
        ));
    };

    return (
        <div className="std-modal-overlay">
            <div className="std-modal" style={{ width: '450px', height: '500px' }}>
                <div className="std-modal-header">
                    <h3 className="std-modal-title">{actionTitle || "Select Destination"}</h3>
                </div>
                <div className="std-modal-body">
                    {loading ? <p>Loading...</p> : (
                        <>
                            <div
                                className={`picker-folder-item ${selectedFolderId === null ? 'selected' : ''}`}
                                onClick={() => setSelectedFolderId(null)}
                            >
                                <FaFolder /> <span>My Data (Root)</span>
                            </div>
                            {renderTree(rootChildren)}
                        </>
                    )}
                </div>
                <div className="std-modal-footer">
                    <button className="std-btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className="std-btn"
                        onClick={() => onSelect(selectedFolderId)}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FolderPicker;
