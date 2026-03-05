import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaUndo } from 'react-icons/fa';

const FileViewer = ({ fileUrl, fileType, fileName, onClose }) => {
    // Determine if it is an image
    // If fileType is provided, check mimetype. If not, check extension from fileName or url.
    const isImage = React.useMemo(() => {
        if (fileType && fileType.startsWith('image/')) return true;
        if (fileName && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName)) return true;
        if (fileUrl && /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileUrl)) return true;
        return false;
    }, [fileType, fileName, fileUrl]);

    // --- IMAGE VIEWER STATE ---
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState(null); // Relative position for dragging

    const imgRef = useRef(null);
    const containerRef = useRef(null);

    // Reset Zoom on Open
    useEffect(() => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    }, [fileUrl]);

    // --- KEYBOARD & WHEEL HANDLERS ---
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
            if (isImage) {
                if (event.key === '+' || event.key === '=') handleZoom(0.1);
                if (event.key === '-') handleZoom(-0.1);
                if (event.key === '0') resetZoom();
            }
        };

        const handleWheel = (event) => {
            if (isImage) {
                // Prevent page scrolling if we are zooming
                // But only if we are hovering over the viewer? handled by event.target check usually
                // Here we attach to document, so might be aggressive. 
                // Better to attach onWheel to the container.
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isImage, scale]);


    // --- ZOOM LOGIC ---
    const handleZoom = (delta) => {
        setScale(prev => {
            const newScale = Math.max(0.5, Math.min(5, prev + delta)); // Min 0.5x, Max 5x
            return newScale;
        });
    };

    const resetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // --- PAN (DRAG) LOGIC ---
    const onMouseDown = (e) => {
        if (scale <= 1) return; // Only drag if zoomed in
        if (e.button !== 0) return; // Only left click
        setDragging(true);
        setRel({
            x: e.pageX - position.x,
            y: e.pageY - position.y
        });
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!dragging) return;
        setPosition({
            x: e.pageX - rel.x,
            y: e.pageY - rel.y
        });
        e.preventDefault();
    };

    const onMouseUp = () => {
        setDragging(false);
    };

    const onWheel = (e) => {
        if (!isImage) return;
        // e.deltaY > 0 means scroll down (zoom out)
        // e.deltaY < 0 means scroll up (zoom in)
        const delta = e.deltaY * -0.001;
        handleZoom(delta * 5); // Adjust sensitivity
    };

    // Render Image Viewer
    const renderImageViewer = () => (
        <div
            className="image-viewer-container"
            ref={containerRef}
            onWheel={onWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            style={{
                width: '100%',
                height: 'calc(100% - 50px)',
                overflow: 'hidden',
                backgroundColor: '#111',
                position: 'relative',
                cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="image-toolbar" style={{
                position: 'absolute',
                bottom: '30px', // Moved to bottom for better ergonomics
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex',
                gap: '12px',
                background: 'rgba(25, 25, 25, 0.75)', // Darker, sleeker background
                padding: '10px 20px',
                borderRadius: '50px', // Pill shape
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                alignItems: 'center'
            }}>
                <button
                    className="viewer-btn"
                    onClick={() => handleZoom(0.25)}
                    title="Zoom In (+)"
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaSearchPlus />
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                <button
                    className="viewer-btn"
                    onClick={() => handleZoom(-0.25)}
                    title="Zoom Out (-)"
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaSearchMinus />
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                <button
                    className="viewer-btn"
                    onClick={resetZoom}
                    title="Reset (0)"
                    style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <FaUndo />
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>
                <span style={{ color: '#e0e0e0', fontSize: '14px', fontFamily: 'monospace', minWidth: '40px', textAlign: 'center' }}>
                    {Math.round(scale * 100)}%
                </span>
            </div>

            <img
                ref={imgRef}
                src={fileUrl}
                alt={fileName || "View"}
                style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    transition: dragging ? 'none' : 'transform 0.1s ease-out', // Smooth zoom, instant drag
                    userSelect: 'none',
                    pointerEvents: 'none' // Let events pass to container for dragging
                }}
            />
        </div>
    );

    return (
        <div className="std-modal-overlay" style={{ zIndex: 2000 }}>
            <div className="std-modal" style={{ width: '95%', height: '95vh', maxWidth: '1400px', display: 'flex', flexDirection: 'column', backgroundColor: isImage ? '#1e1e1e' : '#fff' }}>
                <div className="std-modal-header" style={{ borderBottom: isImage ? '1px solid #333' : '', background: isImage ? '#1e1e1e' : '#fff', color: isImage ? '#fff' : '#000' }}>
                    <h3 className="std-modal-title" style={{ color: isImage ? 'white' : 'inherit' }}>
                        {fileName || (isImage ? "Image View" : "PDF View")}
                    </h3>
                    <button className="std-close-btn" onClick={onClose} style={{ color: isImage ? 'white' : 'inherit' }}>
                        <FaTimes />
                    </button>
                </div>

                <div className="std-modal-body" style={{ padding: 0, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {isImage ? renderImageViewer() : (
                        <object
                            data={fileUrl}
                            type={(typeof fileType === 'string' && fileType) ? fileType : "application/pdf"}
                            className="pdf-object"
                            style={{ width: '100%', height: '100%' }}
                        >
                            {/* Fallback for files that cannot be embedded (like Word docs, or if PDF fails) */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center', color: '#333' }}>
                                <div style={{ fontSize: '48px', marginBottom: '20px', color: '#ccc' }}>
                                    <span role="img" aria-label="document">📄</span>
                                </div>
                                <h3 style={{ marginBottom: '10px' }}>Preview Not Available</h3>
                                <p style={{ marginBottom: '20px', maxWidth: '300px' }}>
                                    This file type ({fileType || 'Unknown'}) cannot be displayed directly in the browser.
                                </p>
                                <a href={fileUrl} className="std-btn">
                                    Download to View
                                </a>
                            </div>
                        </object>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileViewer;
