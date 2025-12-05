import React from 'react';
import RenderHome from "../render-content/render-home";  // Fixing the import name
import Content from "../Content/Content";

function HmbsFaculty() {
    return (
        <>
            <RenderHome />  {/* Using the correct component name */}
            <Content />
        </>
    );
}

export default HmbsFaculty;
